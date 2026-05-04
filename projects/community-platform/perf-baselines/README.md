# Performance baselines

Lighthouse measurements of the Warsaw AI Community platform against production. Each measurement run produces:

- A summary row in this README (mobile + desktop, the four category scores, and the headline Core Web Vitals)
- A full Lighthouse JSON report committed alongside, so any future re-measurement can be diff'd back to the originals

Spec §10 commitment: maintain a 90+ Performance score across the platform. This file is how the commitment is verified and tracked over time.

## Methodology

- Tool: `lighthouse` CLI v12 (run via `pnpm dlx lighthouse@12`)
- Engine: headless Chromium (default `--chrome-flags="--headless"`)
- Mobile: default form factor (Moto G4 simulated, simulated 4G throttling)
- Desktop: `--preset=desktop` (no throttling, larger viewport)
- Targets: production deploy at `https://warsaw-ai-community-platform.vercel.app`
- Authenticated routes: **not yet measured** — Lighthouse's `--extra-headers` flag requires a session cookie handoff (extract `__Secure-next-auth.session-token` from a logged-in browser session). Deferred to v0.2 perf work or when first auth-dependent regression hypothesis emerges.

## 2026-05-04 — v0.1.1 baseline

**Scope:** anonymous routes only. Production deploy `efbc85b` (post chat-10 follow-ups merge).

| Route | Form factor | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS | TTFB |
|---|---|---|---|---|---|---|---|---|---|
| `/login` | Mobile | **99** | 100 | 96 | 91 | 1.5s | 60ms | 0 | 40ms |
| `/login` | Desktop | **100** | 100 | 96 | 91 | 0.3s | 0ms | 0 | (n/a) |

**Verdict:** All categories meet or exceed the spec §10 90+ budget. Mobile LCP of 1.5s is well under the 2.5s "good" CWV threshold; CLS of 0 is perfect; TBT of 60ms is under the 200ms "good" threshold.

**JSON reports:**
- [`login-mobile.json`](./login-mobile.json) — full Lighthouse JSON, mobile
- [`login-desktop.json`](./login-desktop.json) — full Lighthouse JSON, desktop

## How to re-run

```bash
# Pick a route + form factor; output goes alongside the README.
pnpm dlx lighthouse@12 https://warsaw-ai-community-platform.vercel.app/login \
  --quiet --chrome-flags="--headless" \
  --output=json \
  --output-path=./projects/community-platform/perf-baselines/login-mobile.json \
  --form-factor=mobile

# For desktop, swap --form-factor for --preset=desktop.
```

Then append a row to the table above with the new date + scores. Keep prior rows so regressions are detectable at a glance.

## Future authenticated-route measurement (deferred)

To measure auth-gated routes (`/home`, `/this-week`, `/members/[slug]`, `/admin/health`), the cleanest path is:

1. Sign in to production via browser; inspect cookies in devtools.
2. Copy the value of `__Secure-next-auth.session-token`.
3. Run lighthouse with `--extra-headers='{"Cookie":"__Secure-next-auth.session-token=<value>"}'`.
4. Verify the report's screenshot shows the authenticated UI (not a redirect to `/login`).

The cookie has a 30-day TTL (per `NEXTAUTH_SESSION_MAX_AGE=2592000`) so a single handoff covers a measurement window. **Caveat:** the `__Secure-` prefix is production-only; preview / local would use `next-auth.session-token` (no prefix; HTTP-acceptable).

This work is queued for v0.2 brainstorm scope (or sooner if a perf concern arises).
