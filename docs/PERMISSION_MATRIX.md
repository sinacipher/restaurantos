# RestaurantOS — Permission Matrix

Version: 1.0
Last updated: Step 7

Machine-readable permission source of truth. Every backend route (Steps 31–94) must
reference a permission from this file. Frontend hiding is UI comfort only — never security.

---

## 1. Roles

| Code | Role | Scope |
|---|---|---|
| PA | Platform Administrator | Platform |
| OW | Restaurant Owner | Tenant (all branches) |
| MG | Restaurant Manager | Tenant (all or assigned branches) |
| CA | Cashier | Branch |
| KS | Kitchen Staff | Branch |
| IM | Inventory Manager | Tenant (assigned branches) |
| RC | Registered Customer | Self |
| GC | Guest Customer | Session |

Roles are stored in `restaurant_memberships.role`. A user may hold different roles in
different restaurants. Platform Admin is a global flag on `users`, not a membership.

---

## 2. Permission naming

`<domain>:<action>[:<qualifier>]`

Domains: `restaurant`, `branch`, `menu`, `order`, `payment`, `kitchen`, `inventory`,
`reservation`, `customer`, `staff`, `discount`, `analytics`, `settings`, `audit`,
`platform`, `upload`.

Examples:
- `menu:create`
- `order:update_status`
- `analytics:read`
- `platform:suspend_restaurant`

---

## 3. Matrix

Legend: ✅ full • 🟡 limited (see §4) • ❌ none • — not applicable

### Restaurant & settings

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| restaurant:create | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| restaurant:read | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| restaurant:update | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |
| restaurant:delete | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings:read | 🟡 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings:update | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings:update_branding | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings:update_payment_policy | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| settings:update_inventory_policy | ❌ | ✅ | ❌ | ❌ | ❌ | 🟡 | ❌ | ❌ |

### Branches

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| branch:create | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| branch:read | 🟡 | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ | ❌ |
| branch:update | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| branch:delete | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Menu

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| menu:read | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| menu:create | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| menu:update | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| menu:delete | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| menu:publish | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| menu:toggle_availability | ❌ | ✅ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ |

### Orders

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| order:create | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| order:read | ❌ | ✅ | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 |
| order:update_status | ❌ | ✅ | ✅ | 🟡 | 🟡 | ❌ | ❌ | ❌ |
| order:cancel | ❌ | ✅ | ✅ | 🟡 | ❌ | ❌ | 🟡 | 🟡 |
| order:refund | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |

### Payments

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| payment:create | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| payment:read | ❌ | ✅ | ✅ | 🟡 | ❌ | ❌ | 🟡 | 🟡 |
| payment:refund | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |

### Kitchen

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| kitchen:read_queue | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| kitchen:accept_order | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| kitchen:advance_status | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| kitchen:reject_order | ❌ | ✅ | ✅ | ❌ | 🟡 | ❌ | ❌ | ❌ |

### Inventory

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| inventory:read | ❌ | ✅ | ✅ | ❌ | 🟡 | ✅ | ❌ | ❌ |
| inventory:update | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| inventory:record_movement | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| inventory:read_cost | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

### Reservations

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| reservation:create | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| reservation:read | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | 🟡 |
| reservation:update | ❌ | ✅ | ✅ | 🟡 | ❌ | ❌ | 🟡 | 🟡 |
| reservation:cancel | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | 🟡 |

### Customers

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| customer:read | ❌ | ✅ | ✅ | 🟡 | ❌ | ❌ | 🟡 | ❌ |
| customer:update | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | 🟡 | ❌ |
| customer:delete | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | 🟡 | ❌ |

### Staff & memberships

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| staff:read | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| staff:invite | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |
| staff:update_role | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| staff:remove | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |

### Discounts

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| discount:read | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| discount:create | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| discount:update | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| discount:delete | ❌ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |

### Analytics

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| analytics:read_revenue | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| analytics:read_products | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| analytics:read_profit | ❌ | ✅ | 🟡 | ❌ | ❌ | ✅ | ❌ | ❌ |
| analytics:read_customers | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| analytics:export | ❌ | ✅ | ✅ | ❌ | ❌ | 🟡 | ❌ | ❌ |

### Audit

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| audit:read | ✅ | ✅ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ |

### Platform

| Permission | PA | OW | MG | CA | KS | IM | RC | GC |
|---|---|---|---|---|---|---|---|---|
| platform:list_restaurants | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| platform:suspend_restaurant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| platform:break_glass | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Limited (🟡) definitions

- **restaurant:read / PA**: summary only (name, plan, status). No orders, customers, inventory.
- **branch:read** for CA/KS/IM: only branches they are assigned to.
- **restaurant:update / MG**: cannot change currency, timezone, payment policy, or ownership.
- **settings:update / MG**: cannot change payment or inventory policy; branding yes.
- **settings:update_inventory_policy / IM**: can update thresholds and stock policy, not payment.
- **menu:toggle_availability / CA**: can mark sold out, cannot edit items.
- **order:read / CA, KS**: only orders for their branch; no customer contact details.
- **order:read / RC, GC**: only their own orders, looked up by session or tracking token.
- **order:update_status / CA**: can only `ready → completed`. Kitchen handles `accepted → preparing → ready`.
- **order:update_status / KS**: `pending_confirmation → accepted`, `accepted → preparing`, `preparing → ready`, `ready → completed`. Cannot cancel.
- **order:cancel / CA**: cannot cancel paid orders; must escalate to Manager.
- **order:cancel / RC, GC**: only while state is `pending_confirmation` and within `cancellation_window_minutes`.
- **order:refund / MG**: only up to `refund_limit_minor` (default 5,000 minor units). Above requires Owner.
- **payment:read / CA, RC, GC**: only their own / branch payments.
- **payment:refund / MG**: within refund limit; requires reason; audited.
- **kitchen:reject_order / KS**: only with reason; cannot auto-refund; requires Manager for refund.
- **inventory:read / KS**: read-only low-stock banner only.
- **reservation:read / RC, GC**: own reservation by tracking token or session.
- **reservation:update / CA, RC, GC**: RC can modify time up to `modification_cutoff_hours` (default 2). GC via tracking token.
- **reservation:cancel / RC, GC**: up to `cancellation_cutoff_hours` (default 2).
- **customer:read / CA**: name and phone for current service only; no history.
- **customer:read / RC**: own profile only.
- **staff:invite / MG**: cannot invite OW or MG roles.
- **staff:remove / MG**: cannot remove OW, self, or other MG.
- **discount:delete / MG**: cannot delete a discount used in the last 30 days; can deactivate.
- **analytics:read_profit / MG**: view only, no export.
- **analytics:export / IM**: inventory-related exports only.
- **audit:read / MG**: only entries related to orders/reservations in their branch.

---

## 5. Enforcement rules

1. Every protected route declares required permission in metadata:
   ```ts
   router.post('/menu/items',
     requireAuth,
     requireTenant,
     requirePermission('menu:create'),
     handler);