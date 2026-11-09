# RestaurantOS — Project Status

## Current Step
Step 14 — Tailwind CSS v4 (complete, awaiting verification)

## Completed Steps
- Step 0 — Project Kickoff
- Step 1 — User Personas
- Step 2 — User Journeys
- Step 3 — Functional Requirements
- Step 4 — MVP Definition
- Step 5 — Non-Functional Requirements
- Step 6 — Business Workflows
- Step 7 — Permission Matrix
- Step 8 — Domain Models
- Step 9 — System Architecture
- Step 10 — Environment Inspection (Laptop A + B)
- Step 11 — Project Initialization
- Step 12 — Vite + React + TypeScript scaffold
- Step 13 — Install approved dependencies
- Step 14 — Tailwind CSS v4

## Pending Steps
- Steps 15–100

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
- Notepad editing uses **absolute paths** to prevent directory drift.
- Single root `package.json` (ESM `"type": "module"`).
- `.gitattributes` forces LF; `.cmd`/`.bat` keep CRLF.
- `index.html` at root → `/frontend/main.tsx`; React lives in `frontend/`.
- Single `tsconfig.json` at root; `build` = `tsc --noEmit && vite build`.
- **TypeScript pinned to `~5.9.3`** — `typescript-eslint` (8.x) does not support TS 6+/7+.
- Express **5.x** installed (async errors auto-bubble; do not copy Express 4 middleware patterns).
- Do **NOT** run `npm audit fix --force`.

## Free-Tier Planning Ceilings (verified 2026-11-09)
| Service | Planned ceiling |
|---|---|
| Vercel Hobby | 1M invocations/mo, 4 active CPU-hrs/mo, 360 GB-hrs provisioned memory |
| Neon Free | 100 CU-hrs/project/mo, 1 GB storage/project, 5 GB public transfer/project/mo |
| Ably Free | 6M msgs/mo, 200 concurrent connections, 200 concurrent channels |
| Cloudinary Free | 25 credits/mo |
| Resend Free | 3,000 emails/mo, 100 emails/day |
| Stripe Test Mode | Test keys only, no real money |

## Documents
- `docs/PERSONAS.md`
- `docs/USER_JOURNEYS.md`
- `docs/FUNCTIONAL_REQUIREMENTS.md`
- `docs/MVP_DEFINITION.md`
- `docs/NON_FUNCTIONAL_REQUIREMENTS.md`
- `docs/BUSINESS_WORKFLOWS.md`
- `docs/PERMISSION_MATRIX.md`
- `docs/DOMAIN_MODELS.md`
- `docs/SYSTEM_ARCHITECTURE.md`

## MVP Scope (locked)
~34 features: tenancy + auth + menu + storefront + ordering + payments (simulated) + kitchen + tenant safety.

## Design System (Step 14)
Tailwind v4 via `@tailwindcss/vite`. No `tailwind.config.js`, no `postcss.config.js` (deviation from Step 9 §2 — theming is in `frontend/index.css` via `@theme {}`).
- Brand: warm copper (`brand-50`…`brand-900`, primary = `brand-600` = #c15e2c)
- Ink: neutral dark scale (`ink-50`…`ink-950`)
- Semantic: `success`, `warning`, `danger`
- Radius: `sm=6px`, `md=10px`, `lg=14px`, `xl=20px`
- Font: system-ui stack (custom font added in Step 20 if needed)

## Installed Dependencies (Step 13)
Server + shared runtime: express@5, cors, cookie-parser, better-auth, drizzle-orm, @neondatabase/serverless, zod, stripe, ably, cloudinary, resend
Frontend runtime: react@19, react-dom@19, react-router-dom, @tanstack/react-query, @tanstack/react-table, zustand, react-hook-form, @hookform/resolvers, framer-motion, lucide-react, sonner, recharts, ably, react-qr-code
Dev: vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, typescript@~5.9.3, @types/react, @types/react-dom, @types/node, @types/express, @types/cors, @types/cookie-parser, drizzle-kit, tsx, eslint, @eslint/js, typescript-eslint, prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, vitest, @testing-library/react, @testing-library/jest-dom, jsdom, supertest, @types/supertest, @playwright/test

## Known Risks
- Vercel Hobby is non-commercial / personal use only.
- Neon scale-to-zero causes first-connection delay.
- Ably free tier message counting includes fan-out delivery.
- Cloudinary credits consumed by transforms + storage + bandwidth.
- Multi-machine edit conflicts if pull/push discipline is skipped.
- Scope creep risk: v1 features leaking into MVP.
- `vercel dev -L` Express+Vite routing must be proven at Step 19.
- `npm audit fix --force` can break working setup — never run it.

## Test Results
- None yet

## Provider Usage Notes
- Check provider dashboards manually. Application cannot read authoritative billing data.