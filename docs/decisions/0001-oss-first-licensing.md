# ADR-0001: OSS-first licensing, personal rights retained, broad community license

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Anton Safronov (founder)

## Context

Warsaw AI Community is on a commercial trajectory (see ADR-0002). Member contributions — code, guides, pitches, Q&A — will accumulate into shared assets like GBrain. Without a clear licensing and contribution posture from day one, a future commercialization move would face retroactive IP cleanup, member disputes, or blockers on relicensing.

## Options considered

1. **Open-source-first, commercial-compatible.** Repo-level MIT license. Members retain personal rights; grant broad license to the community.
2. **Contributor License Agreement (CLA) from day one.** Standard OSS practice (Apache, React). Members sign on joining. Strongest commercial posture.
3. **Community-owned co-op (Polish legal entity with member equity).** IP belongs to the entity. Heaviest setup.
4. **No formal stance yet.** Defer licensing until revenue.

## Decision

**Option 1 — OSS-first.**

- Repo licensed **MIT**.
- Contributors retain personal rights over their own contributions.
- Contributors grant the community a **broad, perpetual, royalty-free license** to use, display, adapt, and include their contributions in community products (including GBrain).
- GBrain ingestion requires explicit opt-in per message (`#kb` / `#archive` tags) or topic-level consent.
- **Path forward:** a CLA will be introduced when the first commercial product line emerges. Existing contributions are grandfathered under the broad community license.

## Consequences

**Easier:**
- No legal entity setup needed today.
- Low friction for members — no CLA signature on join.
- OSS legitimacy — community can be cited, forked, studied.
- Future commercial moves can build *on top* of the OSS core cleanly.

**Harder:**
- Member content cannot be relicensed (e.g., pushed into a closed-source commercial product) without new consent when that moment comes.
- Ambiguity around "broad community license" could require clarification if a member disputes usage — documented in CONTRIBUTING.md helps, but is not a signed contract.
- Attribution obligations grow with the contributor base.

## Implementation

- [x] `LICENSE` at repo root (MIT).
- [x] `CONTRIBUTING.md` documents personal-rights-retained + broad-community-license model.
- [x] `community/telegram/topics.md` documents `#kb`/`#archive` opt-in mechanism.
