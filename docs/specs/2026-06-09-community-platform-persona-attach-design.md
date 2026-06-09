# Community Platform v0.11.1 — Persona attach + rich card (design)

**Date:** 2026-06-09 · **Skill:** `superpowers:brainstorming` · **Spec:** `projects/community-platform/spec.md §22` · **ADR:** ADR-0019 (Proposed)
**Predecessor:** v0.11.0 meeting signup (spec §21) — this implements §21's "Deferred to v0.11.1+" persona item.
**Ship-lock:** pending the **Thu 2026-06-11 post-meetup retro**, which gates *only* whether Bundle A (meeting-path hardening) preempts this. Design / spec / plan proceed now ("merge gate ≠ work gate").

## 1. Goal & scope

Bundle B of the v0.11.1 backlog: **personas as first-class on the platform.**

Anton's vision spans **(a) self-serve attach + consent**, **(b) rich card display**, **(c) discovery / matchmaking**. This release ships **(a)+(b)**; **(c)** → v0.11.2; **(d)** an in-platform persona *builder* is not planned (personas are authored by the external persona-builder tool; the platform ingests them).

**Why a→b→c as a sequence, not one release:** (a) feeds the persona corpus that (c)'s matchmaking needs to be useful; (b)'s tag-parser is the exact foundation (c) reuses. The persona-builder README confirms evaluator-matchmaking is the *designed endgame* of personas — so the sequence is the efficient path, not scope-cutting.

## 2. Current state (code-verified 2026-06-09)

- **Storage:** `persona-builder/personas/<slug>/persona-<slug>.md` (full) + `…public.md` (peer-facing). 5 exist, hand-committed. Schema is **ADR-governed** (`schema_version: 1.0`); tags are controlled-vocab with a `{familiar|practitioner|expert}` depth ("honest-depth" rule).
- **Consent model** (persona-builder README §Privacy): *"Peers see `.public.md`. The future evaluation assistant sees the full `.md`. The `## Private notes` section is … things you do not want peers to see."* Withdrawal today = ask the admin.
- **Display:** `/members/[slug]` → `PersonaPanel(readMemberPersona)`. `readMemberPersona` returns `files.filter(f=>f.endsWith(".md")).sort()[0]` ⇒ the **full `.md`** (`.md` sorts before `.public.md`), then `truncateToFirstH2` ⇒ shows only the pre-`## Tags` intro. **Net: tags hidden, `.public.md` inert.**
- **Sanitization:** `lib/markdown` = `unified` → `remark-rehype({allowDangerousHtml:false})` → `rehype-sanitize(defaultSchema)` → stringify, with **no `rehype-raw`**. Allowlist, safe-by-construction ("NEVER skip rehype-sanitize").
- **GDPR delete:** `GdprPanel` → `/api/me/delete` removes the profile file + statuses from `main`; **commit history retained** (documented stance: *"commits remain in git history but files are removed from main"*).

## 3. Decisions (D1–D9)

- **D1 — Scope:** (a)+(b) this release; (c) → v0.11.2; (d) not planned. *Rejected: a thin slice of a+b+c (shallow everywhere + heavy against the TDD/coverage/security bar).*
- **D2 — Consent model:** **attach = consent**; the member curates the content; a **show/hide toggle** allows withdrawal. *Rejected: two-tier full+public (privacy is illusory on a public repo, doubles paths); field-level section toggles (overkill).*
- **D3 — Attach method:** **paste + optional `.md` upload**, both funnelling into one validate+commit pipeline. *Rejected: upload-only (no paste fallback); link/import (SSRF surface, anti-curation).*
- **D4 — Write target:** a single file `persona-builder/personas/<slug>/persona-<slug>.public.md` (peer-facing). The full/private `.md` + eval-assistant flow stays out of platform scope.
- **D5 — Display `.public.md` [standards-driven correctness fix]:** render the peer-facing `.public.md`, never the full `.md`; remove the `truncateToFirstH2` clamp on the card path. Fixes a latent consent bug — the full `.md` may carry `## Private notes`, which today's truncation only *accidentally* hides and which (b)'s un-truncation would otherwise expose.
- **D6 — Visibility flag location:** `persona_visible` in the **profile** frontmatter (`community/members/<slug>.md`), NOT the persona file → avoids a `schema_version` bump / persona-schema ADR. Absent ⇒ visible (no migration for the 5 existing).
- **D7 — Parser scope:** parse only the `## Tags` block → typed chips; render the rest of `.public.md` as sanitized markdown. *Rejected: full-document structured parse (brittle to format drift, low extra payoff in v0.11.1).*
- **D8 — GDPR posture:** erasure includes the persona dir; informed-consent copy (public profile + public repo + history-retained + purpose); data-minimization guidance (public-only, no special-category data); withdrawal via self-serve hide + delete (improves on today's admin-only).
- **D9 — Sanitization unchanged:** confirmed current best practice; no parallel render path.

## 4. Standards validation (current, 2026)

| Surface | Designed / current | Current standard (2026) | Verdict |
|---|---|---|---|
| Markdown→HTML XSS | `allowDangerousHtml:false` + `rehype-sanitize` `defaultSchema`, no `rehype-raw` | Allowlist-sanitize the AST; never `rehype-raw` without sanitize | ✅ Best-practice as-is |
| `.md` upload | read client-side → text → Server Action; 64KB cap; slug-derived path | OWASP: size cap, extension allowlist, don't trust Content-Type, never use the uploaded filename | ✅ Sound (text, not stored binary) + minor hardening |
| Consent / visibility | render `.public.md`; attach `.public.md`; toggle | persona-builder: peers see `.public.md`; GDPR: informed | ✅ after the D5 fix |
| GDPR erasure | delete profile+statuses off `main`, history retained | Art. 17: erasure spans history; minimum = remove from live | ⚠️ add persona dir to the erasure path |
| Data min. / special category | persona = narrative PII | Art. 5/9: minimize, no sensitive data, purpose-limit | ⚠️ public-only + UI guidance |

**Improvements folded in (Anton-approved 2026-06-09):** (1) render/attach `.public.md`; (2) erasure includes persona dir; (3) informed-consent copy; (4) data-minimization guidance; (5) upload size cap client+server + extension allowlist + filename-never-used; (6) self-serve hide/delete (a GDPR-positive over admin-only); (7) sanitization confirmed, CSP noted as defense-in-depth (v0.5 backlog).

**Sources:** [rehype-sanitize](https://github.com/rehypejs/rehype-sanitize) · [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) · [GDPR Art. 17 erasure](https://www.exabeam.com/explainers/gdpr-compliance/what-is-gdpr-article-17-right-to-erasure-and-4-ways-to-achieve-compliance/) · [GDPR & git history](https://hoop.dev/blog/why-gdpr-compliance-lives-in-your-git-history) · [GDPR data minimization](https://usercentrics.com/knowledge-hub/data-minimization/) · [Art. 9 special categories](https://www.exabeam.com/explainers/gdpr-compliance/gdpr-article-9-special-personal-data-categories-and-how-to-protect-them/)

## 5. Architecture & components

**(a) Attach** — `app/actions/save-persona.ts` (mirrors `save-profile`): `/me/edit` gains a persona section — a paste textarea + an optional `<input type="file" accept=".md,.markdown">` that reads into the same field → `SavePersonaSchema` (Zod: 64KB cap, `persona_id`===slug, `display_name`+`schema_version` present) → the bot makes a **single-file** commit of `persona-<slug>.public.md`. Slug is derived from the session; the path is slug-derived (reuse the `..`/`/`/`\` guard already in `readMemberPersona`).

**Visibility** — `persona_visible` added to `ProfileFrontmatterSchema`; a toggle in `/me/edit` writes the profile (its own single-file commit). Display is gated on it (absent ⇒ visible).

**(b) Rich card** — a new pure `lib/persona.ts`: `parsePersona(md) → { tags: { industries, functionalRoles, companyStages, niche }, body }`, tolerant of which `### ` subsections exist. `PersonaPanel` rewrite: chips per tag (qualifier drives weight: expert > practitioner > familiar; reuse the warm `Tag` / `MonoLabel` primitives), a `languages` line, then the **full `.public.md` body** via `SafeHtml`. Fallback: no parseable `## Tags` ⇒ plain sanitized markdown.

**Read fix** — `readMemberPersona` prefers `.public.md`; a dir with only the full `.md` ⇒ treated as no public persona (fail-closed). The card path no longer truncates.

**Erasure** — `/api/me/delete` also removes `persona-builder/personas/<slug>/*`.

**Two independent single-file commits** (persona content ↔ visibility flag) — never a multi-file commit; reuses the existing bot helper.

## 6. Hardenings

H138–H150 — see `spec.md §22`.

## 7. Testing (TDD; 80% overall + strict-list 100%)

- `lib/persona.ts` parser units (structured + tolerant-fallback + qualifier ordering).
- `save-persona` integration: validation (size, `persona_id`≠slug rejection, bad frontmatter), slug-from-session, bot single-file commit, E2E mock store (mirror `_test-profile-store`).
- `PersonaPanel` RTL: chips render, qualifier weighting, full body, hidden state, `.public.md`-vs-only-`.md` fail-closed.
- Visibility-toggle integration; erasure-includes-persona integration.
- E2E: attach (paste) → `/members/[slug]` shows the card.
- **`security-reviewer` at closeout** (new write path + PII + consent).

## 8. Deferred / flagged

- **(c) discovery / matchmaking → v0.11.2** (tag index + filter surface; reuses `lib/persona.ts`).
- One-line-bio-as-headline + collapse/expand → nice-to-have.
- **⚠ Flagged (separate ADR + history audit, not v0.11.1):** the full `persona-<slug>.md` files (potential `## Private notes`) already sit in the public repo — a pre-existing exposure. v0.11.1 stops *displaying* them; whether they belong in a public repo at all deserves its own decision.
- **CSP** as sanitization defense-in-depth (already on the v0.5 backlog).
