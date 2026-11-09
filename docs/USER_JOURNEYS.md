# RestaurantOS — User Journeys

Version: 1.0
Last updated: Step 2

Journeys reference personas from docs/PERSONAS.md.
Format: Trigger → Steps → Systems touched → Success → Failure modes.

---

## J1 — Owner onboarding (new restaurant)

**Persona:** Restaurant Owner
**Trigger:** First visit to app.
**Steps:**
1. Register with email + password.
2. Verify email (preview mode in dev).
3. Create restaurant: name, slug, currency, timezone.
4. Complete settings: branding, opening hours, tax policy.
5. Create first branch.
6. Invite manager and kitchen staff by email.
7. Owner lands on admin dashboard.

**Systems:** auth, restaurants, memberships, branches, settings, email (preview), audit log.
**Success:** Restaurant exists with 1 branch, 1 owner membership, invites pending.
**Failures:** Slug taken → suggest alternative. Duplicate email → offer sign-in. Invalid timezone → block.

---

## J2 — Menu creation and publishing

**Persona:** Restaurant Owner / Manager
**Trigger:** New menu needs to go live.
**Steps:**
1. Create categories (Starter, Mains, Desserts…).
2. Create menu items: name, description, price (minor units), image.
3. Add variants (S/M/L) and modifier groups (required / optional).
4. Attach allergens and dietary labels.
5. Configure availability per branch.
6. Publish menu.

**Systems:** menu, media (Cloudinary), branches, audit log.
**Success:** Menu visible on public storefront for the chosen branch.
**Failures:** Missing image → allowed (placeholder). Invalid price ≤ 0 → blocked. Required modifier group with no modifiers → blocked.

---

## J3 — Customer browsing the storefront

**Persona:** Guest / Registered Customer
**Trigger:** Scans QR at a table, or opens `/r/:slug`.
**Steps:**
1. Load restaurant homepage (hero, hours, contact, location).
2. Browse categories, search, filter by dietary label / allergen-free.
3. Open product detail: image, description, allergens, modifiers.
4. Customize (size, add-ons, required options, special instructions).
5. Add to cart.

**Systems:** public storefront, menu, media.
**Success:** Item in cart with correct customized price.
**Failures:** Item marked unavailable → disabled with reason. Image fails → placeholder. Allergen warning must render before add-to-cart.

---

## J4 — Online order placement and payment

**Persona:** Registered / Guest Customer
**Trigger:** Cart checkout.
**Steps:**
1. Review cart and totals (server-authoritative).
2. Enter contact details (guest: email/phone; registered: pre-filled).
3. Choose fulfillment: dine-in (table), pickup, delivery.
4. Apply discount code (optional).
5. Submit order → server creates order in **Pending Confirmation** with idempotency key.
6. Redirect to Stripe test checkout OR simulated adapter.
7. Payment succeeds → webhook marks payment **Paid**.
8. Order confirmation shown; tracking link issued.

**Systems:** orders, payments, pricing engine, customers, email (preview), Ably.
**Success:** Order recorded, payment state matches, kitchen notified via Ably `order.created`.
**Failures:** Price tampering → server ignores client price, recomputes. Unavailable item → 409. Duplicate submit → idempotency key returns same order. Payment fail → order stays **Pending Confirmation** or **Cancelled** per policy, no kitchen event.

**Business rules called out for server enforcement:**
- Client-submitted prices are ignored.
- Idempotency required on order creation and payment intent.
- Payment state and order state are independent.

---

## J5 — Kitchen order lifecycle

**Persona:** Kitchen Staff
**Trigger:** Ably `order.created` on branch channel.
**Steps:**
1. KDS card appears with timer.
2. Staff **Accept** → order becomes **Accepted**.
3. Staff **Preparing** → order becomes **Preparing**.
4. Staff **Ready** → order becomes **Ready**; customer notified.
5. Staff **Completed** → order **Completed**; triggers analytics + inventory finalization.

**Systems:** kitchen, orders (state machine), Ably, notifications.
**Success:** Order progresses through valid states, every transition recorded in `order_events`.
**Failures:** Invalid transition (e.g. Completed → Preparing) → 409. Duplicate Ably event → ignored via event ID. Client offline → sync on reconnect using last known state.

**Business rules:**
- Only valid transitions per state machine.
- Events published **after** DB commit.

---

## J6 — Order tracking (customer)

**Persona:** Registered / Guest Customer
**Trigger:** Opens tracking link after checkout.
**Steps:**
1. See current status.
2. Get live updates via Ably on customer-safe channel.
3. See estimated time (if configured).
4. Receive completion notification.

**Systems:** orders (read), Ably.
**Success:** Status reflects server truth within seconds.
**Failures:** Disconnect → re-fetch state. Order not found / wrong link → 404.

---

## J7 — Inventory consumption on completed order

**Persona:** System (Inventory Manager observes)
**Trigger:** Order reaches **Accepted** (per spec example) or **Completed** (configurable per restaurant).
**Steps:**
1. Load recipes for each ordered item + variants + modifiers.
2. Compute required ingredient quantities (unit conversion).
3. Verify stock under configured policy (block vs allow negative).
4. Write stock movements transactionally with source = order.
5. Decrement balances.
6. Emit `inventory.low_stock` if threshold crossed.

**Systems:** inventory, orders.
**Success:** Each eligible order deducts stock **exactly once**.
**Failures:** Duplicate trigger → idempotency check on (order, recipe line). Insufficient stock under block policy → order acceptance rejected with reason. Cancellation → compensating movements (J9).

---

## J8 — Reservation booking

**Persona:** Customer
**Trigger:** Clicks “Reserve” on storefront.
**Steps:**
1. Select branch, date, time, party size.
2. Server checks availability (tables, opening hours, timezone).
3. Customer submits → server creates reservation inside a transaction with an overlap check.
4. Confirmation shown; email preview generated.
5. Reservation appears on admin calendar.

**Systems:** reservations, branches, tables, email (preview).
**Success:** Reservation confirmed, no overlap with existing holds.
**Failures:** Concurrent booking for same slot → one succeeds, other gets 409 with alternatives. Outside opening hours → blocked. Party size > branch capacity → blocked.

**Business rules:**
- Availability computed server-side only.
- Overlap prevention enforced at DB level (transaction + constraint or serializable isolation).

---

## J9 — Order cancellation and reversal

**Persona:** Manager
**Trigger:** Customer calls to cancel, or issue found in kitchen.
**Steps:**
1. Manager opens order, chooses Cancel with reason.
2. Server validates state (cancellable only from Pending / Accepted / Preparing per policy).
3. If payment was paid → refund initiated (Stripe test or simulated).
4. If inventory was deducted → compensating stock movements.
5. Order → **Cancelled**; event recorded.

**Systems:** orders, payments, inventory, audit log.
**Success:** State consistent, refund recorded, stock restored, audit trail complete.
**Failures:** Already Completed → not cancellable. Duplicate cancel → idempotent, no double refund.

---

## J10 — Analytics and menu engineering review

**Persona:** Owner
**Trigger:** Weekly performance review.
**Steps:**
1. Open analytics dashboard.
2. Review revenue (daily/weekly/monthly), AOV, top products.
3. View menu engineering quadrants (Stars / Plowhorses / Puzzles / Dogs).
4. Drill into a product: margin, popularity, contribution.
5. Export CSV.

**Systems:** analytics, orders, inventory (cost), menu.
**Success:** Numbers reconcile with underlying orders.
**Failures:** Data window mismatch → shown filters. Zero-cost recipe → margin flagged “unknown”.

**Business rules:**
- All metrics computed from authoritative order + cost records.
- Popularity and profitability thresholds documented in Step 86.

---

## J11 — Staff invitation and permissions

**Persona:** Owner / Manager
**Trigger:** New staff member joins.
**Steps:**
1. Owner opens Staff → Invite.
2. Enters email + role + branch(es).
3. Invitation email (preview in dev) sent with signed link.
4. Invitee signs up → membership created with role and branch scope.
5. First login lands on role-appropriate shell.

**Systems:** auth, memberships, invitations, email (preview), audit log.
**Success:** New user can act within scope only.
**Failures:** Email already a member → block with message. Invitation expired → resend. Role out of scope for branch → blocked.

---

## J12 — Cross-tenant denial (security journey)

**Persona:** Any restaurant user of Restaurant B
**Trigger:** Attempts to access Restaurant A data via manipulated ID.
**Steps:**
1. Requests `/api/v1/orders/{A_order_id}` while member of B only.
2. Server resolves tenant from session, not from request body or URL.
3. Access denied.

**Systems:** auth, tenant middleware, all module routes.
**Success:** 404 (not 403, to avoid existence leaks) and audit log entry.
**Failures:** If any endpoint bypasses tenant resolution → security bug, must fail tests in Step 98.

---

## Journey → roadmap mapping

| Journey | Primary steps |
|---|---|
| J1 | 31–37 |
| J2 | 40–43 |
| J3 | 44–46, 48 |
| J4 | 50–55, 58 |
| J5 | 60–66 |
| J6 | 58, 62–64 |
| J7 | 68–74 |
| J8 | 78–80, 82 |
| J9 | 57, 73, 54 |
| J10 | 86–92 |
| J11 | 31–35 |
| J12 | 29–30, 95, 98 |

## Notes for later steps

- Every journey must have at least one Playwright E2E test at Step 98.
- Every “Failure” bullet becomes either a server rule or a test case.
- Any new business rule must be added here before implementing it.