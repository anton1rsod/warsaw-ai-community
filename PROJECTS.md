# Projects — Portfolio Status Board

> One-line view of every sub-project the Warsaw AI Community is building. Source of truth: each project's `README.md` + `CHANGELOG.md`.

**Last updated:** 2026-05-17

---

## Active portfolio

| Project | Path | Status | Lead | Current focus | Next gate |
|---|---|---|---|---|---|
| [GBrain](projects/gbrain/README.md) | `projects/gbrain/` | **Building** — v0.1.2 in flight (branch `gbrain-0.1.2-ask-bundle`) | Anton | E1+E2 done, E3 mostly done. Pending: tuned `ASK_SIMILARITY_THRESHOLD`, six day-30 gates, CHANGELOG + tag + ff-merge to `main` | v0.2.0 (real-channel soft launch, day 30) |
| [Persona Builder](persona-builder/README.md) | `persona-builder/` | **Live (v1)** — interview skill + community guides published EN/UK | Anton + members | Personas being created (4 untracked: `dmitry-b`, `heorhii-k`, `maksym-p`, `mark-s`) | Persona DB → feed Community Platform |
| [Community Platform](projects/community-platform/README.md) | `projects/community-platform/` | **Proposed** — stub scaffolded, **pending brainstorm** | Anton | Locked inputs in `spec.md §0` (four-role access, gamification in scope) | `superpowers:brainstorming` session in next chat |
| [W.A.Y. — Who Are You?](projects/way-who-are-you/README.md) | `projects/way-who-are-you/` | **Proposed** — stub scaffolded, **pending brainstorm** | Anton | Founder pitch captured in `founder-pitch.md`; product surface, ICP, monetization model TBD | `superpowers:brainstorming` session in next chat |

## Layout note — `persona-builder/` placement

`persona-builder/` is at the **repo root**, not under `projects/`. This is intentional and predates the `projects/_template` convention — the persona skill ships as a stand-alone artifact members consume on Claude.ai/Cursor/Claude Code, so it lives where members can find it without navigating into `projects/`. CLAUDE.md acknowledges this in the Repo Map.

If we ever consolidate, it requires an ADR. Until then, the convention is: **`projects/<slug>/` for community-internal builds, repo-root for member-facing skills.**

---

## How to start a new project

```bash
cp -R projects/_template projects/<your-project-slug>
# Fill in README.md (what/why/who), open a Telegram thread in #Builds & Pitches.
# Run superpowers:brainstorming → fills spec.md.
# Run superpowers:writing-plans → fills plan.md.
# Implement following docs/playbooks/ai-collaborator-stack.md.
```

See [`docs/playbooks/ai-collaborator-stack.md`](docs/playbooks/ai-collaborator-stack.md) for the full per-feature workflow (research → brainstorm → spec → plan → TDD → review → verify → commit → ADR).

## Status vocabulary

We use these five status values consistently across projects:

| Status | Meaning |
|---|---|
| **Proposed** | Folder exists, README written, no spec yet. Waiting on brainstorm. |
| **In design** | Spec drafted, plan being written. No code yet (or only scaffolding). |
| **Building** | Plan accepted, implementation in flight. May have intermediate `0.x.y` releases. |
| **Live** | At least one production-grade release. Active maintenance. |
| **Archived** | No longer maintained. Reason recorded in CHANGELOG. |

## Cross-project dependencies

```
Persona Builder ──┬──→ Community Platform (planned)
                  │
                  └──→ W.A.Y. (planned, productizes the persona-creation skill)
GBrain ───────────┬──→ Community Platform
                  └─→ archive content the platform may surface or query
```

The **Community Platform** is the consolidator of the community's internal surfaces (Persona Builder + GBrain). **W.A.Y.** is a commercial-track product that builds on the same persona-creation primitives — see [`projects/way-who-are-you/CLAUDE.md`](projects/way-who-are-you/CLAUDE.md) for how it relates to (but does not absorb) the community-internal Persona Builder.

## Where decisions live

Each project's spec links to its own ADRs in [`docs/decisions/`](docs/decisions/README.md). Cross-project decisions (governance, license, telegram topics, secrets) sit in the same numbered ADR sequence and apply to all projects.
