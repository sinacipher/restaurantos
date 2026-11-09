# RestaurantOS — Non-Functional Requirements

Version: 1.0
Last updated: Step 5

These are measurable targets. They are verified at Step 97 (performance audit) and Step 98 (comprehensive testing). Any target marked **MVP** must be met before Phase 6 exit.

---

## 1. Performance

| ID | Requirement | Target | Tier |
|---|---|---|---|
| NFR-PERF-01 | Public storefront first contentful paint (cold, 4G) | ≤ 2.5 s | MVP |
| NFR-PERF-02 | Admin dashboard first meaningful paint | ≤ 3 s | MVP |
| NFR-PERF-03 | API p50 latency (excluding external providers) | ≤ 150 ms | MVP |
| NFR-PERF-04 | API p95 latency (excluding external providers) | ≤ 400 ms | MVP |
| NFR-PERF-05 | KDS new-order visible after Ably publish | ≤ 2 s | MVP |
| NFR-PERF-06 | Public storefront Lighthouse Performance (mobile) | ≥ 85 | v1 |
| NFR-PERF-07 | Frontend initial JS bundle (gzipped) | ≤ 250 KB | v1 |
| NFR-PERF-08 | Database query p95 (indexed paths) | ≤ 80 ms | v1 |
| NFR-PERF-09 | Menu images responsive, WebP/AVIF via Cloudinary | 100% | v1 |
| NFR-PERF-10 | Cold start of Express function (local emulator) | ≤ 1.5 s | v1 |

---

## 2. Security

| ID | Requirement | Tier |
|---|---|---|
| NFR-SEC-01 | Passwords hashed with Better Auth defaults (scrypt/argon2) | MVP |
| NFR-SEC-02 | All authenticated routes require a valid session cookie | MVP |
| NFR-SEC-03 | All protected routes enforce tenant + RBAC server-side | MVP |
| NFR-SEC-04 | Cross-tenant access returns 404 (never 403 for existence leaks) | MVP |
| NFR-SEC-05 | All request bodies validated with Zod | MVP |
| NFR-SEC-06 | Error responses never leak stack traces or SQL | MVP |
| NFR-SEC-07 | Cookies: `HttpOnly`, `Secure` in production, `SameSite=Lax` | MVP |
| NFR-SEC-08 | CORS locked to same origin in dev; explicit allowlist later | MVP |
| NFR-SEC-09 | Rate limiting on public write endpoints (per IP + per session) | MVP |
| NFR-SEC-10 | Webhook signature verification (Stripe) | MVP |
| NFR-SEC-11 | Idempotency keys on order + payment creation | MVP |
| NFR-SEC-12 | Secrets only from env; never committed, never in client bundles | MVP |
| NFR-SEC-13 | Stripe live keys rejected — fail closed if `sk_live_` detected | MVP |
| NFR-SEC-14 | Upload validation: mime + size + extension, signed uploads only | v1 |
| NFR-SEC-15 | CSRF protection on state-changing cookie-auth endpoints | v1 |
| NFR-SEC-16 | Audit log on destructive actions (delete, refund, role change) | v1 |
| NFR-SEC-17 | No PII in structured logs | v1 |

---

## 3. Availability & Reliability

| ID | Requirement | Target | Tier |
|---|---|---|---|
| NFR-REL-01 | Local dev startup (fresh pull, `.env` present) | ≤ 60 s | MVP |
| NFR-REL-02 | Database connection retries on Neon cold start | 3 retries, backoff | MVP |
| NFR-REL-03 | Ably reconnect with resync after drop | ≤ 5 s | MVP |
| NFR-REL-04 | Health endpoint `/api/v1/health` returns 200 + DB status | MVP |
| NFR-REL-05 | Order creation transactional (all-or-nothing) | MVP |
| NFR-REL-06 | Inventory deduction idempotent per order | MVP |
| NFR-REL-07 | Provider failure degrades gracefully (email → preview, payment → simulated) | MVP |
| NFR-REL-08 | Seed script idempotent (safe to re-run) | MVP |
| NFR-REL-09 | Migrations forward-only, reproducible from empty DB | MVP |

---

## 4. Accessibility

| ID | Requirement | Target | Tier |
|---|---|---|---|
| NFR-A11Y-01 | WCAG 2.2 AA on all user-facing routes | MVP |
| NFR-A11Y-02 | Color contrast ≥ 4.5:1 normal text, ≥ 3:1 large text | MVP |
| NFR-A11Y-03 | All interactive elements keyboard-reachable with visible focus | MVP |
| NFR-A11Y-04 | Form fields have associated labels and error messages | MVP |
| NFR-A11Y-05 | Modals trap focus and restore focus on close | MVP |
| NFR-A11Y-06 | Reduced-motion preference respected (Framer Motion) | v1 |
| NFR-A11Y-07 | KDS: large targets (≥ 48 px), high contrast, no color-only signaling | MVP |
| NFR-A11Y-08 | Images have meaningful alt text; decorative images `alt=""` | v1 |
| NFR-A11Y-09 | No keyboard traps; skip-to-content on admin shell | v1 |
| NFR-A11Y-10 | Screen-reader sanity pass on storefront, cart, KDS | v1 |

---

## 5. Usability

| ID | Requirement | Tier |
|---|---|---|
| NFR-USE-01 | Every screen handles loading, empty, error, success states | MVP |
| NFR-USE-02 | Destructive actions require confirmation dialog | MVP |
| NFR-USE-03 | Forms show field-level validation on submit and on blur | MVP |
| NFR-USE-04 | Toasts (Sonner) used for non-blocking feedback | MVP |
| NFR-USE-05 | Mobile-first storefront; admin responsive from 1024 px | MVP |
| NFR-USE-06 | Any action completes in ≤ 5 clicks from admin home | v1 |
| NFR-USE-07 | No dead buttons; disabled states explain why | MVP |

---

## 6. Data integrity

| ID | Requirement | Tier |
|---|---|---|
| NFR-DATA-01 | All money in integer minor units + ISO currency code | MVP |
| NFR-DATA-02 | No floating-point arithmetic on prices/totals | MVP |
| NFR-DATA-03 | Historical orders store snapshots of names, prices, modifiers, tax | MVP |
| NFR-DATA-04 | All timestamps stored in UTC; branch timezone rendered at display | MVP |
| NFR-DATA-05 | Completed orders and payments never cascade-deleted | MVP |
| NFR-DATA-06 | Stock as immutable movement ledger; balances derived | v1 |
| NFR-DATA-07 | Reservation overlap prevented at DB transaction level | v1 |
| NFR-DATA-08 | Order + payment state machines enforce transitions server-side | MVP |

---

## 7. Compatibility

| ID | Requirement | Tier |
|---|---|---|
| NFR-COMPAT-01 | Windows 11 + CMD + Notepad developer workflow | MVP |
| NFR-COMPAT-02 | Chrome / Edge / Firefox latest 2 versions | MVP |
| NFR-COMPAT-03 | `vercel dev -L` runs the full app locally | MVP |
| NFR-COMPAT-04 | Node.js current LTS | MVP |
| NFR-COMPAT-05 | No Docker, WSL, PowerShell required | MVP |
| NFR-COMPAT-06 | KDS usable on a 1024×768 tablet | MVP |

---

## 8. Maintainability

| ID | Requirement | Tier |
|---|---|---|
| NFR-MAINT-01 | TypeScript strict; no `any` in `server/` or `shared/` | MVP |
| NFR-MAINT-02 | Modular monolith: one folder per domain in `server/modules/` | MVP |
| NFR-MAINT-03 | Business logic independent of Express (services take plain args) | MVP |
| NFR-MAINT-04 | Centralized permission matrix (Step 7) — no scattered role strings | MVP |
| NFR-MAINT-05 | ESLint + Prettier passing | MVP |
| NFR-MAINT-06 | Test coverage ≥ 70% on `server/services/` | v1 |
| NFR-MAINT-07 | `PROJECT_STATUS.md` updated at every step | MVP |

---

## 9. Free-tier compliance (hard limits)

| ID | Requirement | Tier |
|---|---|---|
| NFR-FREE-01 | No paid plan, trial, or credit card used anywhere | MVP |
| NFR-FREE-02 | Feature flags for Ably, Cloudinary, Resend, Stripe | MVP |
| NFR-FREE-03 | Email defaults to preview mode | MVP |
| NFR-FREE-04 | Stripe uses test keys only; simulated adapter when absent | MVP |
| NFR-FREE-05 | Ably publishes business events only (no UI chatter) | MVP |
| NFR-FREE-06 | Cloudinary upload size cap 5 MB, approved mime only | v1 |
| NFR-FREE-07 | No bulk email / marketing functionality | MVP |
| NFR-FREE-08 | Vercel: one function, no cron, no preview deploys | MVP |
| NFR-FREE-09 | Neon: one project, one branch, one DB | MVP |

---

## Verification map

| NFR group | Verified in step |
|---|---|
| Performance | 97 |
| Security | 95 |
| Reliability | 98 |
| Accessibility | 98 (axe + manual) |
| Usability | 98 |
| Data integrity | 98 |
| Compatibility | 99 |
| Maintainability | 98 |
| Free-tier compliance | 96 |

Any NFR marked MVP that fails at its verification step blocks phase exit.