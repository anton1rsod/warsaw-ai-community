# W.A.Y. — Platform Compatibility Matrix (Research)

**Created:** 2026-05-18
**Status:** Stub — research not yet performed
**Owner:** Anton (+ future Claude research session)
**Blocks:** L20 lock confirmation (which platforms the v0.5+ wizard targets after Claude Code)
**Does not block:** v0 build (Claude Code is the v0 lead per L3; v0 can ship without this research)

---

## Goal

Catalog every AI tool / platform where a W.A.Y. persona Claude-Skill folder can be **deployed and produce value**. For each platform, capture:

1. **Compatibility status** — `verified` (hands-on tested or vendor-confirmed) / `documented` (vendor docs claim support, not yet tested) / `expected` (open-standard adoption implies it should work, no confirmation) / `not-supported` (won't work today) / `unknown`.
2. **Install mechanism** — how the user actually gets the persona into the platform.
3. **What the persona can DO** — output drafting? Tool execution? Multi-step agent tasks? Limited subset?
4. **Limitations** — what the persona CAN'T do on this platform (no tool access, no file system, no MCP, etc.).
5. **Date verified** — when this row was last confirmed.
6. **Source** — vendor docs URL, blog post, hands-on test session.

This matrix informs:
- **L20** — which platforms v0.5+ wizards target after Claude Code.
- **Marketing copy** — the "works in X, Y, Z" list on the landing page (only verified rows).
- **Roadmap** — which platforms warrant their own polished wizard vs. "drop the folder manually, it works."

## Method

1. **Web search + vendor docs** — for each platform, find current (May 2026+) documentation of Skills / plugins / custom-agent support.
2. **Hands-on testing where feasible** — install a test persona skill folder and confirm it loads + runs.
3. **Vendor support inquiries** — for platforms where docs are ambiguous, ask vendor support directly (record response).
4. **Track research currency** — re-verify each row at least quarterly; the AI platform landscape is moving fast in 2026.

## Platform matrix

> **Legend:** `✅ verified` · `📄 documented` · `🤔 expected` · `❌ not-supported` · `❓ unknown`

| # | Platform | Status | Install mechanism | What the persona can DO | Limitations | Date verified | Source |
|---|---|---|---|---|---|---|---|
| 1 | **Claude Code** (CLI) | 📄 documented | Drop folder in `~/.claude/skills/`; restart | Full task execution (filesystem, web, MCP) | None for v0 scope | 2026-05-18 (docs scan, not tested) | [Claude Code Skills](https://docs.anthropic.com/) |
| 2 | **Claude.ai — Projects** | 📄 documented | Upload persona.md + system prompt as Project files | Conversational, draft generation; no agent execution | No filesystem / tool access | 2026-05-18 | (verify) |
| 3 | **Claude.ai — Skills (Pro/Max)** | 📄 documented | Install from Skills directory or upload | Same as Claude Code minus filesystem | No filesystem; web only | 2026-05-18 | (verify) |
| 4 | **Codex CLI** (OpenAI) | 🤔 expected | Same skill folder format per Dec 2025 open-standard adoption | TBD — hands-on test required | TBD | not verified | [Skills open standard](https://aibusiness.com/foundation-models/anthropic-launches-skills-open-standard-claude) |
| 5 | **ChatGPT — Custom GPTs / Skills** | 🤔 expected | OpenAI adopted Skills format Dec 2025 | TBD | TBD | not verified | (verify) |
| 6 | **Notion AI — Custom Skills** | 📄 documented | Custom skills installed at workspace level | Workspace-scoped task execution in Notion's context | Notion-API-bounded; can't reach external tools | 2026-05-18 (release notes) | [Notion custom skills, 2026-03-20](https://www.notion.com/releases/2026-03-20) |
| 7 | **Atlassian** (Jira / Confluence) | 📄 documented | Atlassian skill partner integration via Claude | Jira ticket / Confluence page generation in voice | Mediated via Claude; not a direct install | not verified | [Atlassian skills via Claude](https://claude.com/blog/organization-skills-and-directory) |
| 8 | **Canva AI** | 🤔 expected | Anthropic partner skill (Dec 2025) | TBD | TBD | not verified | (verify) |
| 9 | **Figma AI** | 🤔 expected | Anthropic partner skill (Dec 2025) | TBD | TBD | not verified | (verify) |
| 10 | **Cursor IDE** | ❓ unknown | Cursor has its own rules/.cursorrules format — TBD if Skills-compatible | TBD | TBD | not verified | (verify) |
| 11 | **GitHub Copilot Chat** | ❓ unknown | TBD — does Copilot accept external skill folders? | TBD | TBD | not verified | (verify) |
| 12 | **Microsoft Copilot** (M365 / Office) | ❓ unknown | TBD | TBD | TBD | not verified | (verify) |
| 13 | **Google Gemini / Workspace AI** | ❓ unknown | TBD — does Google have a Skills-compatible custom-agent format? | TBD | TBD | not verified | (verify) |
| 14 | **Replit / Replit Agent** | 🤔 expected | Replit is an Anthropic Marketplace partner | TBD | TBD | not verified | [Anthropic March 2026 marketplace](https://siliconangle.com/2026/03/06/anthropic-launches-claude-marketplace-third-party-cloud-services/) |
| 15 | **GitLab Duo** | 🤔 expected | GitLab is an Anthropic Marketplace partner | TBD | TBD | not verified | (verify) |
| 16 | **Lindy** | ❓ unknown | TBD | TBD | TBD | not verified | (verify) |
| 17 | **lobehub.com/skills** (third-party hub) | 📄 documented | Third-party indexer; not a runtime | Discovery surface; users install elsewhere | Discovery only | not verified | [lobehub skills](https://lobehub.com/skills) |
| 18 | **skillsmp.com** | 📄 documented | Same as #17 | Discovery only | Discovery only | not verified | (verify) |
| 19 | **claudemarketplaces.com** | 📄 documented | Same as #17 | Discovery only | Discovery only | not verified | (verify) |

## Out-of-scope (probably will never apply)

- **Replika / Character.AI** — entertainment personas, not professionally-capable agents.
- **Self-hosted Llama / Mistral / open-weights** — no Skills-equivalent format yet; would require a custom shim.

## Open questions for the research session

1. Does the Skills open-standard guarantee bit-for-bit compatibility across Claude / Codex / ChatGPT, or are there subtle dialect differences in `SKILL.md` frontmatter that need per-platform variants?
2. For platforms that mediate via Anthropic Marketplace (Atlassian, Canva, Figma, Snowflake, etc.) — does a W.A.Y. persona installed in Claude work *transparently* with those platforms' connectors, or does each platform need its own per-tool install path?
3. For each platform, can we install a *cross-platform persona pack* (one zip that works in Claude + Notion + Atlassian + ...) or must we ship platform-specific bundles?
4. Which platforms support **private** (un-published) skills vs. only public marketplace skills? Privacy posture (L17) depends on this answer.
5. What's the v0.5+ priority order for polished wizards? Candidates: Notion AI (huge install base, recent custom-skills launch), ChatGPT (largest LLM audience), Codex CLI (dev-founder overlap), Atlassian (B2B enterprise → Track 2 funnel).

## Next steps

1. **Anton or a dedicated research session** runs through each row, populating compatibility status with verified evidence.
2. **Re-prioritize v0.5 wizard target (L20)** once the top 3-5 platforms are clearly mapped.
3. **Update §1 of `spec.md`** if the cross-platform claim needs to be narrowed (or strengthened with newly-discovered platforms).
4. **Re-run quarterly** — the AI platform space is moving fast; what's documented today may shift.

## Why this lives outside `spec.md`

Specs are decision artifacts ("we will do X"). This matrix is **research / observation** ("the world supports Y"). Conflating the two rots both: specs get stale-fact pollution, and research gets locked into a doc that can't be updated freely. Keeping them separate respects the docs-first monorepo convention (see [`projects/way-who-are-you/CLAUDE.md`](../CLAUDE.md) → "Specs vs handoffs vs research").
