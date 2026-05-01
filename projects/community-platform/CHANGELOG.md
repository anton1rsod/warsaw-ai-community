# Changelog

All notable changes to Community Platform will be recorded here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/spec/v2.0.0.html) once shipped; until then, date-based entries are fine.

## Versioning policy (placeholder — finalize during plan-writing)

| Version | Meaning |
|---|---|
| `0.0.x` | Pre-spec scaffolding, no implementation |
| `0.1.0` | First implementation pass — identity + roles + minimal gamification |
| `0.2.0` | Project / contribution tracking |
| `0.3.0+` | TBD |
| `1.0.0` | Reserved (production-grade declaration) |

---

## [Unreleased] — 2026-05-01

### Added
- Project scaffold: `README.md`, `spec.md` (stub), `plan.md` (stub), this changelog.
- Locked inputs in `spec.md` §0: four-role access model, gamification in scope, OSS-first, Telegram-complementary posture.
- Cross-links to sister projects (`persona-builder/`, `projects/gbrain/`) and program governance.
- **`spec.md` §1–§10 written** via `superpowers:brainstorming` cycle (founder + AI collaborator).
  - Lite slice locked: identity + memory spine + one write surface (status updates).
  - Stack: Next.js 15 + Vercel + GitHub OAuth (JWT sessions) + GitHub App `warsaw-ai-bot`.
  - Storage: 100% git for v0.1; classification rule documented for v0.2+ DB return.
  - Long-term commitments captured in §10 (storage trajectory, federation horizon, OSS/commercial separation, gamification phasing, health metric).

### Pending
- Founder review of `spec.md`.
- `superpowers:writing-plans` session to fill `plan.md`.
- Pre-launch tasks (per `spec.md` §9 risk 3):
  - PR adding `github_handle` field to every roster entry.
  - Create `community/governance/admins.md` and `community/governance/community-managers.md`.
  - Add `## Attendees` format to `community/meetings/weekly/_template.md`.
