# RestaurantOS — Business Workflows

Version: 1.0
Last updated: Step 6

Precise rules for orders, payments, inventory, reservations, kitchen.
This document is the source of truth for state machines, transactions, and idempotency.
Where a rule is enforceable at DB level, that is stated. Where only app level, it is stated.

---

## 1. Order lifecycle

### 1.1 States
- `pending_confirmation` — created, awaiting restaurant accept or payment.
- `accepted` — restaurant confirmed, queued for kitchen.
- `preparing` — kitchen working.
- `ready` — cooked, awaiting handoff/pickup/serve.
- `completed` — handed off; terminal.
- `rejected` — restaurant declined; terminal.
- `cancelled` — cancelled by customer or staff; terminal.

### 1.2 Allowed transitions

| From | To | Actor | Notes |
|---|---|---|---|
| pending_confirmation | accepted | Kitchen, Manager, Owner | May require payment = paid if policy = "pay before accept" |
| pending_confirmation | rejected | Manager, Owner | Reason required |
| pending_confirmation | cancelled | Customer (before accept), Manager | |
| accepted | preparing | Kitchen | |
| accepted | cancelled | Manager | Only if kitchen not started |
| preparing | ready | Kitchen | |
| preparing | cancelled | Manager | Requires reason, may trigger refund |
| ready | completed | Kitchen, Cashier | |
| ready | cancelled | Manager | Rare; requires reason |
| completed | — | — | terminal |
| rejected | — | — | terminal |
| cancelled | — | — | terminal |

Any other transition → `409 INVALID_TRANSITION`.

### 1.3 Payment policy (per restaurant setting)
- `pay_at_checkout` — payment must succeed before `accepted`.
- `pay_at_pickup` — `accepted` allowed with payment `unpaid`; `completed` requires `paid`.
- `pay_on_delivery` — same as pickup, for delivery.

Policy stored in `restaurant_settings.payment_policy`.

### 1.4 Rules
- Every transition writes an `order_events` row: `(order_id, from_state, to_state, actor_user_id, reason, created_at)`.
- Transition is a transaction: `SELECT ... FOR UPDATE` on the order row, validate, update, insert event, commit.
- Only after commit: publish Ably event `order.<state>`.
- Idempotency: repeated transition request with same `(order_id, to_state, idempotency_key)` returns the existing result.
- Historical snapshot: `orders` stores `subtotal_minor`, `tax_minor`, `discount_minor`, `total_minor`, `currency`, and per-line snapshots at creation — never recomputed after.

### 1.5 Order creation (transaction)
1. Validate cart items: exist, available, belong to restaurant/branch.
2. Recompute prices server-side from DB (ignore client prices).
3. Apply discount (if any), compute tax, rounding policy from restaurant settings.
4. Insert `orders` (state `pending_confirmation`), `order_items`, `order_item_modifiers`.
5. Insert `idempotency_keys` row keyed by `(restaurant_id, idempotency_key)`.
6. If payment policy = `pay_at_checkout`: create payment (Stripe test or simulated), return checkout redirect.
7. Commit → publish `order.created` (only after payment confirmed for pay-before policy; publish on order creation for pay-later policies so KDS sees it).

### 1.6 Cancellation and refund
- Cancellation allowed only from `pending_confirmation`, `accepted`, `preparing`, `ready` (with policy checks).
- If payment = `paid` → create refund via provider; payment state → `refunded` or `partially_refunded`.
- If inventory already deducted → compensating stock movements (see §3).
- Refund amount = policy: full by default; partial only if manager specifies.

---

## 2. Payment lifecycle

### 2.1 States
- `unpaid`
- `pending`
- `paid`
- `failed`
- `partially_refunded`
- `refunded`

### 2.2 Rules
- Order state and payment state are **independent**. `accepted` may exist with `unpaid` if policy allows.
- Payment provider = `stripe_test` or `simulated`. Chosen by `PAYMENT_MODE` env: `stripe_test` | `simulated`.
- `stripe_test` requires `sk_test_…`. If `sk_live_…` detected → refuse to start with clear error.
- Every payment change writes `payment_events` row.
- Idempotency: `(order_id, idempotency_key)` unique on `payments`.
- Webhook:
  - Verify signature.
  - Deduplicate by provider event id in `payment_events`.
  - Update payment state only if transition valid (`pending → paid`, `pending → failed`, `paid → partially_refunded/refunded`).
  - Never trust browser redirect as proof of payment; only webhook does.
- Refund: validate `paid` state, call provider, record `refunds` row, update payment state.

### 2.3 Simulated adapter
- Deterministic: card token `sim_ok` → paid; `sim_fail` → failed; `sim_pending` → stays pending (for testing KDS vs payment race).
- No external calls. Used by tests and when Stripe not configured.

---

## 3. Inventory workflow

### 3.1 Model
- Stock is a **ledger** of `stock_movements`, never a mutable balance overwrite.
- Balance = `SUM(quantity_delta)` per `(ingredient_id, branch_id)` — computed or cached, never written directly.
- Each movement: `(id, ingredient_id, branch_id, quantity_delta, unit, reason, source_type, source_id, created_by, created_at)`.
- `reason`: `order_consumption` | `order_reversal` | `purchase_receive` | `waste` | `adjustment` | `initial`.
- `source_type` + `source_id` allow idempotency: `(source_type, source_id, ingredient_id, reason)` unique.

### 3.2 Deduction trigger
Configurable per restaurant:
- `on_accept` — deduct when order → `accepted`. **Default.**
- `on_complete` — deduct when order → `completed`.

Setting: `restaurant_settings.inventory_deduct_on`.

### 3.3 Deduction algorithm (transaction)
1. Load recipes for each `order_item` (item + variant + modifiers mapped).
2. Sum required quantities per ingredient.
3. Apply unit conversions to base unit of each ingredient.
4. For each ingredient:
   - Check current balance.
   - If policy = `block` and balance < required → rollback whole transaction, order acceptance fails with `INSUFFICIENT_STOCK` (include ingredient + shortfall).
   - If policy = `allow_negative` → proceed with negative balance.
5. Insert one `stock_movements` row per ingredient with `reason=order_consumption`, `source_type=order`, `source_id=<order_id>`.
6. Commit. Publish `inventory.low_stock` for any ingredient crossing its threshold.

Idempotency: unique constraint prevents duplicate rows for same order.

### 3.4 Reversal
- On cancellation after deduction: for each deduction movement, insert a reversing movement with `reason=order_reversal`, `source_type=order_cancel`, `source_id=<order_id>`.
- Same idempotency constraint applies.

### 3.5 Low-stock alert
- Threshold per ingredient per branch: `ingredients.low_stock_threshold` (nullable → no alert).
- After every movement, if `balance <= threshold` and previous > threshold → publish `inventory.low_stock`.
- Do not spam: only on threshold crossing (up or down).

### 3.6 Insufficient stock policy
- `block` (default) — reject order acceptance; KDS shows reason.
- `allow_negative` — accept and record negative balance; manager sees warning.

---

## 4. Reservation workflow

### 4.1 Booking (transaction)
1. Resolve branch, timezone, opening hours.
2. Validate: date ≥ today, time within service hours, party size ≤ branch capacity.
3. Check availability: any free table with `capacity ≥ party_size` and no overlapping reservation.
4. Insert `reservations` row + `reservation_tables` link.
5. Commit. Send confirmation (preview by default).
6. Publish `reservation.updated` (tenant + branch channel).

### 4.2 Overlap prevention
- Enforced by transaction isolation + unique partial index or explicit `SELECT ... FOR UPDATE` on candidate tables.
- Two concurrent bookings for the last table → one succeeds, other gets `409 NO_AVAILABILITY` with alternative times.
- Reservation holds the table for `duration_minutes` (default 90, configurable) starting at `time`.

### 4.3 Cancellation
- Customer can cancel up to `cancellation_cutoff_hours` (default 2) before reservation time. Enforced server-side.
- Manager/owner can cancel anytime with reason.
- Writes `reservation_events` row. Sends cancellation email (preview).

### 4.4 No-show
- Manager marks `no_show` after grace window (configurable, default 15 min).
- Writes `reservation_events` row. Reservation state → `no_show` (terminal).

### 4.5 States
`pending` → `confirmed` → `seated` → `completed` → (terminal)
`confirmed` → `cancelled` | `no_show` → (terminal)
`pending` → `cancelled`

---

## 5. Kitchen workflow

- KDS shows orders in state `accepted` and `preparing` for the user's branch.
- Ordering: by `accepted_at` ascending (oldest first) by default; configurable to priority-weighted.
- Timers: elapsed since `accepted_at`, refreshed every second client-side. Server timestamps only.
- Accept action = order `pending_confirmation → accepted` transition (idempotent).
- Reject action requires reason; order → `rejected`; optional auto-refund if paid.
- Bump (ready → completed) closes the order and triggers analytics finalization + inventory `on_complete` if configured.
- Real-time: KDS subscribes to `orders:branch:<branchId>`. On reconnect: fetch current orders, then subscribe; merge by `updated_at`.

---

## 6. Discounts (v1)

- Discount codes scoped to restaurant; optional branch restriction.
- Fields: `code`, `type` (percent|fixed), `value`, `min_order_minor`, `max_uses`, `max_uses_per_customer`, `starts_at`, `ends_at`, `active`.
- Redemption in `discount_redemptions`; unique `(discount_id, order_id)`.
- Applied server-side during order creation, never trusted from client.
- If max_uses reached → `409 DISCOUNT_EXHAUSTED`.
- Discounts do not affect tax base in this build (tax is computed on the discounted subtotal; documented policy).

---

## 7. Audit and notifications

- Every state-changing action on orders, reservations, memberships, refunds → `audit_logs` row: `(actor_user_id, restaurant_id, action, entity, entity_id, metadata, created_at)`.
- Notifications (v1): per-user preferences stored in `notification_preferences`. Default: order events on, marketing never.
- Emails via Resend only for: order confirmation, reservation confirmation/cancellation, password reset, staff invitation. Default `EMAIL_MODE=preview` — no emails sent; rendered to disk.
- Ably publish only after commit, one event per business change.

---

## 8. Tenant resolution (every workflow)

1. Authenticate user (session cookie).
2. Resolve `restaurant_id` from URL path or body — **only as a lookup hint**.
3. Look up `restaurant_memberships` for `(user_id, restaurant_id)`.
4. If missing → `404 NOT_FOUND` (do not reveal existence).
5. If role does not permit the action per Step 7 matrix → `404` (same response).
6. Branch scope: if role is branch-scoped, filter rows by `branch_id ∈ user's assigned branches`.
7. All queries carry `restaurant_id` in `WHERE` — never rely on joins alone.

Any endpoint that skips this is a security bug and must fail Step 98 tests.

---

## 9. Time rules

- All DB timestamps in UTC (`timestamptz`).
- Restaurant/branch has IANA timezone (`restaurant_settings.timezone`).
- Display converts to branch TZ.
- "Today" queries are computed in branch TZ, converted to UTC range before querying.
- Opening hours stored as `(day_of_week, open_time, close_time)` in branch TZ; reservations and "is open" checks use branch TZ.

---

## 10. Rounding & tax

- Currency: integer minor units. Default currency per restaurant (`ISO 4217`, e.g. `USD`, `EUR`).
- Tax: `restaurant_settings.tax_rate_bps` (basis points, e.g. 825 = 8.25%).
- Line subtotal = `unit_price_minor * quantity` (integer).
- Order subtotal = sum of line subtotals, in integers.
- Discount applied to subtotal (integer).
- Tax computed on discounted subtotal: `round(subtotal_after_discount * tax_rate_bps / 10000)` using banker's rounding; result integer minor.
- Total = subtotal_after_discount + tax (+ delivery fee if applicable, integer).
- All rounding documented in code; tests in Step 51 lock behavior.