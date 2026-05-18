# W.A.Y. — Founder Pitch (Source of Truth)

> **Captured:** 2026-05-17 from Anton Safronov's first-chat brainstorm initiation.
> **Status:** Raw founder input. NOT a spec. The brainstorm (`superpowers:brainstorming` in chat-2) will refine this into `spec.md`.
> **Why preserved:** Chats are ephemeral; the source signal must outlive any single conversation. The brainstorm reads this verbatim. The spec writer reads the brainstorm output, not this file.

---

## The idea (Anton's words, lightly reformatted, no editorial)

An idea connected with the [persona-builder](../../persona-builder/) skill — expand it, create a product out of this skill, scale it to different business directions.

### Track 1 — B2C / Prosumer SaaS

A nice, fun SaaS / API-flavored service where people can **create their own persona**. New agents (skills) deploy *for the created persona*, so it learns new things and starts doing **specific** professional tasks (development, marketing, sales, finance, legal, etc.) — **without spending too much API budget** (one of the selling points).

**Monetization model:**

- **Free "demo" tier (freemium):** create a free version of your persona with ~30 % of full capabilities.
- **Full persona builder:** monthly subscription.
- **Per-skill knowledge unlocks:** for each new skill / "knowledge", either a **one-off fee** to acquire that version, or a **monthly fee** to receive updates to that knowledge over time.

### Track 2 — B2B / C-suite consulting

Consulting for **company boards** (CEO, COO, CFO, etc.) to create *their* personas — expand their work possibilities, control & monitor more of the business they care about. Teach them how to set up **daily / weekly agents** with their persona to do certain tasks autonomously.

**Onboarding pipeline:**

1. **Free consultation** + creation of the freemium version of the persona.
2. **Next 1.5-hour consultation:** **€250**.
3. **Custom persona for Director / C-Level / VP:** enterprise-level engagement, pricing **custom / on demand**.

### Product surface (early thinking)

- **Personas are NOT attached to the platform first** (portability is a value prop).
- **2026-fresh UI/UX** for persona creation (questionnaire → save persona).
- **Playful gamification** — maybe a **mindmap of skills**, like a computer-game skill tree, which you **unblock by paying** the developer for the custom skill from a **custom skill marketplace** (basically a private Git library / package registry).
- Each piece of knowledge unlocks one-by-one as the user pays.
- **Integration wizard** — how to use the persona, how to connect it to a service (Terminal, VS Code, etc.) to use it properly.

### ICP

Quite wide.

### Framework

Spec-driven development like the [GBrain](../gbrain/) project framework.

---

## What Anton asked Claude to do in this opening chat

1. **Analyze which skills could be useful for brainstorming** this product so Claude invokes them properly and at the right time.
2. **Create a separate folder** in the Warsaw AI Community repo called *"W.A.Y. Who are you?"* — slugged `way-who-are-you/` per the docs-first kebab-case convention.
3. **Start a project from there** by managing and creating a proper `CLAUDE.md` and project structure.

(The brainstorm-then-spec-then-plan pipeline begins in the **next chat / next turn**.)

---

## What this pitch does NOT yet decide (open questions for the brainstorm)

These are the spaces the brainstorm needs to explore — they are **not** answered above:

- **What's the smallest, sharpest wedge?** (Persona for whom, doing exactly what, that lights up the demand curve?)
- **What is "30 % capability"?** Which 30 %? Decided by what principle (depth, breadth, count of skills, output volume, integration breadth)?
- **Marketplace producer side:** who builds the skills people buy? Internal team only? Open submissions? Curation gates?
- **Persona portability:** "not attached to the platform" — does that mean exportable Markdown? Open schema? On-prem? Bring-your-own LLM?
- **Pricing anchors:** is €250 / consult and €X / month consistent with willingness-to-pay for the freemium and consulting cohorts? Where does the €0 → €∞ ladder break?
- **Consulting unit economics:** how does Anton (one person) scale Track 2 past N consults / month without becoming the bottleneck?
- **Defensibility:** if the persona schema is open and skills are downloadable Markdown, what's the moat — UX? Community? Curation? Integrations? Data?
- **Relationship to the underlying Warsaw AI Community persona-builder skill:** does W.A.Y. fork, license, or replace it? Does the community get a different price tier?
- **Commercial entity:** ADR-0004 says no commercial entity exists for Warsaw AI Community. Does W.A.Y. require one? Owned by Anton personally? A spinout?
- **Compliance posture:** persona data + payment = GDPR + DSA exposure. Where does that live?

The brainstorm in chat-2 should not try to answer all of these in one pass. It should **lock the wedge**, then surface the next 3-5 questions to drive the spec.

---

## How the brainstorm should treat this document

- **Verbatim source.** Don't edit this file. If the brainstorm refines a claim, that refinement goes into `spec.md`, not back into this file.
- **Input, not law.** Anton has said he wants forcing-question pressure (`office-hours` startup mode) and CEO-scope-pressure (`plan-ceo-review`). Both are licensed to challenge anything above.
- **One pitch, many products.** The above describes a candidate product surface. The brainstorm might collapse it (B2B only? B2C only? marketplace-first?) or expand it (community-licensed tier? open-core?). Both are legitimate outcomes.
