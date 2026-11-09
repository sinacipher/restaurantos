# RestaurantOS — MVP Definition

Version: 1.0
Last updated: Step 4

Reference: docs/FUNCTIONAL_REQUIREMENTS.md (86 features)
Tiers: MVP (ship first) → v1 (next) → Later (deferred)

Rule: only MVP features are built in Phases 1–5 of the roadmap.
Any MVP-tier change requires updating this file AND Step 3.

---

## MVP — smallest end-to-end working product

Goal: **a single restaurant with one branch can be onboarded, publish a menu, take one online order, and complete it in the kitchen — with tenant safety enforced.**

### Included MVP features

**Tenancy & Auth (Phase 2–3)**
- FR-SAAS-001, 002, 003, 004, 005, 006, 007, 009, 011, 012
- FR-ADM-009, 010, 015

**Menu (Phase 4)**
- FR-ADM-004, 005, 006, 007
- FR-PUB-001, 002, 003, 004, 008, 009, 011, 015

**Public storefront (Phase 4)**
- FR-PUB-001…004, 008, 009, 011, 015
- (search/filters/SEO/reservations/QR deferred to v1 except table QR, which is MVP for dine-in)

**Ordering & Payments (Phase 5)**
- FR-PUB-011
- FR-ADM-016, 017
- FR-XCUT-002, 003, 004, 005, 006, 007, 008, 009, 012

**Kitchen (Phase 6)**
- FR-KDS-001, 002, 003, 004, 006, 008, 009, 010, 012

**Cross-cutting base**
- FR-XCUT-001 (email preview only), 007, 008, 009, 012

### MVP acceptance test (must pass to exit Phase 6)

1. Owner registers, creates a restaurant + one branch.
2. Owner creates 3 categories, 6 items with at least 1 modifier group.
3. Menu is published to the public storefront.
4. Guest customer opens `/r/:slug`, customizes an item, adds to cart, checks out.
5. Payment runs through the **simulated adapter** (Stripe test optional).
6. Order appears on KDS via Ably; kitchen Accepts → Preparing → Ready → Completed.
7. Owner sees the order in admin list with correct totals.
8. Restaurant B user is denied access to Restaurant A’s order (404).
9. All steps repeatable from seed data on a fresh database.

---

## v1 — next milestone after MVP

Adds reservations, inventory, customers, analytics. Built in Phases 7–9.

**Reservations**
- FR-RES-001, 002, 003, 004, 006, 007, 008

**Inventory**
- FR-INV-001, 002, 003, 004, 005, 006, 007, 014
- FR-INV-008, 009, 010, 011, 012, 013 (Should)

**Customers**
- FR-CUS-001, 002, 003, 004
- FR-PUB-013, 014

**Analytics**
- FR-BI-001, 002, 003, 004, 005, 006, 008, 009, 010, 011, 012

**Admin extras**
- FR-ADM-001, 002, 003, 008, 011, 012, 013, 014, 018, 019

**Storefront extras**
- FR-PUB-005, 006, 007, 010, 012, 013, 014, 016, 017

**Kitchen extras**
- FR-KDS-005, 007, 011

**SaaS extras**
- FR-SAAS-008, 010

**Cross-cutting extras**
- FR-XCUT-010, 011

---

## Later — deferred, not part of this build

- FR-CUS-005 (segmentation)
- FR-CUS-006 (activity log)
- FR-CUS-007 (guest claim link)
- FR-BI-007 (customer retention)
- FR-ADM-013 (discount codes — moved here to keep MVP lean; revisit if time allows)
- Any payment feature beyond Stripe Test Mode / simulated
- Any marketing / bulk email
- Multi-language menus
- Native mobile apps
- Third-party delivery integrations (UberEats/DoorDash/etc.)

---

## Feature count by tier

| Tier | Count | % of Step 3 |
|---|---|---|
| MVP | ~34 | 40% |
| v1 | ~42 | 49% |
| Later | ~10 | 11% |

---

## Phase exit criteria

| Phase | Exit test |
|---|---|
| Phase 1 (10–19) | `vercel dev -L` serves React + `/api/v1/health` returns 200 |
| Phase 2 (20–30) | Migrations run; 2 seed restaurants; tenant isolation test passes |
| Phase 3 (31–39) | Register, login, create restaurant + branch, invite staff, RBAC enforced |
| Phase 4 (40–49) | Menu published; public storefront renders from real DB |
| Phase 5 (50–59) | Order created, priced server-side, paid via simulated adapter, listed in admin |
| Phase 6 (60–67) | KDS receives via Ably; full state transition; reconnect works → **MVP DONE** |
| Phases 7–9 | v1 features layer in; MVP must remain green at each step |
| Phase 10–11 | Audits + full test suite + local production verify |

---

## Notes for later steps

- Steps 10–67 build **only MVP features**.
- Steps 68–94 add v1. Every v1 step must re-run the MVP acceptance test.
- Anything in “Later” stays out unless the MVP is fully green AND time allows.
- Adding/removing anything from MVP must be logged here with a date + reason.