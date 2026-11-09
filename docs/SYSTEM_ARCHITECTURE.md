# RestaurantOS — System Architecture

Version: 1.0
Last updated: Step 9

Final planning document. Steps 10–100 implement this. Any deviation requires updating
this file with a dated change note.

---

## 1. High-level architecture
┌──────────────────────────────────────────────────────────────────┐
│ Browser │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│ │ Public Storefront│ │ Admin Dashboard │ │ KDS (Kitchen)│ │
│ │ (React + Vite) │ │ (React + Vite) │ │ (React+Vite) │ │
│ └────────┬─────────┘ └────────┬─────────┘ └──────┬───────┘ │
│ │ │ │ │
│ └─────────────────────┼─────────────────────┘ │
│ │ │
│ fetch/JSON (same-origin) /api/v1/* │
└─────────────────────────────────┼────────────────────────────────┘
│
┌────────────▼────────────┐
│ Vercel Function (1) │
│ api/index.ts │
│ Express app │
│ ├─ /api/v1/auth │
│ ├─ /api/v1/restaurants │
│ ├─ /api/v1/menu │
│ ├─ /api/v1/orders │
│ ├─ /api/v1/payments │
│ ├─ /api/v1/kitchen │
│ ├─ /api/v1/inventory │
│ ├─ /api/v1/reservations│
│ ├─ /api/v1/customers │
│ ├─ /api/v1/analytics │
│ └─ /api/v1/health │
└────────┬────────────────┘
│
┌─────────┬───────────┼───────────┬──────────┐
│ │ │ │ │
┌────▼────┐ ┌──▼───┐ ┌────▼────┐ ┌────▼────┐ ┌───▼────┐
│ Neon │ │Ably │ │Cloudin- │ │ Resend │ │ Stripe │
│ Postgres│ │Real- │ │ ary │ │ (email) │ │ (test) │
│(Drizzle)│ │ time │ │(images) │ │ │ │ │
└─────────┘ └──────┘ └─────────┘ └─────────┘ └────────┘

text

- **Client ↔ Server:** same-origin HTTP. No CORS in local dev (Vite proxy / `vercel dev`).
- **Server ↔ DB:** Drizzle ORM over Neon pooled connection. Direct (unpooled) URL for migrations only.
- **Server → Ably:** HTTP publish after transaction commit only.
- **Server ↔ Cloudinary:** signed upload URLs generated server-side; browser uploads direct to Cloudinary.
- **Server → Resend:** server-side only; preview mode by default.
- **Server ↔ Stripe:** server-side only; test keys; webhook endpoint signature-verified.

---

## 2. Directory layout (target)
C:\Projects\RestaurantOS
├─ .env.example
├─ .env.local (gitignored, per-machine)
├─ .gitignore
├─ PROJECT_STATUS.md
├─ README.md
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ postcss.config.js
├─ vercel.json
├─ drizzle.config.ts
├─ index.html
│
├─ api
│ └─ index.ts (Express app export — the ONLY Vercel function)
│
├─ frontend
│ ├─ main.tsx
│ ├─ App.tsx
│ ├─ index.css
│ ├─ router.tsx
│ ├─ components
│ │ ├─ ui
│ │ └─ layout
│ ├─ features
│ │ ├─ auth
│ │ ├─ dashboard
│ │ ├─ menu
│ │ ├─ orders
│ │ ├─ kitchen
│ │ ├─ inventory
│ │ ├─ reservations
│ │ ├─ customers
│ │ ├─ analytics
│ │ └─ storefront
│ ├─ hooks
│ ├─ lib
│ │ ├─ api-client.ts
│ │ └─ query-client.ts
│ ├─ stores
│ └─ styles
│
├─ server
│ ├─ app.ts (buildApp(): express.Express)
│ ├─ config
│ │ ├─ env.ts (Zod-validated env)
│ │ └─ features.ts (feature flags)
│ ├─ database
│ │ ├─ client.ts (Drizzle + Neon pooled)
│ │ ├─ schema
│ │ └─ migrations
│ ├─ middleware
│ │ ├─ require-auth.ts
│ │ ├─ require-tenant.ts
│ │ ├─ require-permission.ts
│ │ ├─ validate.ts
│ │ ├─ error-handler.ts
│ │ └─ rate-limit.ts
│ ├─ modules
│ │ ├─ auth
│ │ ├─ restaurants
│ │ ├─ branches
│ │ ├─ menu
│ │ ├─ orders
│ │ ├─ payments
│ │ ├─ kitchen
│ │ ├─ inventory
│ │ ├─ reservations
│ │ ├─ customers
│ │ ├─ analytics
│ │ └─ health
│ ├─ providers
│ │ ├─ ably.ts
│ │ ├─ cloudinary.ts
│ │ ├─ email
│ │ │ ├─ preview.ts
│ │ │ └─ resend.ts
│ │ └─ payments
│ │ ├─ simulated.ts
│ │ └─ stripe-test.ts
│ ├─ shared
│ │ ├─ errors.ts
│ │ ├─ logger.ts
│ │ └─ response.ts
│ └─ utils
│
├─ shared\ (imported by both server and frontend)
│ ├─ permissions.ts
│ ├─ schemas
│ ├─ types
│ └─ constants
│
├─ docs
│ └─ *.md
│
└─ tests
├─ unit
├─ integration
└─ e2e\

text

Rules:
- `api/index.ts` is 5–10 lines: imports `buildApp()`, exports default.
- `server/app.ts` builds the Express app. All routes registered here.
- `server/modules/*/` contains `routes.ts`, `controller.ts`, `service.ts`, `repository.ts`, `schema.ts`. Files created only when needed.
- Business logic in `service.ts` — never in controllers, never in routes.
- `shared/` is frontend/backend shared code (permissions, Zod schemas, types). No server-only imports here.

---

## 3. API conventions

- **Base:** `/api/v1`
- **Content-Type:** `application/json` only.
- **Auth:** Better Auth session cookie (`better-auth.session_token`). HttpOnly, Secure (prod), SameSite=Lax.
- **Error envelope:**
  ```json
  { "error": { "code": "PERMISSION_DENIED", "message": "…", "details": { } } }
Success envelope: raw object or { data: ... } consistently per endpoint, documented in Step 34+.

Status codes:

200 OK, 201 Created, 204 No Content

400 VALIDATION_ERROR

401 UNAUTHENTICATED

403 PERMISSION_DENIED

404 NOT_FOUND (also used for cross-tenant to hide existence)

409 CONFLICT / INVALID_TRANSITION / INSUFFICIENT_STOCK

422 BUSINESS_RULE_VIOLATION

429 RATE_LIMITED

500 INTERNAL_ERROR (never leaks stack)

Idempotency: Idempotency-Key header (UUID). Required on POST /orders, POST /payments, POST /webhooks/stripe.

Request IDs: every request gets X-Request-Id header (uuid), logged with errors.

Pagination: ?limit=20&cursor=<opaque>; response { items, next_cursor }.

Filters: explicit, whitelisted query params per endpoint.

4. Authentication & sessions
Better Auth with Drizzle adapter (Postgres).

Password hashing: Better Auth default (scrypt) — do not override.

Session stored in sessions table; cookie signed.

Session TTL: 7 days, sliding refresh.

Roles: Platform Admin = users.is_platform_admin. Restaurant roles = restaurant_memberships.role.

Route protection: requireAuth → requireTenant → requirePermission.

Public routes explicitly marked (storefront reads, sign-in, sign-up, reservation create, health, webhooks).

5. Multi-tenancy
Tenant = restaurant. Resolved from:

Path param :restaurantId (admin), :slug (public storefront).
Looked up membership for (user_id, restaurant_id).
Attached to ctx.restaurantId.
All repository methods take (ctx, ...args) — impossible to query without tenant.

Cross-tenant → 404 always.

No RLS in MVP (app-level enforcement). RLS considered a future hardening layer.

6. Data layer
ORM: Drizzle.

Client:

server/database/client.ts → drizzle(neon(process.env.DATABASE_URL)) (pooled).

drizzle.config.ts → DATABASE_URL_UNPOOLED (direct, migrations).

Migrations: Drizzle Kit, forward-only. One migration per step for auditability.

Transactions: db.transaction(async (tx) => { ... }) — all multi-table writes inside.

Connection retry: first-connection after Neon idle → retry 3× with 300 ms/900 ms/2700 ms backoff.

Seeding: server/database/seed.ts — idempotent. Two restaurants (demo-a, demo-b) for tenant tests.

7. Real-time (Ably)
Server publishes to channels:

orders:branch:<branchId> — order lifecycle events.

reservations:branch:<branchId> — reservation events.

inventory:branch:<branchId> — low stock.

Client obtains Ably token from POST /api/v1/ably/token (server-issued capability scoped to channels the user is allowed).

Publish only after DB commit.

Every event has { id, type, ts, data }. id is uuid used for client-side dedup.

No publish on UI chatter.

8. Payments
Provider selection: PAYMENT_MODE env → simulated | stripe_test.

Stripe: test keys only (sk_test_…, pk_test_…). Refuse to start if sk_live_ detected.

Flow: create order → create payment intent (idempotency key) → return client secret → client confirms → webhook updates payment state.

Simulated: instant paid on sim_ok token, failed on sim_fail.

Webhook: /api/v1/webhooks/stripe — verified by stripe.webhooks.constructEvent. Dedup on provider_event_id.

9. Images (Cloudinary)
Signed uploads: server generates upload_signature per request; client uploads direct.

Allowed mime: image/jpeg, image/png, image/webp. Max 5 MB.

Display transformations pinned (no dynamic churn): f_auto,q_auto,w_1200, w_800, w_400.

Fallback: local /public/images/* if Cloudinary disabled.

10. Email (Resend)
Modes: preview (default), resend.

Preview: writes .emails/<timestamp>-<id>.html and logs. No network.

Resend: only for explicit tests to developer-owned recipients during MVP.

Templates: order confirmation, reservation confirmation/cancellation, password reset, invitation.

Idempotency: no double-send per (template, entity id).

11. Configuration & feature flags
All env vars validated by Zod at startup. Missing required → fail fast with clear message.

Var	Required	Default	Notes
DATABASE_URL	yes	—	Neon pooled
DATABASE_URL_UNPOOLED	yes (migrations)	—	Neon direct
BETTER_AUTH_SECRET	yes	—	32+ bytes
BETTER_AUTH_URL	yes	http://localhost:3000	
EMAIL_MODE	no	preview	preview | resend
PAYMENT_MODE	no	simulated	simulated | stripe_test
ENABLE_ABLY	no	true	boolean
ABLY_API_KEY	if ably	—	server only
ENABLE_CLOUDINARY	no	false	boolean
CLOUDINARY_CLOUD_NAME	if cloudinary	—	
CLOUDINARY_API_KEY	if cloudinary	—	
CLOUDINARY_API_SECRET	if cloudinary	—	server only
RESEND_API_KEY	if email=resend	—	
RESEND_FROM	if email=resend	—	verified sender
STRIPE_SECRET_KEY	if stripe_test	—	must be sk_test_
STRIPE_WEBHOOK_SECRET	if stripe_test	—	
VITE_PUBLIC_BASE_URL	no	http://localhost:3000	
Never commit .env.local. .env.example committed with placeholders.

12. Security model (summary)
Session cookie: HttpOnly, Secure in prod, SameSite=Lax.

CSRF: for cookie-auth state-changing endpoints, require Origin match (same-origin enforced by Vercel).

Rate limiting: per-IP for public writes (order create, reservation create, auth sign-in); per-session for admin writes.

Input: all bodies Zod-validated; query strings coerced; IDs uuid-checked.

Output: never return raw errors; log full error with requestId server-side.

Cross-tenant → 404; permission fail → 403.

Webhooks: signature verified; dedup on provider_event_id.

Secrets only in env; not in client bundle (Vite only inlines VITE_*).

Stripe live-key guard: refuse to start if any sk_live_ found.

PII: no emails/phones in logs; only user/order ids.

13. Risk register
ID	Risk	Likelihood	Impact	Mitigation
R1	vercel dev -L cannot route Express + Vite together locally	Medium	High	Step 19 proves minimal setup before building; fallback = Vite proxy to local Express (deviation logged).
R2	Neon cold-start 5s on first query after idle	High	Low	Retry with backoff; health endpoint warms.
R3	Ably free tier message fan-out	Medium	Medium	Publish only business events; test with 2 connections.
R4	Cloudinary credit burn from transforms	Low	Medium	Pin transforms; 5 MB cap; disable flag.
R5	Stripe webhook misses → order stuck pending	Medium	High	Reconciliation endpoint; simulated adapter for tests.
R6	Multi-machine Git conflicts	Medium	Low	Strict pull/push; commit before leaving.
R7	Scope creep (v1 leaking into MVP)	High	High	MVP_DEFINITION.md locked; FR tiers enforced.
R8	Drizzle + Better Auth schema conflicts	Medium	High	Use Better Auth's documented schema exactly; migration review at Step 25.
R9	TypeScript strict errors late	Medium	Low	Strict from Step 15; no any.
R10	Reservation concurrency race	Medium	High	Transactional availability + test in Step 78.
14. Dependency plan
Install at Step 13 (frontend) and Step 12 (server deps). Versions pinned by npm, lockfile committed.

Frontend:

react, react-dom, react-router-dom

@tanstack/react-query, @tanstack/react-table

zustand

react-hook-form, @hookform/resolvers, zod

tailwindcss, postcss, autoprefixer

framer-motion

lucide-react

sonner

recharts

ably (client)

react-qr-code (Step 47)

Backend (all in one package.json at root):

express, cors, cookie-parser

better-auth

drizzle-orm, @neondatabase/serverless, drizzle-kit

zod

stripe

ably

cloudinary

resend

rate limiting implemented in-memory for local dev (single-process safe)

Dev:

typescript, tsx

eslint, prettier

vitest, @testing-library/react, @testing-library/jest-dom, jsdom

supertest, @types/supertest

@playwright/test

vercel (CLI)

Verify at Step 13 that every package is MIT/Apache-2.0/BSD. Reject if not.

15. Free-tier quota verification (Step 9 re-check)
Re-verify at each provider's official docs. Recorded here as planning ceilings:

Provider	Official page	Planned ceiling
Vercel Hobby	vercel.com/docs/plans/hobby	1M invocations, 4 CPU-hrs, 360 GB-hrs provisioned, 100 GB fast data transfer
Neon Free	neon.com/pricing	100 CU-hrs, 1 GB storage, 5 GB public egress
Ably Free	ably.com/docs/platform/pricing/free	6M msgs/mo, 200 conns, 200 channels, 500 msg/s
Cloudinary Free	cloudinary.com/pricing	25 credits/mo
Resend Free	resend.com/pricing	100/day, 3000/mo
Stripe Test	docs.stripe.com/testing	unlimited test transactions
Usage targets: stay ≤ 30% of any monthly ceiling. Warnings documented in Step 96.

16. Phase 1 plan (Steps 10–19 preview)
10: env inspection (node, npm, git versions).

11: package.json, git confirm.

12: Vite + React + TS scaffold.

13: install all deps.

14: Tailwind config.

15: tsconfig strict.

16: ESLint + Prettier.

17: .env.example + .env.local.

18: full folder skeleton.

19: vercel dev -L proof-of-concept: React page + GET /api/v1/health returns { ok: true }.

Exit: vercel dev -L shows React page at http://localhost:3000, health endpoint returns 200, hot reload works.

17. Step 9 exit criteria
This document exists and is committed.

Directory layout above is the target for Step 18.

API conventions, error codes, env vars are locked.

Risk register recorded.

No code yet. Phase 1 begins Step 10.