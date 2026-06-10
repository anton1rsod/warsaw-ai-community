# ADR-0019 — Persona attach consent & visibility model

- **Status:** Accepted (v0.11.1 squash-merged 2026-06-10 at `616ba6f`; tag `community-platform-v0.11.1`)
- **Date:** 2026-06-09
- **Deciders:** Anton (founder / DRI)
- **Spec:** `projects/community-platform/spec.md §22` · **Design:** `docs/specs/2026-06-09-community-platform-persona-attach-design.md`
- **Related:** ADR-0001 (OSS / public repo), ADR-0012 / ADR-0014 (discovery posture), §21 / ADR-0018 (the invite path this builds on)

## Context

v0.11.1 lets members **self-serve attach** a persona to their profile (Bundle B). Personas are member-authored **personal data**, the repo is **public** (ADR-0001), and git history is **immutable**. The persona-builder already defines a consent model (README §Privacy): *peers see `.public.md`; the full `.md` — including a `## Private notes` section — is for a future evaluation assistant only.* Today's platform code contradicts that model (`readMemberPersona` renders the full `.md`, masked only by `truncateToFirstH2`), and the planned rich-card feature would un-mask and expose it. We need an explicit consent + visibility posture before opening a self-serve write path for PII.

## Options

1. **Attach = consent, `.public.md`-only, profile-level visibility flag, erasure incl. persona** (chosen).
2. **Two-tier full + public** maintained by the member — rejected: "private" is illusory in a public repo; doubles the write/parse paths for no real privacy gain.
3. **Field-level section consent** — rejected: schema + UI complexity unjustified for a first persona release.

## Decision

1. **Attach is the consent act**, gated by **informed** copy: content publishes to the public profile **and** the public repo; hide/delete clears the live site but **commit history is retained**; **purpose** = community evaluator matching.
2. The platform **displays and writes `.public.md` only** (peer-facing). The full/private `.md` + eval-assistant flow stays out of platform scope.
3. **Visibility** is a `persona_visible` flag in the **profile** frontmatter (not the persona file) — so this introduces **no persona `schema_version` change** (which would need its own ADR). Absent ⇒ visible.
4. **GDPR erasure** (`/api/me/delete`) removes the persona dir from `main`; history retained, consistent with the existing `GdprPanel` stance. The **hide toggle** withdraws display without deletion.
5. **Sanitization unchanged** — allowlist via `lib/markdown` + `SafeHtml`.

## Consequences

**Easier:** members self-serve (no admin round-trip to add or withdraw); the latent `.public.md`-inert / `truncateToFirstH2` consent bug is fixed; consent becomes informed + purpose-limited (GDPR-defensible); no persona-schema churn.

**Harder:** a new authenticated write path + PII surface (mitigated: session-derived slug, `persona_id`===slug, 64KB cap, allowlist sanitize, `security-reviewer` at closeout); members must supply a curated `.public.md` (the persona-builder tool already produces one).

## Implementation

`spec.md §22` (R1–R9, H138–H150). New `lib/persona.ts` + `app/actions/save-persona.ts`; changed `PersonaPanel`, `readMemberPersona`, `ProfileFrontmatterSchema` (+`persona_visible`), `/api/me/delete`.

## Open / related (not this ADR)

The existing full `persona-<slug>.md` files (potential `## Private notes`) already sit in the public repo — a **pre-existing exposure** independent of this feature. v0.11.1 stops *displaying* them; whether they belong in a public repo at all warrants a **separate ADR + history audit**.

## Change control

Supersede via a new ADR. Status flips to Accepted on the v0.11.1 merge.
