# ADR-0006: Secret handling & rotation protocol

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Anton Safronov (founder)

## Context

During the GBrain brainstorming session, a live Google AI API key was pasted into the session transcript. This was a normal failure mode — sharing secrets over chat to enable AI assistance is extremely common and rarely intentional. The consequence is that the key must be treated as compromised and rotated.

More broadly: GBrain will depend on multiple secrets (Telegram bot token, Gemini API key, Vercel AI Gateway key, GitHub bot token). Without a written protocol, rotation and handling are ad-hoc, which scales poorly and invites leaks. We need a single source of truth for how secrets are stored, rotated, and recovered from compromise.

## Options considered

1. **Env vars only + written rotation protocol.** Keys live as Vercel environment variables. Rotation protocol documents when and how to rotate. Pre-commit secret scanning as a safety net.
2. **Secret manager (Vault, Doppler, 1Password).** External service holds secrets; services fetch at runtime. Strongest posture but adds a dependency and cost.
3. **OIDC / short-lived credentials.** Where possible, use token exchange (Vercel OIDC → cloud provider). Eliminates long-lived keys entirely. Not always possible (Telegram, Gemini don't offer OIDC).
4. **No formal protocol.** Worst option; leaks happen eventually.

## Decision

**Option 1 now, with a path to Option 3 where feasible.**

- All secrets are stored as **Vercel environment variables** (production, preview, development scopes as appropriate).
- `.env.example` files document required variables; **no real values committed anywhere**, ever.
- `.env` files are git-ignored (already in `.gitignore`).
- Pre-commit hook (to be added to GBrain's `app/` project): regex scan for common token patterns; block commit on match.
- CI pipeline (GitHub Actions): repeat the same scan on every PR.
- **No secret is pasted into a Claude Code chat, Slack, email, or any unencrypted channel.** If a secret leaks into a transcript, rotate immediately.
- Where OIDC / short-lived credentials become available (e.g., Vercel OIDC for GitHub), prefer them over long-lived keys.

### Rotation cadence

| Event | Action |
|---|---|
| **Quarterly** (every 3 months) | Rotate all secrets on a calendar reminder |
| **Suspected leak** (pasted in chat, visible in screenshot, former contributor departs) | Rotate immediately, audit for unauthorized use |
| **Observed misuse** (unexpected API calls, cost spike) | Rotate immediately, forensics after |
| **Contributor offboarding** | Rotate any keys that contributor had access to |

### Immediate actions (from this ADR's trigger event)

- [ ] Anton rotates the leaked `GEMINI_API_KEY` in Google AI Studio before deploying GBrain.
- [ ] New key is set in Vercel env vars, never pasted in chat again.
- [ ] Claude Code session transcripts are not public — but treat as compromised anyway.

### Recovery runbook

When a leak is suspected:

1. **Revoke** the exposed credential at the provider (Google AI Studio, Telegram @BotFather, Vercel, GitHub).
2. **Rotate** — issue a new credential.
3. **Update** Vercel env vars for every affected environment (production, preview, development).
4. **Redeploy** affected services to pick up the new values.
5. **Audit** — check provider dashboards for unauthorized usage since the leak timeframe.
6. **Document** — log the incident (sanitized) in `community/archive/_removed/` or a dedicated incident log; update this ADR with a superseding entry if the protocol itself failed.

## Consequences

**Easier:**
- Clear, repeatable process when (not if) a secret leaks.
- Standardised env-var-only storage model — no ambiguity about where a given key should live.
- CI/pre-commit scan catches most accidental commits.
- Audit trail via Vercel env var history + provider dashboards.

**Harder:**
- Quarterly rotation adds a recurring task. Mitigated by calendar reminder + small number of keys.
- Pre-commit hook requires initial setup in every project that handles secrets.
- Doesn't fully protect against sophisticated social engineering or compromised developer machines — those risks are out of scope for this ADR.

## Implementation

- [ ] Anton rotates leaked `GEMINI_API_KEY` (see trigger event above).
- [ ] `.env.example` conventions documented in `CONTRIBUTING.md` (add note).
- [ ] GBrain `app/` project ships with pre-commit hook (secret scan) — tracked in `projects/gbrain/plan.md`.
- [ ] GitHub Actions workflow template includes secret scan — to be added in first GBrain PR.
- [ ] Calendar reminder for quarterly rotation — founder action.
