# RestaurantOS — Domain Models

Version: 1.0
Last updated: Step 8

Entities, relationships, invariants. Physical schema (tables, indexes, FKs) is produced
in Steps 20–26 with Drizzle. This document is the design source of truth.

Conventions (apply to all tables unless stated):
- PK: `id uuid primary key default gen_random_uuid()`.
- Timestamps: `created_at`, `updated_at` (`timestamptz`, UTC).
- Money: `*_minor integer` + `currency char(3)`. Never float.
- Soft delete: `deleted_at timestamptz null` where history matters.
- Every restaurant-owned table has `restaurant_id uuid not null references restaurants(id)`.
- Every branch-owned table has `branch_id uuid not null references branches(id)`.
- FKs: `on delete restrict` for historical, `on delete cascade` only for true children (e.g. order_items → orders).

---

## 1. Identity & tenancy

### users
- `id`, `email` (unique), `name`, `email_verified_at`, `image_url`, `is_platform_admin` bool default false, timestamps.
- Owned by: platform. Referenced everywhere.

### accounts / sessions / verifications
- Owned by Better Auth. Not redesigned — use Better Auth's official schema.

### restaurants
- `id`, `slug` (unique, url-safe), `name`, `timezone` (IANA), `currency` (ISO 4217),
  `tax_rate_bps` int, `logo_url`, `hero_url`, `description`, `phone`, `email`,
  `status` enum(`active`, `suspended`), `deleted_at`, timestamps.
- Slug format: `^[a-z0-9-]{3,40}$`.
- Deletion: soft (status → suspended + deleted_at). Never hard-delete.

### restaurant_settings
- 1:1 with `restaurants`.
- `payment_policy` enum(`pay_at_checkout`, `pay_at_pickup`, `pay_on_delivery`),
  `inventory_deduct_on` enum(`on_accept`, `on_complete`),
  `insufficient_stock_policy` enum(`block`, `allow_negative`),
  `cancellation_cutoff_hours` int, `modification_cutoff_hours` int,
  `reservation_duration_minutes` int, `refund_limit_minor` int,
  `theme_primary_color` text, `theme_accent_color` text.

### restaurant_memberships
- `id`, `restaurant_id`, `user_id`, `role` enum(`owner`,`manager`,`cashier`,`kitchen`,`inventory_manager`),
  `status` enum(`invited`,`active`,`removed`), `invited_by`, `invited_email`, `accepted_at`, timestamps.
- Unique: `(restaurant_id, user_id)` where status = `active`.
- Role `owner` unique per restaurant (at least 1, at most N — enforced app-side, warn if 0).

### invitations
- `id`, `restaurant_id`, `email`, `role`, `branch_ids uuid[]`, `token` (unique), `expires_at`, `created_by`, `accepted_at`.

### branches
- `id`, `restaurant_id`, `name`, `code` (unique per restaurant), `address_line1`,
  `address_line2`, `city`, `postal_code`, `country`, `phone`, `timezone`,
  `is_active` bool, timestamps.
- Branch timezone defaults to restaurant timezone; may differ (rare).

### branch_assignments (for branch-scoped roles)
- `id`, `membership_id`, `branch_id`.
- Unique: `(membership_id, branch_id)`.
- Only meaningful for cashier/kitchen/inventory_manager.

### opening_hours
- `id`, `branch_id`, `day_of_week` smallint 0–6, `open_time time`, `close_time time`.
- Multiple rows per day allowed (split shifts). `close_time < open_time` means overnight.

### tables
- `id`, `branch_id`, `code` (unique per branch, e.g. "A1"), `seats` int, `is_active`.

### service_modes
- `id`, `restaurant_id`, `mode` enum(`dine_in`,`pickup`,`delivery`), `is_enabled` bool, `delivery_fee_minor` int.

---

## 2. Menu

### menu_categories
- `id`, `restaurant_id`, `name`, `slug` (unique per restaurant), `position` int, `is_active`, timestamps.

### menu_items
- `id`, `restaurant_id`, `category_id`, `name`, `slug`, `description`, `image_url`,
  `base_price_minor` int, `currency` (matches restaurant), `is_active`, `is_available`,
  `position` int, `dietary_labels text[]` (e.g. `vegetarian`,`vegan`,`gluten_free`), timestamps.
- `is_available` toggled by staff (sold out) without editing.

### menu_item_variants
- `id`, `menu_item_id`, `name` (e.g. "Small"), `price_delta_minor` int, `is_default` bool, `position`.
- Price = `menu_items.base_price_minor + variant.price_delta_minor`. Never store computed price.
- Optional. If no variants exist, item has single implicit variant.

### modifier_groups
- `id`, `restaurant_id`, `name` (e.g. "Extras"), `min_select` int, `max_select` int, `is_required` bool, `position`.
- Invariant: `0 <= min_select <= max_select`; `max_select >= 1` when `is_required`.

### modifiers
- `id`, `modifier_group_id`, `name`, `price_delta_minor`, `is_active`, `position`.

### menu_item_modifier_groups
- `menu_item_id`, `modifier_group_id`, `position`.
- Unique: `(menu_item_id, modifier_group_id)`.

### allergens
- `id`, `code` (unique), `name` (e.g. `gluten`, `nuts`).
- Seeded, not user-editable.

### menu_item_allergens
- `menu_item_id`, `allergen_id`. Unique pair.

### branch_menu_overrides
- `id`, `branch_id`, `menu_item_id`, `is_available` bool, `price_delta_minor int`.
- Optional: allows a branch to hide or re-price an item.

---

## 3. Customers

### customers
- `id`, `restaurant_id`, `user_id` (nullable — guest orders have no user),
  `email` (nullable), `phone` (nullable), `name`, `notes`,
  `total_orders int default 0`, `total_spend_minor bigint default 0`, timestamps.
- Unique: `(restaurant_id, email)` where email not null; `(restaurant_id, phone)` where phone not null.
- Guest order → customer row created with email/phone; user can claim later by matching email (v1+).

### customer_addresses
- `id`, `customer_id`, `label`, `line1`, `line2`, `city`, `postal_code`, `country`, `is_default`.

### customer_preferences
- `id`, `customer_id`, `allergen_ids uuid[]`, `dietary_labels text[]`, `marketing_opt_in bool`, `notes`.

---

## 4. Orders

### orders
- `id`, `restaurant_id`, `branch_id`, `customer_id` (nullable for guests with only contact),
  `order_number` int (unique per branch, per day — computed at creation via sequence),
  `state` enum from §1 of BUSINESS_WORKFLOWS,
  `service_mode` enum(`dine_in`,`pickup`,`delivery`),
  `table_id` (nullable), `fulfillment_name`, `fulfillment_phone`, `fulfillment_email`,
  `subtotal_minor int`, `tax_rate_bps int` (snapshot), `tax_minor int`,
  `discount_id` (nullable), `discount_minor int`,
  `delivery_fee_minor int`, `total_minor int`, `currency char(3)`,
  `notes text`, `idempotency_key uuid`,
  `accepted_at`, `preparing_at`, `ready_at`, `completed_at`, `cancelled_at`, `rejected_at`,
  `cancellation_reason`, timestamps.
- Unique: `(restaurant_id, idempotency_key)`.
- Historical snapshot rule: once state leaves `pending_confirmation`, monetary fields are immutable.

### order_items
- `id`, `order_id`, `menu_item_id` (nullable — historical), `menu_item_name` (snapshot),
  `variant_id` (nullable), `variant_name` (snapshot), `unit_price_minor` (snapshot),
  `quantity int`, `line_subtotal_minor int`, `notes text`.
- `line_subtotal_minor = unit_price_minor * quantity`.

### order_item_modifiers
- `id`, `order_item_id`, `modifier_id` (nullable), `modifier_name` (snapshot),
  `price_delta_minor` (snapshot), `quantity int default 1`.

### order_events
- `id`, `order_id`, `from_state`, `to_state`, `actor_user_id` (nullable for system),
  `reason text`, `metadata jsonb`, `created_at`.
- Append-only.

### idempotency_keys
- `id`, `restaurant_id`, `key` (uuid), `endpoint` text, `request_hash text`,
  `response_status int`, `response_body jsonb`, `created_at`.
- Unique: `(restaurant_id, endpoint, key)`.
- Retention: purge after 24h by a lazy job (no cron; purge-on-read or on-create).

---

## 5. Payments

### payments
- `id`, `order_id`, `restaurant_id`, `provider` enum(`stripe_test`,`simulated`),
  `provider_payment_intent_id` (nullable), `state` enum from §2,
  `amount_minor int`, `currency char(3)`, `failure_reason text`,
  `idempotency_key uuid`, timestamps.
- Unique: `(order_id, idempotency_key)`.

### refunds
- `id`, `payment_id`, `amount_minor`, `reason text`, `provider_refund_id`, `status` enum(`pending`,`succeeded`,`failed`), timestamps.

### payment_events
- `id`, `payment_id`, `event_type text`, `provider_event_id` (unique when present),
  `payload jsonb`, `created_at`.
- Dedupe on `provider_event_id`.

---

## 6. Kitchen

No dedicated tables — the KDS is a view over `orders` (state ∈ {accepted, preparing}).
Reasons:
- Avoid duplicate source of truth.
- Order state machine + `order_events` already capture everything.
KDS settings (sound on/off) stored client-side (localStorage).

---

## 7. Inventory

### ingredients
- `id`, `restaurant_id`, `name`, `base_unit` enum(`g`,`ml`,`each`),
  `cost_per_base_unit_minor numeric(12,6)`, `low_stock_threshold numeric(12,3)` nullable,
  `is_active`, timestamps.
- `cost_per_base_unit_minor` uses numeric, not float — 6 decimal places for per-gram precision.

### ingredient_units (alternate units for recipes)
- `id`, `ingredient_id`, `unit` text, `factor_to_base numeric(12,6)`.
- Example: base `g`; alternate `kg` factor 1000; alternate `oz` factor 28.349523.

### recipes
- `id`, `menu_item_id`, `variant_id` (nullable), `modifier_id` (nullable), `yield_quantity int default 1`, timestamps.
- Unique: `(menu_item_id, variant_id, modifier_id)` (nulls treated via `coalesce`).
- A recipe has 1+ `recipe_ingredients`.

### recipe_ingredients
- `id`, `recipe_id`, `ingredient_id`, `quantity numeric(12,3)`, `unit text`.
- Stored in the ingredient's base unit after conversion during entry; alternate unit kept for display.

### inventory_locations (v1+; not MVP unless multi-store per branch)
- `id`, `branch_id`, `name`. MVP uses one implicit location = branch.

### stock_movements
- `id`, `restaurant_id`, `branch_id`, `ingredient_id`, `quantity_delta numeric(12,3)`,
  `unit text`, `reason` enum(`initial`,`purchase_receive`,`order_consumption`,`order_reversal`,`waste`,`adjustment`),
  `source_type` text, `source_id` uuid, `created_by` (nullable), `notes`, `created_at`.
- Append-only. Balance = `SUM(quantity_delta)` per `(branch_id, ingredient_id)`.
- Unique: `(branch_id, ingredient_id, reason, source_type, source_id)` where `source_id is not null`.
  Prevents duplicate deduction per order.

### suppliers
- `id`, `restaurant_id`, `name`, `contact_name`, `email`, `phone`, `notes`, `is_active`, timestamps.

### purchase_orders
- `id`, `restaurant_id`, `branch_id`, `supplier_id`, `status` enum(`draft`,`ordered`,`received`,`cancelled`),
  `ordered_at`, `received_at`, `total_minor int`, `notes`, timestamps.

### purchase_order_items
- `id`, `purchase_order_id`, `ingredient_id`, `quantity numeric(12,3)`, `unit text`,
  `unit_cost_minor numeric(12,6)`, `line_total_minor int`.
- On receive: generates `stock_movements` with `reason=purchase_receive`, `source_type=purchase_order`, `source_id=po.id`.

### waste_records
- `id`, `branch_id`, `ingredient_id`, `quantity numeric(12,3)`, `unit text`, `reason text`, `created_by`, `created_at`.
- Also generates a `stock_movements` row with `reason=waste`.

---

## 8. Reservations

### reservations
- `id`, `restaurant_id`, `branch_id`, `customer_id` (nullable), `guest_name`, `guest_email`, `guest_phone`,
  `party_size int`, `reservation_time timestamptz`, `duration_minutes int`,
  `state` enum(`pending`,`confirmed`,`seated`,`completed`,`cancelled`,`no_show`),
  `notes`, `tracking_token uuid` (for guest lookup),
  `cancelled_at`, `cancellation_reason`, timestamps.

### reservation_tables
- `reservation_id`, `table_id`. Unique per pair.

### reservation_events
- `id`, `reservation_id`, `from_state`, `to_state`, `actor_user_id`, `reason`, `created_at`.

---

## 9. Promotions

### discounts
- `id`, `restaurant_id`, `code` (unique per restaurant, case-insensitive via lower()),
  `type` enum(`percent`,`fixed`), `value int` (percent × 100 for fractions; fixed = minor units),
  `min_order_minor int`, `max_uses int`, `max_uses_per_customer int`,
  `starts_at`, `ends_at`, `is_active`, timestamps.

### discount_redemptions
- `id`, `discount_id`, `order_id`, `customer_id` (nullable), `amount_minor int`, `created_at`.
- Unique: `(discount_id, order_id)`.

---

## 10. Administration

### audit_logs
- `id`, `actor_user_id` (nullable), `restaurant_id` (nullable), `branch_id` (nullable),
  `action text` (e.g. `order.cancel`, `staff.role_change`),
  `entity_type text`, `entity_id uuid`, `metadata jsonb`, `created_at`.
- Append-only. Never store PII beyond what's necessary; store ids.

### notifications (v1)
- `id`, `user_id`, `type text`, `title`, `body`, `read_at`, `created_at`.

### notification_preferences (v1)
- `id`, `user_id`, `order_events bool`, `reservation_events bool`, `marketing bool`.

---

## 11. Cross-cutting invariants

1. **Every tenant-owned row carries `restaurant_id`** — no exceptions. Even `order_items` carry `restaurant_id` (denormalized) so cross-tenant joins can be rejected at SQL level.
2. **Every branch-owned row carries `branch_id`** and `restaurant_id`.
3. **Money is integer minor units**, currency explicit per row that carries money.
4. **Historical snapshot rule:** order_items, order_item_modifiers, orders monetary fields, and reservation state fields never updated after the relevant transition.
5. **Soft delete** on: restaurants, menu_items, branches, ingredients, suppliers. Hard delete only for: invitations (expired), idempotency_keys (purged), sessions.
6. **Append-only tables:** order_events, payment_events, reservation_events, stock_movements, audit_logs, discount_redemptions.
7. **Unique constraints that protect business logic**:
   - `restaurants.slug`
   - `restaurant_memberships (restaurant_id, user_id) where status='active'`
   - `orders (restaurant_id, idempotency_key)`
   - `payments (order_id, idempotency_key)`
   - `payment_events.provider_event_id`
   - `stock_movements (branch_id, ingredient_id, reason, source_type, source_id)`
   - `discount_redemptions (discount_id, order_id)`
   - `reservation_tables (reservation_id, table_id)`
8. **Reservation overlap** enforced by transaction + explicit `SELECT ... FOR UPDATE` (no native EXCLUDE constraint without extra extension; doc as app-level rule + index on `(table_id, reservation_time)`).
9. **Timezones** stored on `restaurants.timezone` and `branches.timezone`; all timestamps UTC.

---

## 12. ERD (text)
