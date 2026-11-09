# RestaurantOS — Project Status

## Current Step
Step 11 — Project Initialization (complete, awaiting verification)

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
- Step 10 — Environment Inspection (Node 26, npm 11, git 2.56, Vercel 65 — Laptop A + B)
- Step 11 — Project Initialization

## Pending Steps
- Steps 12–100

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
- **Single** root `package.json` (ESM `"type": "module"`); no per-folder package.json.
- `.gitattributes` forces LF; only `.cmd`/`.bat` keep CRLF.

## Free-Tier Planning Ceilings (verified 2026-11-09)
| Service | Planned ceiling |
|---|---|
| Vercel Hobby | 1M invocations/mo, 4 CPU-hrs/mo, 360 GB-hrs provisioned memory |
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

## Known Risks
- Vercel Hobby is non-commercial / personal use only.
- Neon scale-to-zero causes first-connection delay.
- Ably free tier message counting includes fan-out delivery.
- Cloudinary credits consumed by transforms + storage + bandwidth.
- Multi-machine edit conflicts if pull/push discipline is skipped.
- Scope creep risk: v1 features leaking into MVP.
- `vercel dev -L` Express+Vite routing must be proven at Step 19.

## Test Results
- None yet

## Provider Usage Notes
- Check provider dashboards manually. Application cannot read authoritative billing data.