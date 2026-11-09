# RestaurantOS — Functional Requirements

Version: 1.0
Last updated: Step 3

Legend:
- Priority: M = Must (MVP), S = Should, C = Could
- Persons: PA=Platform Admin, OW=Owner, MG=Manager, CA=Cashier, KS=Kitchen Staff, IM=Inventory Mgr, RC=Registered Customer, GC=Guest Customer
- Journey: links to docs/USER_JOURNEYS.md (J1–J12)

Any feature not listed here is out of scope.

---

## Module 1 — Public Restaurant Websites (PUB)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-PUB-001 | Public storefront at `/r/:restaurantSlug` | M | GC, RC | J3 |
| FR-PUB-002 | Homepage: hero, tagline, logo | M | GC, RC | J3 |
| FR-PUB-003 | Restaurant info: address, phone, hours, map link | M | GC, RC | J3 |
| FR-PUB-004 | Dynamic menu grouped by category | M | GC, RC | J3 |
| FR-PUB-005 | Product search (name, description) | M | GC, RC | J3 |
| FR-PUB-006 | Filter by dietary label / allergen-free | S | GC, RC | J3 |
| FR-PUB-007 | Dietary labels + allergen info on each item | M | GC, RC | J3 |
| FR-PUB-008 | Product customization: variants, modifiers, special instructions | M | GC, RC | J3 |
| FR-PUB-009 | Branch selector (if multiple branches) | M | GC, RC | J3 |
| FR-PUB-010 | Table-specific QR codes (link to `/r/:slug?table=:id`) | M | GC | J3 |
| FR-PUB-011 | Online ordering entry point (cart) | M | GC, RC | J4 |
| FR-PUB-012 | Reservation entry point | M | GC, RC | J8 |
| FR-PUB-013 | Customer account registration/login | M | RC | J1 |
| FR-PUB-014 | Customer order history (logged-in only) | S | RC | J6 |
| FR-PUB-015 | Mobile-first responsive design | M | GC, RC | J3 |
| FR-PUB-016 | SEO: meta tags, structured data, sitemap, robots.txt | S | — | — |
| FR-PUB-017 | Image optimization (Cloudinary responsive) | S | — | J3 |

---

## Module 2 — Restaurant Administration (ADM)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-ADM-001 | Owner dashboard: revenue, orders, AOV, recent orders | M | OW, MG | J10 |
| FR-ADM-002 | Revenue chart (daily/weekly/monthly) | M | OW, MG | J10 |
| FR-ADM-003 | Best-selling products widget | M | OW, MG | J10 |
| FR-ADM-004 | Menu category management (CRUD) | M | OW, MG | J2 |
| FR-ADM-005 | Menu item management: name, price, image, availability | M | OW, MG | J2 |
| FR-ADM-006 | Variants and modifier groups management | M | OW, MG | J2 |
| FR-ADM-007 | Allergens and dietary labels management | M | OW, MG | J2 |
| FR-ADM-008 | Customer list, profile, order history | M | OW, MG | — |
| FR-ADM-009 | Staff invitation and role assignment | M | OW | J11 |
| FR-ADM-010 | Role and branch-scope editing | M | OW | J11 |
| FR-ADM-011 | Reservation calendar and list | M | OW, MG | J8 |
| FR-ADM-012 | Branch management (create, edit, activate) | M | OW | J1 |
| FR-ADM-013 | Discount code creation and management | S | OW, MG | J4 |
| FR-ADM-014 | Report list (revenue, product, category, peak hours) | S | OW, MG | J10 |
| FR-ADM-015 | Restaurant settings: branding, hours, timezone, currency, tax | M | OW | J1 |
| FR-ADM-016 | Order list, filters, detail view | M | OW, MG, CA | J5, J9 |
| FR-ADM-017 | Order status manual override (state-machine gated) | M | OW, MG | J9 |
| FR-ADM-018 | Audit log viewer | S | OW | — |
| FR-ADM-019 | CSV export for orders and reports | S | OW, MG | J10 |

---

## Module 3 — Kitchen Display System (KDS)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-KDS-001 | Dedicated KDS route `/kitchen/*` | M | KS | J5 |
| FR-KDS-002 | Incoming orders via Ably (branch channel) | M | KS | J5 |
| FR-KDS-003 | Accept → Preparing → Ready → Completed transitions | M | KS | J5 |
| FR-KDS-004 | Preparation timers per order | M | KS | J5 |
| FR-KDS-005 | Priority ordering (oldest first, configurable) | S | KS | J5 |
| FR-KDS-006 | Modifiers and special instructions displayed prominently | M | KS | J5 |
| FR-KDS-007 | Sound notification on new order (toggleable) | S | KS | J5 |
| FR-KDS-008 | Connection status indicator | M | KS | J6 |
| FR-KDS-009 | Reconnect with state resync | M | KS | J6 |
| FR-KDS-010 | Duplicate-event protection (event IDs) | M | KS | J5 |
| FR-KDS-011 | Read-only low-stock alert banner | S | KS, IM | J7 |
| FR-KDS-012 | High-contrast, large-touch UI | M | KS | J5 |

---

## Module 4 — Inventory Management (INV)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-INV-001 | Ingredient CRUD (name, unit, cost) | M | IM, OW | J7 |
| FR-INV-002 | Units of measurement and conversions | M | IM | J7 |
| FR-INV-003 | Recipes: link menu items + variants + modifiers to ingredients | M | IM, OW | J7 |
| FR-INV-004 | Stock ledger: every change as an immutable movement | M | IM | J7 |
| FR-INV-005 | Automatic stock deduction on order accepted/completed | M | — | J7 |
| FR-INV-006 | Idempotent deduction (once per order) | M | — | J7 |
| FR-INV-007 | Reversal via compensating movements on cancel | M | — | J9 |
| FR-INV-008 | Low-stock thresholds + alerts | S | IM, KS | J7 |
| FR-INV-009 | Suppliers CRUD | S | IM | — |
| FR-INV-010 | Purchase orders (create, receive) | S | IM | — |
| FR-INV-011 | Waste tracking | S | IM | — |
| FR-INV-012 | Inventory valuation (current stock × cost) | S | IM, OW | J10 |
| FR-INV-013 | Stock reconciliation / manual adjust with reason | S | IM | — |
| FR-INV-014 | Configurable insufficient-stock policy (block vs allow negative) | M | OW | J7 |

---

## Module 5 — Reservations (RES)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-RES-001 | Public booking form (date, time, party size, branch) | M | GC, RC | J8 |
| FR-RES-002 | Server-side availability (tables, hours, timezone) | M | — | J8 |
| FR-RES-003 | Overlap prevention under concurrency (transactional) | M | — | J8 |
| FR-RES-004 | Reservation confirmation shown + email preview | M | GC, RC | J8 |
| FR-RES-005 | Customer cancellation (if policy allows) | S | RC | — |
| FR-RES-006 | Admin calendar view (day/week) | M | OW, MG | J8 |
| FR-RES-007 | Admin list view with filters | M | OW, MG | J8 |
| FR-RES-008 | Admin create/edit/cancel reservation | M | OW, MG | J8 |
| FR-RES-009 | Reservation events history | S | OW, MG | — |
| FR-RES-010 | Table assignment | S | OW, MG | J8 |

---

## Module 6 — Customer Management (CUS)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-CUS-001 | Customer profiles (name, contact, addresses) | M | OW, MG | — |
| FR-CUS-002 | Order history per customer | M | OW, MG, RC | J6 |
| FR-CUS-003 | Reservation history per customer | S | OW, MG | — |
| FR-CUS-004 | Customer preferences (allergens, favorites) | S | RC | — |
| FR-CUS-005 | Customer segmentation (new / repeat / VIP foundation) | C | OW, MG | J10 |
| FR-CUS-006 | Customer activity log | C | OW | — |
| FR-CUS-007 | Guest order claiming via email link | C | GC | J4 |

---

## Module 7 — Business Intelligence (BI)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-BI-001 | Daily / weekly / monthly revenue | M | OW, MG | J10 |
| FR-BI-002 | Gross sales, discounts, refunds, net sales | M | OW, MG | J10 |
| FR-BI-003 | Average order value | M | OW, MG | J10 |
| FR-BI-004 | Product performance (units, revenue, margin) | M | OW, MG | J10 |
| FR-BI-005 | Category performance | S | OW, MG | J10 |
| FR-BI-006 | Peak ordering hours heatmap | S | OW, MG | J10 |
| FR-BI-007 | Customer retention (repeat rate) | C | OW | J10 |
| FR-BI-008 | Branch comparison | S | OW | J10 |
| FR-BI-009 | Estimated gross profit (revenue − recipe ingredient cost) | S | OW | J10 |
| FR-BI-010 | Menu engineering quadrants (Stars / Plowhorses / Puzzles / Dogs) | S | OW | J10 |
| FR-BI-011 | Date-range filters on every report | M | OW, MG | J10 |
| FR-BI-012 | CSV export of reports | S | OW, MG | J10 |

---

## Module 8 — Multi-Tenant SaaS (SAAS)

| ID | Feature | Priority | Persons | Journey |
|---|---|---|---|---|
| FR-SAAS-001 | Restaurant creation by owner | M | OW | J1 |
| FR-SAAS-002 | Unique restaurant slug | M | OW | J1 |
| FR-SAAS-003 | Memberships linking users to restaurants + roles | M | OW | J11 |
| FR-SAAS-004 | Server-side tenant resolution (never trust client) | M | — | J12 |
| FR-SAAS-005 | Server-side RBAC on every protected route | M | — | J12 |
| FR-SAAS-006 | Branch-scoped access for branch-level roles | M | — | J12 |
| FR-SAAS-007 | Cross-tenant denial returns 404, logged | M | — | J12 |
| FR-SAAS-008 | Audit log for sensitive actions | S | OW, PA | — |
| FR-SAAS-009 | Invitations with expiry + signed link | M | OW | J11 |
| FR-SAAS-010 | Platform admin: view restaurants, suspend | C | PA | — |
| FR-SAAS-011 | Feature flags for provider toggles (Ably, Cloudinary, etc.) | M | — | — |
| FR-SAAS-012 | Restaurant-scoped settings (branding, tax, hours, service modes) | M | OW | J1 |

---

## Cross-cutting (XCUT)

| ID | Feature | Priority | Journey |
|---|---|---|---|
| FR-XCUT-001 | Email sending via preview mode by default | M | J1, J4, J8, J11 |
| FR-XCUT-002 | Payments via Stripe Test Mode or simulated adapter | M | J4 |
| FR-XCUT-003 | Idempotency on order creation | M | J4 |
| FR-XCUT-004 | Idempotency on payment intent | M | J4 |
| FR-XCUT-005 | Webhook signature verification, duplicate protection | M | J4 |
| FR-XCUT-006 | Rate limiting on public write endpoints | S | J4, J8 |
| FR-XCUT-007 | Consistent JSON error envelope `{ error: { code, message } }` | M | — |
| FR-XCUT-008 | Zod validation on all request bodies | M | — |
| FR-XCUT-009 | Loading / empty / error / success UI states everywhere | M | — |
| FR-XCUT-010 | WCAG 2.2 AA target, keyboard nav, focus rings, reduced motion | S | — |
| FR-XCUT-011 | Structured logger with request IDs (no PII) | S | — |
| FR-XCUT-012 | Health endpoint `/api/v1/health` | M | — |

---

## Summary

Total features: **86**
- Must: 55
- Should: 26
- Could: 5

Step 4 (MVP) will classify these further and lock the delivery scope.
Steps 31–94 implement these IDs. Any new feature must be added here first.