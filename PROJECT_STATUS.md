# RestaurantOS — Project Status

## Current Step
Step 7 — Permission Matrix (complete, awaiting verification)

## Completed Steps
- Step 0 — Project Kickoff
- Step 1 — User Personas
- Step 2 — User Journeys
- Step 3 — Functional Requirements
- Step 4 — MVP Definition
- Step 5 — Non-Functional Requirements
- Step 6 — Business Workflows
- Step 7 — Permission Matrix

## Pending Steps
- Steps 8–100 per master roadmap

## Fixed Decisions
- Budget: $0/month. No paid plans, no trials, no credit cards for paid upgrades.
- No public deployment during Steps 0–100. No `vercel deploy`.
- One Express app → one Vercel Function (`api/index.ts`).
- One Neon project, one primary branch, one database.
- Stack: React, Vite, TypeScript, Tailwind, Express, Drizzle, Better Auth, Ably, Cloudinary, Resend, Stripe Test Mode.
- Windows 11 + CMD + Notepad only.
- Multi-machine: Git + private GitHub repo. Pull on start, commit+push on stop. `.env` never committed.
- `PROJECT_STATUS.md` lives at **project root only** (never in `docs/`).
- File creation habit: `type nul > path\FILE.md` then `notepad path\FILE.md`; edit with **Ctrl+S**, never Save As.
- Notepad editing uses **absolute paths** to prevent directory drift.

## Free-Tier Planning Ceilings (verified 2026-11-09)
| Service | Planned ceiling |
|---|---|
| Vercel Hobby | 1M function invocations/mo, 4 active CPU-hrs/mo, 360 GB-hrs provisioned memory |
| Neon Free | 100 CU-hrs/project/mo, 1 GB storage/project, 5 GB public transfer/project/mo |
| Ably Free | 6M messages/mo, 200 concurrent connections, 200 concurrent channels |
| Cloudinary Free | 25 credits/mo |
| Resend Free | 3,000 emails/mo, 100 emails/day |
| Stripe Test Mode | Test keys only, no real money |

## Documents
- `docs/PERSONAS.md`
- `docs/USER_JOURNEYS.md`
- `docs/FUNCTIONAL_REQUIREMENTS.md` — 86 features
- `docs/MVP_DEFINITION.md` — MVP / v1 / Later tiers
- `docs/NON_FUNCTIONAL_REQUIREMENTS.md` — 9 NFR groups
- `docs/BUSINESS_WORKFLOWS.md` — order/payment/inventory/reservation/kitchen rules
- `docs/PERMISSION_MATRIX.md` — roles × permissions, enforcement rules

## MVP Scope (locked)
~34 features: tenancy + auth + menu + storefront + ordering + payments (simulated) + kitchen + tenant safety.

## Locked Business Rules
- Order states: pending_confirmation → accepted → preparing → ready → completed (plus rejected/cancelled terminals).
- Payment states independent from order states.
- Inventory = ledger of movements; idempotent per order; default deduct on `accepted`.
- Reservations overlap-prevented at DB transaction level.
- Money: integer minor units, tax in basis points, banker's rounding.
- Timestamps in UTC; branch IANA TZ for display and hours.
- Tenant resolved server-side from session + membership; cross-tenant → 404.

## Locked Permission Rules
- 8 roles with branch vs tenant scope.
- Permission names `<domain>:<action>[:<qualifier>]`.
- Middleware chain: requireAuth → requireTenant → requirePermission.
- Cross-tenant → 404; same-tenant permission failure → 403 with PERMISSION_DENIED.
- Frontend matrix is UX only; backend is authoritative.

## Known Risks
- Vercel Hobby is non-commercial / personal use only.
- Neon scale-to-zero causes first-connection delay after 5 min inactivity.
- Ably free tier message counting includes fan-out delivery.
- Cloudinary credits consumed by transformations + storage + bandwidth together.
- Multi-machine edit conflicts if pull/push discipline is skipped.
- Scope creep risk: v1 features leaking into Phase 1–6 work.

## Test Results
- None yet

## Provider Usage Notes
- Check provider dashboards manually. Application cannot read authoritative billing data.