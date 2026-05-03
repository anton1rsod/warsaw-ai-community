# ADR-0011: Code-graph layer for AI agent context (CodeGraph, MIT)

**Status:** Accepted
**Date:** 2026-05-01
**Deciders:** Anton Safronov (founder)
**Related:** [`docs/playbooks/ai-collaborator-stack.md`](../playbooks/ai-collaborator-stack.md) §12, [ADR-0001](0001-oss-first-licensing.md) (OSS-first MIT), [ADR-0004](0004-commercial-track-accelerated.md) (commercial trajectory)

## Context

AI agents developing Warsaw codebases (GBrain Next.js app today, Community Platform UI tomorrow) spend a substantial fraction of every Explore-phase token budget on filesystem grep + read tool calls. Benchmarks across 6 reference codebases (VS Code, Excalidraw, Claude Code, Alamofire, Swift Compiler) show **84–96% of those tool calls are avoidable** when the agent has structured access to the code's symbol graph via MCP.

Three candidate tools were evaluated:

| # | Tool | License | Stack | Headline metric |
|---|---|---|---|---|
| 1 | [abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus) | **PolyForm Noncommercial** | Browser + Node CLI, LadybugDB, Tree-sitter | Web UI + enterprise multi-repo |
| 2 | [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | MIT | Python, pip/pipx, MCP | 6.8× fewer tokens on reviews; 11-platform MCP install |
| 3 | [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | MIT | Node, npx, MCP | 92% fewer tool calls, 71% faster (Claude Code Explore agent) |

## Options considered

1. **Adopt CodeGraph** (chosen) — MIT, npx-installable, benchmarked specifically against Claude Code's Explore agent.
2. **Adopt code-review-graph** — MIT, multi-platform (Codex, Cursor, Windsurf, Zed, Continue, OpenCode, Antigravity, Qwen, Qoder, Kiro, Claude Code). Stronger if Warsaw uses multiple AI tools.
3. **Adopt GitNexus** — rejected on license. PolyForm Noncommercial is incompatible with both ADR-0001 (MIT-licensed repo) and ADR-0004 (commercial trajectory). Output indexed via GitNexus would inherit noncommercial restrictions.
4. **Adopt none** — accepted token cost as a baseline. Rejected: 92% reduction is not noise; the cost of *not* adopting compounds as Community Platform grows from green-field to multi-thousand-file codebase.

## Decision

**Adopt `colbymchenry/codegraph`** (MIT) as the code-graph layer for all Warsaw project codebases.

- Per-project install via `.mcp.json` in each project's implementation root (e.g. `projects/gbrain/app/.mcp.json`). No global config — index stays project-scoped.
- Index database gitignored in each project to avoid noisy diffs.
- `code-review-graph` retained as the **fallback** if Warsaw later adopts AI tools beyond Claude Code where its multi-platform install becomes more valuable than CodeGraph's Claude-Code-specific optimization.
- **GitNexus is excluded from the Warsaw stack.** Any future contributor who proposes it must first write a superseding ADR addressing the license incompatibility.

## Scope

**In scope:**
- GBrain (`projects/gbrain/app/`) — Next.js / TypeScript codebase.
- Community Platform (`projects/community-platform/app/`) — once implementation begins.
- Future sub-projects with code (not pure-markdown projects).

**Explicitly out of scope:**
- **GBrain's content KB** (markdown archive of community knowledge) — Tree-sitter parses code ASTs, not markdown semantics. GBrain's Phase 2 pgvector roadmap is unaffected.
- **Persona Builder** — markdown personas.
- **Repo-level docs** (CLAUDE.md, ADRs, specs, playbooks) — not indexed by code-graph tools.
- **Cross-repo analysis** — code-graph is project-scoped.

## Consequences

**Easier:**

- Explore agent runs ~10× cheaper in tokens; lower API spend on every coding session.
- Symbol-aware AI sessions on the Next.js codebase. "Where does the consent rule for `#kb` live?" becomes a graph query, not a 30-tool-call grep cascade.
- Scales naturally as the Community Platform grows. The day it's a 5,000-file codebase, the agent loop is the same as day-one.
- MIT license aligns with ADR-0001 + ADR-0004; no new licensing surface.

**Harder:**

- One more tool to keep updated (mitigated: CodeGraph auto-updates on git commit).
- Initial index time (~10s for 500-file project; irrelevant in interactive sessions).
- Index DB lives inside the project tree — must be gitignored to avoid pushing megabytes of binary.
- Some chance the agent "trusts the graph" too much when the graph is stale (mitigated: auto-update + manual rebuild on demand).

## Implementation

1. Add `.mcp.json` entry to `projects/gbrain/app/` configuring CodeGraph.
2. Update `projects/gbrain/app/.gitignore` to exclude the CodeGraph index database file.
3. Document use in [`docs/playbooks/ai-collaborator-stack.md`](../playbooks/ai-collaborator-stack.md) §12.
4. When Community Platform begins, repeat steps 1–2 in `projects/community-platform/app/`.
5. Re-evaluate after 30 days of use — measure actual token reduction on real sessions vs. the 92% benchmark.

## Reversibility

Low cost. The MCP server is npx-installed; removing it is `rm` of the `.mcp.json` entry and gitignore line. No schema, no migration, no runtime dependency. If a better tool emerges or CodeGraph stagnates, swap by writing a superseding ADR.

## Supersedes / amends

None. First Warsaw ADR on the AI agent tooling layer.
