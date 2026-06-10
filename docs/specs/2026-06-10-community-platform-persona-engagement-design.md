# Community Platform — Persona engagement + member-page redesign (v0.12 design)

**Date:** 2026-06-10 · **Status:** Approved by Anton (chat brainstorm, this doc is the output) · **Scope owner:** community-platform
**Approved mockup:** [`community/brand/explorations/2026-06-10-member-page-typeset-dossier-mockup.html`](../../community/brand/explorations/2026-06-10-member-page-typeset-dossier-mockup.html) (open directly in a browser)
**Feeds:** spec.md §23 (to be locked at plan time) · v0.12.0-plan.md (next: `superpowers:writing-plans`)

## 1. Context & goal

v0.11.1 shipped persona attach + rich card. Anton's brief: make the persona section *usable, fun, engaging, meaningful for an IT community* — and the current card reads as "a rendered file" (metric tiles → placeholder prose → uppercase chip walls → raw markdown). Research across developer-identity products (Read.cv, Peerlist, GitHub, daily.dev, Linear) + 2026 design-trend audits confirmed the diagnosis: heavy borders everywhere, uniform chip soup, and hierarchy-by-boxes are documented dated-tells; loved profiles converge on a narrow typeset column where whitespace is the hierarchy.

**Primary success metric (Anton-locked): conversations started** — members talk to each other because of personas (lens clicks → Telegram pings, questions asked/answered). Not coverage, not evaluations-count, not meetup wow — those are secondary effects.

## 2. Decisions (D1–D9, Anton-locked in this brainstorm)

- **D1 — Purpose frame:** mix of "two-layer live+deep" and "persona = THE member profile centerpiece." The deep persona (45-60 min interview artifact) stays the backbone; the member page reorganizes around it as one designed identity surface.
- **D2 — Persona as the member's interface:** the chosen interaction set treats the persona as something peers *use*: diff it (overlap lens), query it (ask-me-about → Q&A), route work to it (evaluator routing), simulate it (persona-as-lens AI), carry it (shareable card). Soft-social garnish (vouches, first-question wall, asks/offers fields) was considered and not picked.
- **D3 — Supply stays external:** NO in-platform persona builder ("at least not yet" — Anton). Personas are created via the persona-builder interview and attached by the member. New attach affordance: **attach-by-GitHub-link** (raw GitHub/gist URL fetched server-side through the *identical* validation path as paste) + a stored source URL enabling **"re-sync from source"** — which becomes the persona *update* path and kills the staleness problem. Precedent: "Personas v2 (external repos)" in V0_5_BACKLOG.
- **D4 — Phasing (Approach 1, "conversation engine, staged"):**
  - **v0.12:** member-page redesign (this doc §3-§4) + overlap lens + ask-me-about chips (read-only) + shareable member card (OG image) + GitHub-link attach/re-sync. Zero new consent surface.
  - **v0.13:** persona Q&A write path (questions on personas, git-stored via bot, member answers/hides; light rules).
  - **v0.14:** idea → evaluator routing (tag-match scoring + request flow; = spec §22's deferred discovery item, cleanest H144 consent fit).
  - **v0.15:** persona-as-lens AI — gated behind its own ADR + per-member opt-in + LLM-infra decision. Boldest move, done last because it's the only one that can damage trust if botched.
- **D5 — Visual direction: "typeset dossier."** Read.cv skeleton (narrow editorial column, ledger rows, ink ladder), Anthropic-style warm-editorial skin (cream canvas, near-black warm ink, warm-tinted hairlines), Vercel-style mono kickers (the platform's existing `//` idiom). One expressive moment: the member's `my_typical_first_question` as a pull-quote with a hanging amber asterisk (the brand mark doing typographic work).
- **D6 — Volume calibration (3 mockup rounds):** v2 "too quiet" → v3 (dark band, asterisk separators, member numbers) "previous was better" → **v4 approved**: v2 skeleton + 38px name + 22px statement only. Loud moves explicitly rejected: dark ink quote-band, amber asterisk separators in chip rows, gradient avatar, `subploter #001` numbering.
- **D7 — Chips are gone on the member page.** Expertise renders as definition-list ledger rows (mono label gutter: EXPERT / PRACTITIONER / NICHE / LANGUAGES; inline comma-lists right; depth hierarchy by tone — expert 500-weight ink, practitioner muted). `Tag`/chip components stay for other surfaces; this page drops them.
- **D8 — Progressive disclosure for the deep persona:** one-line bio → 22px statement under the name; career arc visible with gradient-fade + "continue reading"; Hard-won knowledge / Patterns / Role dispositions as styled `<details>` rows with counted headers and carets. Never hide the primary bio.
- **D9 — Contributions demoted:** the 4-metric-tile ContributionCard leaves the top of the page; a single mono stat line in the footer (`5 commits · 19 ADRs · 1 status post · ✓ meetup-4 · ♥ thanked 0×`) carries the evidence quietly.

## 3. Visual spec (from the approved mockup)

**Tokens.** Existing: `--cream #fef6e6`, `--cream-deep #fdebc9`, `--ink #1a1a2e`, `--dust #886c37`, `--accent-500 #f59e0b` (amber), `--accent-700 #b45309` (amber-deep, link color on cream — 4.67:1 AA). New derived warm ladder (every neutral tinted warm, same hue family):
- `--ink-body #3c3a47` (body text) · `--ink-muted #6e6757` (secondary, 5.22:1)
- small-text muted = **dust** `#886c37` (4.60:1 AA) — NOT lighter; `#99906f` measured 2.97:1 and FAILED
- `--hairline #f1e4c8` · `--hairline-strong #e3d2ac` (cream darkened ~6%, never gray)
- `--surface-soft #fdf1d9` (lens band; the only tinted panel on the page)

**Type.** Geist display 600 (name 38px/-0.025em; statement 22px/500/-0.018em), Inter body 16px/1.55 + 15px in ledger rows, JetBrains Mono for kickers (11px/500/uppercase/+0.09em/dust), metadata (12px), pull-quote (19px), stat footer (12px). No bold-700 anywhere. No serif. No italic paragraphs.

**Layout.** 640px single centered column (24px gutters), 56px section rhythm, 64px top pad. Nav chrome constrained to the same 688px grid (hairline runs full-width). At ≥1080px, section kickers move to the left margin as right-aligned catalog labels ("archival index" marginalia). Mobile <560px: nav links collapse to `≡` (real platform: existing HeaderMobileMenu), ledger rows stack label-over-value, name 30px/statement 19px. Verified overflow-free at 375 (Playwright `scrollWidth: 375`).

**Containers.** No bordered boxes. Grouping by whitespace + 1px warm hairlines. Radius only on interactive/soft elements (lens band 10px). No shadows. Hover: links underline (130ms), `<details>` summary gets one `--surface-soft` step. `:focus-visible` = 2px amber ring.

**Page order (signed-in viewer):** `← members` crumb → identity (68px initials avatar on cream-deep + name + mono meta line) → 22px statement (persona `one_line_bio`) → quiet action row (`view card ↗` · `ask anton about… →`) → **overlap lens band** → `// expertise` ledger (expert/practitioner/niche/languages) → first-question pull-quote (hanging amber `*`) → `// evaluation posture` ledger (bullish when / skeptical when) → `// story` (career arc faded + details rows) → mono activity footer. Anon viewers: same page minus the lens band and minus self-only affordances. Profile-body markdown (if the member wrote one) renders inside `// story` above the persona narrative.

## 4. v0.12 functional scope

1. **Member-page redesign** per §3 — restructures `app/members/[slug]/page.tsx` + `PersonaPanel` into the typeset-dossier composition. Persona sections come from the *known* heading skeleton of `.public.md` (`## Background` → one-line bio / career arc / hard-won knowledge / patterns; `## Evaluation posture` → bullish / skeptical / failure+success patterns / first question; `## Role dispositions`) parsed into components, with **graceful fallback**: unknown/missing sections render as `.prose-warm` markdown exactly as today (H148 posture preserved — the parser never crashes, never truncates).
2. **Overlap lens** — signed-in viewers with their own persona see shared tags, complementary depths ("expert where you're familiar"), and 2-3 rule-derived conversation starters. Pure build-time/render computation on two parsed personas; viewer-private (not stored, not logged). Hidden for anon viewers and viewers without a persona.
3. **Ask-me-about chips** — derived from niche tags (read-only); `ask anton about… →` action deep-links to the member's preferred contact (Telegram handle if roster carries it — note: roster Telegram/Link/Focus columns are currently parsed-away in `lib/roster.ts`; v0.12 surfaces them) with a prefilled topic. No new write path.
4. **Shareable member card** — `ImageResponse` (next/og) route rendering name + statement + top expert tags + wordmark on cream; used as the OG image for `/members/[slug]` and embeddable (`view card ↗` page with copy-snippet for GitHub READMEs). Renders ONLY already-public persona/profile fields.
5. **GitHub-link attach + re-sync** — PersonaEditor gains a URL field (alternative to paste/upload): server action fetches from an allowlist (`raw.githubusercontent.com`, `gist.githubusercontent.com`) with timeout + 64KB fetch cap, then the SAME `SavePersonaSchema`/H142 validation. Source URL stored as `persona_source_url` (location per O4); a "re-sync" button re-fetches + re-validates + recommits. Erasure (H146) also clears `persona_source_url`.
6. **i18n the PersonaEditor status strings** (carried from the v0.11.2 candidate list) + the new strings.

**Consent posture:** no change to ADR-0019. Everything renders/derives from already-public `.public.md` + profile data; link-attach is the same consent act through the same validation; H138–H150 invariants all hold. The lens is viewer-private computation. (The §22 known overhang — the separate ADR + history audit for pre-existing full-`.md` files — remains open and is NOT this scope.)

**Hardening candidates for spec §23 (final ids at spec lock):** SSRF allowlist + redirect-refusal + content-length cap on link-fetch · re-sync reuses the single validation path (no second pipeline) · OG route public-fields-only + no persona body text beyond the statement · small-text color tokens pinned ≥4.5:1 (regression test like H92) · lens computed per-request for the viewer, never persisted/logged · marginalia kickers hidden from the accessibility tree duplicate-free (single source heading).

**Open questions for plan-writing (O1–O5):** O1 conversation-starter rules (propose: top shared tag + complementary-depth tag + niche intersection, template-phrased). O2 `ask about` link target when roster has no Telegram (fallback: copy-handle). O3 card visual = identity zone of the approved mockup (cream) vs dark variant — pick at plan time with one render spike. O4 where `persona_source_url` lives (profile frontmatter vs separate registry file). O5 statement source precedence when `one_line_bio` missing (fallback: profile body first line? or omit).

## 5. Explicitly out of scope (deferred)

- v0.13 Q&A write path · v0.14 evaluator routing · v0.15 persona-as-lens AI (+ its ADR + LLM infra) — per D4.
- Per-IP rate-limit, bridge cookie, active-invite registry, meeting-token `iat`, revoke auto-retry (v0.11.2 candidates; unrelated to persona — re-scope at the 6/12 retro).
- persona-builder → roster-slug convention fix (tooling-side; still wanted, owned outside this design).
- Vouches / first-question wall / asks-offers / Donut pairing (researched, not picked; revisit post-v0.12 with usage signal).

## 6. Research artifacts (for the plan-writer)

Three research briefs (developer-identity product teardowns with measured CSS values; sleek-craft rules from Linear/Vercel/Stripe/Anthropic teardowns; 2026 profile-trend do/don't audit) were produced in-session. Key conclusions are baked into §3; the do/don't table worth re-reading at implementation time: single-column editorial flow / no bento tiles · small confident avatar / no hero headshot · inline comma lists + definition rows / no chip walls · mono 12-13px muted metadata · one oversized statement max · gradient-fade + counted `<details>` / never accordion the bio · hairlines + whitespace / no nested cards · hover reveals only on expandables / no scroll-jacking.
