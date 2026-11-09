# RestaurantOS — Project Status

## Current Step
Step 2 — User Journeys (complete, awaiting verification)

## Completed Steps
- Step 0 — Project Kickoff
- Step 1 — User Personas
- Step 2 — User Journeys

## Pending Steps
- Steps 3–100 per master roadmap

## Fixed Decisions
- Budget: $0/month. No paid plans, no trials, no credit cards for paid upgrades.
- No public deployment during Steps 0–100. No `vercel deploy`.
- One Express app → one Vercel Function (`api/index.ts`).
- One Neon project, one primary branch, one database.
- Stack: React, Vite, TypeScript, Tailwind, Express, Drizzle, Better Auth, Ably, Cloudinary, Resend, Stripe Test Mode.
- Windows 11 + CMD + Notepad only.
- Multi-machine: Git + private GitHub repo. Pull on start, commit+push on stop. `.env` never committed.

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
- `docs/PERSONAS.md` — 8 personas
- `docs/USER_JOURNEYS.md` — 12 journeys (J1–J12)

## Known Risks
- Vercel Hobby is non-commercial / personal use only.
- Neon scale-to-zero causes first-connection delay after 5 min inactivity.
- Ably free tier message counting includes fan-out delivery.
- Cloudinary credits consumed by transformations + storage + bandwidth together.
- Multi-machine edit conflicts if pull/push discipline is skipped.

## Test Results
- None yet

## Provider Usage Notes
- Check provider dashboards manually. Application cannot read authoritative billing data.