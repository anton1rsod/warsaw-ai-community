# ADR-0020 — Member dossier opt-in public visibility

**Status:** Proposed
**Date:** 2026-06-11
**Deciders:** Anton (founder / DRI)
**Amends:** [ADR-0012](./0012-community-platform-v0-3-discovery-posture.md), [ADR-0014](./0014-community-platform-v0-4-root-anonymous-landing.md) (both explicitly deferred the `/members` flip to "its own ADR with per-member opt-in collection")
**Related:** [ADR-0019](./0019-persona-attach-consent-and-visibility.md) (consent-act + profile-frontmatter-flag mechanism this reuses), [ADR-0001](./0001-oss-first-licensing.md) (public repo — why `.public.md` is already world-readable)
**Spec/plan:** deferred to the implementing minor (v0.12.1 candidate). This ADR records the decision; no separate design doc.

## Context

v0.12.0 (spec §23) rebuilt `/members/[slug]` as a typeset-dossier identity page (D5–D9) + overlap lens + ask-about + GitHub-link, and made **only** the OG image route public (`^/members/[slug]/opengraph-image$`, with in-route `persona_visible`/erasure re-checks, H155). On 2026-06-11 Anton ruled that the **page itself stays auth-gated** — a tactical hold to ship — and flagged the public-dossier question for a dedicated ADR. This is that ADR.

The driver is narrow and member-initiated: **a member wants a shareable public link to their own dossier** — drop the URL anywhere and anyone sees the page without signing in. It is explicitly *not* SEO/search-discovery and *not* anonymous directory-browsing (both declined in the 2026-06-11 brainstorm).

Three facts shape the answer. (1) A member's persona `.public.md` is **already public on GitHub** (git-tracked, public repo per ADR-0001) and (2) the **OG preview image is already anonymous-public** — so the persona *content* and a preview card are already world-readable; only the *rendered page* is gated. (3) The bio / photo / social links on a dossier were collected under a **members-only** posture; ADR-0012 ("profile pages contain bio/photo/social links — finer-grained opt-in would be required before flipping") and ADR-0014 ("flipping `/members` … requires its own ADR with per-member opt-in collection") both refused to publish them without a fresh, consented opt-in. The privacy ratchet those ADRs established allows exactly one explicit, reviewed expansion at a time — this is the next click.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Per-member opt-in public dossier** *(chosen)* — two profile-frontmatter flags, both default-OFF: `profile_public` (render dossier to anon) + `contact_public` (additionally expose contact to anon) | Serves the shareable-link driver; opting in **is** the consent act (provenance-correct, mirrors ADR-0019); default-OFF means zero retroactive PII publication; reuses the proven H155 in-route gate + frontmatter-flag pattern (no persona `schema_version` churn); granular (identity vs contact are separate acts) | Adds an anonymous PII surface for opted-in members; two new flags add `/me/edit` UI + a small parse/validate + test surface; polarity-inversion footgun vs `persona_visible` (see Harder) |
| B. Blanket flip — `/members` + `/members/[slug]` anonymous-public for everyone | Maximum reach; one-time change; no per-member state | **Republishes members-only-collected PII (bio/photo/social) without consent** on the next deploy — GDPR-hostile and directly contradicts ADR-0012/0014. Rejected. |
| C. Ratify members-only — write the ADR to keep `/members/*` gated, no flip | Cheapest; most privacy-conservative; status quo | Doesn't serve the driver. The OG card alone gives a *preview image*, not the *page* a member wants to share. Rejected. |
| D. Point members at existing public artifacts — share the GitHub `.public.md` / OG card instead of a platform page | Zero new code; uses already-public surfaces | Not a rendered dossier page; poor UX; the driver specifically wants the actual page. Rejected. |

## Decision

**Adopt Option A: `/members/[slug]` becomes anonymous-public on a per-member opt-in basis, governed by two default-OFF profile-frontmatter flags.**

- **`profile_public`** (absent/false ⇒ gated, current behavior; true ⇒ anonymous viewers can render the dossier). The anonymous render shows identity (bio / photo / GitHub / work); shows the persona rich card **only if `persona_visible` is also on** (unchanged); and **omits the overlap lens entirely** — it is computed relative to "you," and an anonymous viewer has no "you."
- **`contact_public`** (absent/false ⇒ contact hidden in the anonymous render; true ⇒ ask-about / Telegram handle shown). Governs the **anonymous render only** — signed-in viewers always see contact, as today.
- **`/members` index stays gated** — the driver is sharing *individual* links, not anonymous directory-browsing.
- **`noindex`** on the public render — reachable by anyone with the link, but not crawled into a scrapable people-directory (honors the declined SEO driver).
- **OG image route unchanged** — stays public-for-all per the 2026-06-11 decision, with its existing in-route `persona_visible`/erasure re-checks.

Enforcement mirrors the v0.12 H155 pattern: the **proxy gates at the boundary** (allow `/members/[slug]` only when that slug's `profile_public` is true, read from the content snapshot the proxy already loads) so the default fails closed, and the **page re-checks in-route** as defense-in-depth.

## Consequences

**Easier:**
- Members self-serve a genuinely shareable public dossier link — no admin round-trip to publish or withdraw.
- Consent is explicit and provenance-correct: the opt-in act carries the consent (mirrors ADR-0019), and default-OFF guarantees no member's PII is published without that act.
- Per-field control: exposing *contact* is a distinct act from exposing *identity*, so a member can be findable without handing strangers a DM channel.
- Mechanism is fully precedented — the `ProfileFrontmatterSchema` flag (ADR-0019) and the in-route consent re-check (H155) both already exist; no persona schema-version change.

**Harder:**
- **New anonymous PII surface** (bio/photo/social, and contact when `contact_public`) for opted-in members. Mitigations: default-OFF, two explicit informed toggles, `noindex` (limits automated harvest into a directory), boundary proxy gate that fails closed, in-route re-check, and GDPR erasure that withdraws the page naturally.
- **Polarity-inversion footgun.** `profile_public` defaults **OFF** while `persona_visible` defaults **ON** (because *attaching a persona* was itself consent, whereas *being on the roster* was never consent to anonymous publication). An implementer who copies the `persona_visible` default would retroactively publish every dossier. Mitigation: call this out in the plan + a default-OFF regression test.
- **Session-coupled rendering risk.** `/members/[slug]` now serves both an anonymous branch and a signed-in branch; a Server Component that leaks the signed-in lens/contact into the anonymous response would be a privacy bug. Mitigation: adopt the `/home` / ADR-0014 H56 posture (`Cache-Control: private, no-cache, …`; no signed-in side-effects on the anon path).
- **Contact-harvest vector** when `contact_public` is on — a Telegram handle on a link-shareable page is reachable by whoever has the link; `noindex` blunts crawling but not deliberate sharing. Accepted as a member-controlled opt-in.
- Two new flags add `/me/edit` UI, informed-consent copy, and parse/validate + test surface.

## Implementation

**Non-implementing as of this ADR** (Status: Proposed). Lands in a near-term minor (v0.12.1 candidate):

- `ProfileFrontmatterSchema` (`lib/profile-editor.ts`): add optional `profile_public` + `contact_public` booleans (absent ⇒ false).
- `proxy.ts`: allow `/members/[slug]` when the target slug's `profile_public` is true (content-snapshot lookup, analogous to the `OG_IMAGE_PATH` allow); otherwise fall through to the existing auth gate.
- `app/members/[slug]/page.tsx`: in-route re-check; anonymous render omits the overlap lens, shows contact only if `contact_public`, shows persona only if `persona_visible`, and emits a `noindex` robots meta; signed-in render unchanged.
- `ProfileEditor` (`/me/edit`): two toggles mirroring the `persona_visible` control, with informed copy (publishes to the public web + the public repo; OFF withdraws display, commit history retained).
- `/api/me/delete`: no change — erasure already removes the member file, so the public page 404s.
- Tests: proxy both-direction (opted-in slug → 200 anon / non-opted slug → `/login`); anon render omits lens + contact-unless-flag + persona-unless-`persona_visible`; default-OFF polarity guard; `noindex` present; signed-in render unchanged. E2E: anon GET of an opted-in dossier 200; anon GET of a non-opted dossier → `/login`.

### Supersedes / amends

Amends ADR-0012 (adds `/members/[slug]` to the public set, conditionally per-member — the flip 0012 deferred) and ADR-0014 (extends its per-*route* opt-in precedent to per-*member* opt-in). Supersedes nothing — every other decision in ADR-0012/0014 stands.

### Change control

- **Status flips Proposed → Accepted** on the implementing PR merge.
- **Reversal cost: LOW.** Remove the proxy flag-branch + the page's anonymous branch; no data migration (the flags simply stop being read, becoming inert). Update CHANGELOG with the revert SHA.
- **Re-evaluate / supersede triggers:** (a) a privacy incident from the anonymous surface (scraping despite `noindex`, contact-harvest abuse) → tighten or revert; (b) demand for SEO-**indexable** dossiers → a new ADR flipping `noindex` (explicitly out of scope here per the declined SEO driver); (c) demand for an anonymous `/members` **directory** → a new ADR (also out of scope).
