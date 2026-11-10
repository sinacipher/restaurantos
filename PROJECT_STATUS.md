# RestaurantOS — Project Status

## Current Step
Step 27 — Core Domain Schema (complete)

## Completed Steps
- Step 0–9 — Planning
- Step 10 — Environment Inspection (Laptop A + B)
- Step 11 — Project Initialization
- Step 12 — Vite + React + TypeScript scaffold
- Step 13 — Install approved dependencies
- Step 14 — Tailwind CSS v4
- Step 15 — TypeScript strict mode + path aliases
- Step 16 — ESLint + Prettier
- Step 17 — Environment variables
- Step 18 — Folder skeleton + Express backbone
- Step 19 — `vercel dev --local` POC
- Step 20 — Design System Foundation
- Step 21 — Neon connection verified
- Step 22 — Database connectivity (Drizzle Client)
- Step 23 — Drizzle Configuration
- Step 24 — Database Conventions
- Step 25 — Authentication Schema
- Step 26 — Better Auth Configuration
- Step 27 — Core Domain Schema (complete)
## Pending Steps
- Steps 27–100

## Fixed Decisions
- Budget: $0/month. No paid plans, no trials, no credit cards for paid upgrades.
- No public deployment during Steps 0–100. No `vercel deploy`.
- One Express app → one Vercel Function (`api/index.ts`).
- One Neon project, one primary branch, one database.
- Stack: React, Vite, TypeScript, Tailwind, Express, Drizzle, Better Auth, Ably, Cloudinary, Resend, Stripe Test Mode.
- Windows 11 + CMD + Notepad only.
- Multi-machine: Git + private GitHub repo. Pull on start, commit+push on stop. `.env` never committed.
- `PROJECT_STATUS.md` lives at **project root only**.
- File creation habit: `type nul > path\FILE.md` then `notepad path\FILE.md`; edit with **Ctrl+S**, never Save As.
- Single root `package.json` (ESM `"type": "module"`).
- **TypeScript pinned to `~5.9.3`**. Express **5.x**.
- **Local dev command:** `vercel dev --local`.
- **Backend imports use `.js` extensions** (ESM).
- **`api/index.ts` is the only Vercel function.**
- **Neon connection verified.**
- **Drizzle client:** `db` in `server/database/client.ts`.
- **DB Conventions:** UUIDs for IDs, integer minor units for money, UTC timestamps.
- **Auth tables:** `users`, `sessions`, `accounts`, `verifications` created.
- **Better Auth:** `auth` instance in `server/auth/auth.ts`, mounted at `/api/v1/auth`.

## Free-Tier Planning Ceilings
(Verified 2026-11-09 — Vercel, Neon, Ably, Cloudinary, Resend, Stripe Test)

## MVP Scope (locked)
~34 features: tenancy + auth + menu + storefront + ordering + payments (simulated) + kitchen + tenant safety.

## Design System (Step 14, Step 20)
- **Tokens:** Tailwind v4 via `@theme`.
- **Components:** `Button`, `Input`, `Card`, `Badge` + `cn()` utility.

## Backend Backbone (Step 18–26)
- `server/config/env.ts` — Zod-validated env.
- `server/shared/errors.ts` — AppError hierarchy.
- `server/middleware/*` — requestId, errorHandler.
- `server/app.ts` — `buildApp()`.
- `api/index.ts` — exports app.
- `server/database/client.ts` — Drizzle instance.
- `server/database/schema/*` — Auth tables.
- `server/auth/auth.ts` — Better Auth instance.
- `server/modules/auth/routes.ts` — Better Auth Express handler.
- `drizzle.config.ts` — migration configuration.

## Installed Dependencies
Server: express@5, cors, cookie-parser, better-auth, drizzle-orm, @neondatabase/serverless, zod, stripe, ably, cloudinary, resend
Frontend: react@19, react-dom@19, react-router-dom, @tanstack/react-query, @tanstack/react-table, zustand, react-hook-form, @hookform/resolvers, framer-motion, lucide-react, sonner, recharts, ably, react-qr-code, clsx, tailwind-merge
Dev: vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, typescript@~5.9.3, eslint, prettier, vitest, @playwright/test, dotenv, etc.

## Known Risks
- Vercel Hobby is non-commercial / personal use only.
- Neon scale-to-zero causes first-connection delay.
- `vercel dev` on Laptop B requires Admin CMD.
- `npm audit fix --force` can break working setup — never run it.

## Test Results
- Step 15–24: All green (TS + Lint).
- Step 25: Migration applied successfully.
- Step 26: `npx tsc --noEmit` → 0 errors (pending).