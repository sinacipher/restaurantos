# RestaurantOS — User Personas

Version: 1.0
Last updated: Step 1

Personas map directly to the RBAC roles in Part 7 of the master spec.
Each persona lists: scope, goals, key actions, permissions, UI surface, pain points.

---

## 1. Platform Administrator

- **Scope:** Entire platform (all tenants).
- **Identity:** Internal operator of RestaurantOS. Not a restaurant employee.
- **Goals:** Onboard restaurants, monitor system health, support tenants, inspect audit logs.
- **Key actions:**
  - View all restaurants (read-only summary).
  - Suspend or re-activate a restaurant.
  - View platform-wide audit log.
  - Manage platform-level configuration flags.
- **Permissions:** Platform-level only. **Cannot** read tenant business data (orders, customers, inventory) — privacy by default. Any elevated access requires an explicit, audited break-glass action.
- **UI surface:** `/admin/platform/*` (internal).
- **Pain points:** Needs fast diagnosis without violating tenant privacy.

---

## 2. Restaurant Owner

- **Scope:** One restaurant (the tenant), all its branches.
- **Identity:** Business owner. Usually the account that created the restaurant.
- **Goals:** Grow revenue, control costs, manage staff, watch analytics.
- **Key actions:**
  - Create/edit restaurant profile and branding.
  - Create/edit branches, opening hours, tables.
  - Manage menu (categories, items, variants, modifiers, allergens, images).
  - Invite staff, assign roles.
  - Configure discounts, taxes, service modes.
  - View all analytics and reports across branches.
  - Manage inventory policy and suppliers.
  - View and manage all reservations and orders.
- **Permissions:** Full tenant scope. Cannot access other tenants. Cannot promote self to Platform Administrator.
- **UI surface:** `/admin/*` (full access).
- **Pain points:** Too many dashboards stitched together in current tools; wants one place.

---

## 3. Restaurant Manager

- **Scope:** One restaurant, all branches (or a subset if restricted).
- **Identity:** Operations lead. Hired by the owner.
- **Goals:** Keep day-to-day operations running, hit sales targets, resolve issues.
- **Key actions:**
  - Everything the Owner can do **except**: billing/plan, deleting the restaurant, transferring ownership, promoting to Owner.
  - Manage menu, orders, reservations, inventory, staff shifts.
  - View analytics.
- **Permissions:** Broad tenant scope with explicit exclusions (destructive/owner-only actions).
- **UI surface:** `/admin/*` (full minus owner-only routes).
- **Pain points:** Needs clarity on what “manager” can change without owner approval.

---

## 4. Cashier

- **Scope:** One branch.
- **Identity:** Front-of-house staff on a till/terminal.
- **Goals:** Take orders fast, process test payments, close tickets.
- **Key actions:**
  - Create in-branch orders.
  - Take test payments (Stripe test / simulated).
  - View current branch orders.
  - Print/see receipts.
  - Basic refund initiation (with manager approval flag).
- **Permissions:** Branch-scoped. **No** menu editing, analytics, staff management, inventory config.
- **UI surface:** `/admin/orders`, `/admin/pos` (branch-scoped views only).
- **Pain points:** Any latency or extra click slows the queue.

---

## 5. Kitchen Staff

- **Scope:** One branch (usually one kitchen station).
- **Identity:** Cook / line staff.
- **Goals:** See incoming orders clearly, mark progress accurately, avoid mistakes.
- **Key actions:**
  - View incoming orders on KDS (Kitchen Display System).
  - Accept, mark Preparing, Ready, Completed.
  - Add special-instruction notes to their own actions.
  - Acknowledge low-stock alerts (read-only).
- **Permissions:** Branch-scoped, KDS only. **No** pricing edits, no customer data, no analytics, no menu edits. Cannot cancel/refund orders — only reject with reason if allowed by policy.
- **UI surface:** `/kitchen/*` (full-screen KDS).
- **Pain points:** Glare, noise, wet hands — UI must be large, high-contrast, big buttons, sound cues.

---

## 6. Inventory Manager

- **Scope:** One restaurant, all branches (or assigned branches).
- **Identity:** Stock/back-of-house lead.
- **Goals:** Prevent stockouts, control costs, track waste and suppliers.
- **Key actions:**
  - Manage ingredients, units, recipes.
  - Record stock movements (receive, waste, adjust).
  - Manage suppliers and purchase orders.
  - Set low-stock thresholds.
  - View inventory valuation and consumption reports.
- **Permissions:** Tenant-scoped for inventory. **No** order editing, no customer data, no staff management.
- **UI surface:** `/admin/inventory/*`.
- **Pain points:** Manual spreadsheets drift; needs ledger-style traceability.

---

## 7. Registered Customer

- **Scope:** Own account + public storefronts of any restaurant they order from.
- **Identity:** End customer who created an account.
- **Goals:** Order food fast, track it, reorder favorites, reserve a table.
- **Key actions:**
  - Browse public storefronts and menus.
  - Add to cart, customize items, checkout.
  - Pay (test/simulated).
  - Track order status.
  - View order and reservation history.
  - Cancel eligible reservations.
  - Manage own preferences (allergens, dietary labels).
- **Permissions:** Own data only. Cannot see other customers, cannot see admin data.
- **UI surface:** `/r/:slug/*` (public), `/account/*` (self).
- **Pain points:** Slow checkout, unclear customization, no live tracking.

---

## 8. Guest Customer

- **Scope:** A single session; one public storefront at a time.
- **Identity:** Unregistered visitor.
- **Goals:** Order without creating an account, or just browse.
- **Key actions:**
  - Browse menus.
  - Place an order with contact details (email/phone) for tracking link.
  - Make a reservation.
- **Permissions:** Public read + create-order/reservation. **No** persisted history after session unless they claim the order via link.
- **UI surface:** `/r/:slug/*`.
- **Pain points:** Forced sign-up walls; slow forms.

---

## Cross-cutting rules

- No persona can access another tenant’s data — including Platform Administrator, except via audited break-glass.
- Branch-scoped personas (Cashier, Kitchen Staff, Inventory Manager when restricted) can only act within their assigned branch(es).
- All permission decisions are enforced **server-side**. Frontend hiding is UI comfort only.
- Personas map to roles in Step 7’s Permission Matrix; any new role must be added to this document first.

## Notes for later steps

- Step 7 will convert this file into a machine-readable permission matrix.
- Step 34 will implement server-side checks per route using that matrix.
- Step 98 will include a test scenario for every “cannot” in this file.