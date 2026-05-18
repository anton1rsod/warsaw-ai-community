# W.A.Y. — Who Are You? — Design Spec

**Status:** Draft (ready for Anton review)
**Date:** 2026-05-18
**Author:** Anton Safronov
**Tagline (L22):** *The persona layer for your AI stack.*

---

## §0 — Executive summary + lock list

### What W.A.Y. is

W.A.Y. is a **client-side persona-to-Claude-Skill packager** + install wizard layer. Founders complete a deep web-based questionnaire; W.A.Y. generates a downloadable Claude Skill folder containing the persona + a bundled task menu. Users drop the folder into Claude Code (v0 primary) or Notion AI (v0.5 secondary) and invoke their persona to draft content, prep meetings, or run other voice-critical work — *in their own voice, inside their existing AI tool, on their own machine.*

The category-defining claim: **identity layer for the AI agent ecosystem.** Other tools sell *capabilities*; W.A.Y. sells *the persona that makes any AI tool act like you*.

### Brainstorm provenance

This spec consolidates the chat-3 brainstorm session run via `superpowers:brainstorming` on 2026-05-17 → 2026-05-18 (single session across two calendar days). Source pitch preserved verbatim in [`founder-pitch.md`](founder-pitch.md). Iterative Q1-Q9 + meta-question pattern produced 22 architecture locks + the 2026-05-18 "no payments yet" refinement.

### Lock list (the architectural skeleton)

| # | Lock | Section |
|---|---|---|
| L1 | Wedge: S1 (Software-first persona creator) | §1, §6 |
| L2 | Deliverable: downloadable Claude Skill zip; no hosted LLM inference | §6, §3.2 |
| L3 | Wizard primary target: **Claude Code** (v0). Claude Project = v0.5+ port. | §6 |
| L4 | Persona = role-aware agent that completes tasks in user's voice, inside their tool | §1, §6 |
| L5 | Marketplace S2 deferred to v1+ | §3.1 |
| L6 | v0 ICP: Founders & operators | §4 |
| L7 | Persona zip = role-specific TASK MENU, not just system prompt | §6 |
| L8 | v0 ships founder role only; schema designed role-extensible | §6 |
| L9 | v0 founder menu = 4 tasks (LinkedIn drafter, investor update, email follow-up, 1:1 prep), all shipped in v0 | §6 |
| L10 | Delivery format = Claude Skill folder per open Agent Skills standard | §6 |
| L11 | Persona schema = persona-builder's 6-section schema; workflow/preferences extension deferred to v1+ | §6, §3.1 |
| L12 | v0 task sub-skills use only Claude Code built-in tools (no MCP deps) | §6, §3.1 |
| L13 | Marketplace S2 = additional Claude Skills that compose with persona via Claude Code skill loader | §3.1 |
| L14 | Methodology: step-by-step releases (v0 → v0.5 → v1), full architecture pre-locked, Claude Code = build accelerator | §6 |
| L15 | v0 questionnaire = custom web app (polished 2026 UI); logic ported from persona-builder design principles | §6 |
| L16 | v0 scope = 4 tasks + polished questionnaire + Claude Code wizard, free in private testing | §6 |
| L17 | Three-layer storage: persona client-side default; account metadata server-side; marketplace deliveries server-delivered → client-stored | §6, §7 |
| L18 | Marketplace S2 delivery = git-as-backend (versioned, atomic, invisible to user); aligns with Anthropic Feb 2026 native mechanism | §6 |
| L19 | W.A.Y. competes on persona depth, not marketplace mechanic | §1, §3 |
| L20 | v0.5 second-target install wizard = Notion AI | §6 |
| L21 | W.A.Y. authors own purpose-built interview protocol; community `persona-builder` = reference design only | §1, §6, §7 |
| L22 | Tagline / category line = *"The persona layer for your AI stack"* | §1 |

**2026-05-18 refinement (post-brainstorm):**
> **No payments yet, at all** — v0 + v0.5 are entirely free. Paid tier, Stripe integration, commercial entity setup, ToS, GDPR DPA all deferred until "future release when monetization makes sense" (BACKLOG-tracked).

### Related artifacts (in this project folder)

- [`CLAUDE.md`](CLAUDE.md) — project-level read order + skill discipline for AI collaborators
- [`founder-pitch.md`](founder-pitch.md) — Anton's verbatim source pitch (chat-1, 2026-05-17)
- [`BACKLOG.md`](BACKLOG.md) — ideas, experiments, scope additions not yet ready for spec
- [`plan.md`](plan.md) — implementation plan (TBD; populated by `superpowers:writing-plans` after this spec lands)
- [`CHANGELOG.md`](CHANGELOG.md) — release history
- [`research/2026-05-18-platform-compatibility-matrix.md`](research/2026-05-18-platform-compatibility-matrix.md) — which AI tools the persona zip can deploy into (stub; separate research session)
- [`research/2026-05-18-competitive-landscape.md`](research/2026-05-18-competitive-landscape.md) — competitor catalog + SWOT (stub; separate research session)

---

## §1 — Problem

> **Founders are the binding constraint on their own company's growth.** They run too many functions in parallel — writing, sales, hiring, decisions, content, fundraising, ops — and every additional thread costs context-switching they can't afford. The fantasy every founder has articulated at some point, to a co-founder or a coach or on a podcast, is *"I wish I could clone myself."* Not "I wish I had a better assistant." Literally: another *me* — one who knows what I know, sounds like I sound, decides how I decide, and can run real work in parallel while I'm doing something else.

> **Why today's AI tools don't deliver the clone.** Generic LLMs (ChatGPT, Claude, Gemini) help with isolated tasks but don't *embody* the founder. The founder still does the orchestration, the voice-loading, the context-pasting, the judgment. Custom GPTs and Claude Projects get closer, but they're side-projects most founders don't ship well — and the result is a stateless prompt, not a *self* that grows over time. The wave of "AI twin" / "digital you" products that emerged in 2025 are personality novelties for entertainment, not professionally-capable agents that can run real work in real tools on real data.

> **What founders actually want.** An installable second *me*. An agent that captures my **skills** (technical, domain, social), my **knowledge** (industry, company, network), my **voice** (how I write, how I decide, how I push back), and my **activities** (what tasks I do, in what tools, with what preferences). One that grows new capabilities over time. One that runs on my machine, in my tool, on my terms.

### Why now — a specific sequence of platform changes opened the window

> - **October 16, 2025** — Anthropic launches Claude Skills. Folder-based agent capability packages (`SKILL.md` + supporting files).
> - **December 18, 2025** — Agent Skills published as an **open standard**. **OpenAI adopts the same format** for Codex CLI and ChatGPT.
> - **February 24, 2026** — Anthropic enables **private-GitHub-backed plugin marketplaces with auto-install** for targeted users.
> - **March 6, 2026** — Anthropic launches the official **Claude Marketplace** (Snowflake, GitLab, Harvey, Rogo, Replit, Lovable Labs).
> - **March 20, 2026** — **Notion launches Custom Skills for Notion AI**. The standard extends beyond Claude's own products.
> - **May 5, 2026** — Notion adds Custom Agent admin controls. The category is maturing into enterprise-grade infrastructure.

> The runtime is solved (Anthropic + OpenAI + Notion + Atlassian). Distribution is solved (private GitHub + auto-install). Cross-platform portability is solved (open standard, multi-vendor adoption). What remains unsolved — and what W.A.Y. solves — is **deep persona authoring + persona-as-foundation-for-task-skills + privacy-first posture + cross-platform identity**.

### Competitive positioning

> **What W.A.Y. is NOT competing on.** General skill marketplace (Anthropic's own + Notion's + lobehub + skillsmp + 1M+ community skills already exist). Task-skill quality alone (commodity). Agent runtime (the platforms provide it).

> **What W.A.Y. IS competing on.** The persona is the unique knowledge graph of *you* — a deep, opinionated extraction other tools haven't built. The Warsaw AI Community's `persona-builder` skill provides a V1 reference design; W.A.Y. authors its own purpose-built interview, specifically hardened for the founder cohort and iterated across releases (per L21). Pushback on weak answers, refusal of inflated depth claims, and named-story routing to private notes are inherited design principles.

> Critically, the persona is **portable across the AI ecosystem.** Drop the W.A.Y. persona zip into Claude Code, Codex CLI, ChatGPT custom GPTs, Notion AI (custom skills, March 2026), or any AI feature in Atlassian / Canva / Figma that consumes the Skills standard — and that tool starts working *in your voice with your judgment.* Other skill marketplaces sell *capabilities*; W.A.Y. sells **the persona layer that makes any AI tool act like you.**

> **What the v0 LinkedIn drafter is and isn't.** The v0 demo task is **not** the product — it's proof that the persona produces voice-accurate output founders themselves recognize as *"mine."* If voice works for one task, it works for the menu (investor update, email follow-up, 1:1 prep). If the menu works, the marketplace works (CRM operator, sales-pipeline monitor, OKR drafter — composable skills that drop into the same folder). The v0 is a wedge; the company is **the persona layer for your AI stack** — *clone yourself, for real, in any tool you already use.*

---

## §2 — Goals

> Goals split by lifespan. **v0 metrics are FIRM** — what we ship and measure for this release. **v0.5+ goals are DIRECTIONAL** — current sketch, revised release-by-release as W.A.Y. teaches us. **North star is ASPIRATIONAL** — not a commitment.

### §2.1 v0 — FIRM (what we ship)

> - **10+ persona creations** by founders in Anton's network + the 4 Warsaw AI Community personas (Heorhii K., Dmitry B., Maksym P., Mark S.) as synthetic-test users for the technical path.
> - **5+ Claude Code installs** completing the full wizard flow end-to-end.
> - **3+ "this sounds like me" testimonials** from founders who used the LinkedIn drafter and either posted the output or said they could have.
> - **Zero PII breach** — client-side persona content enforced by architecture (L17).
> - **Architecture validated end-to-end** — persona skill folder loads, drives the 4-task menu (LinkedIn + investor update + email + 1:1 prep), survives a re-install/update test.

### §2.2 v0.5 — DIRECTIONAL (revised when v0 lands)

> Public launch — **FREE** (paid tier deferred per 2026-05-18; no Stripe, no subscription, no per-skill purchases at v0.5).
>
> - **Free public launch.** All 4 founder task skills available to anyone who completes the questionnaire.
> - **50+ persona creations** in first month.
> - **25+ active Claude Code installs** (re-use detected after first session).
> - **100+ email signups** on the "tell me when paid features arrive" waitlist (proxy signal for future willingness to pay).
> - **Notion AI install path polished** (per L20 second-target wizard).
> - **Marketing reach** — 1+ founder-targeted launch post on LinkedIn or Hacker News with >100 reactions / >50 upvotes.
> - **3+ unsolicited "I'd pay for this" messages** from users (qualitative pricing signal).

### §2.3 v1+ — DIRECTIONAL (vision, not commitments)

> - **Marketplace S2 live** with 3+ first-party skills selected by v0/v0.5 demand signal.
> - **Workflow/preferences layer (L11) shipped** — extended persona schema populated by real user feedback.
> - **Multi-role expansion past founder** — at least one second role (dev / marketer / consultant) based on adjacent demand.
> - **Track 2 (consulting) launches** — free intro → €250/1.5h → custom enterprise.
> - **100+ paying subscribers** on the B2C SaaS side.
> - **1+ enterprise consulting client** on the Track 2 side.

### §2.4 North star — ASPIRATIONAL (12-24 months out)

> - W.A.Y. is the **recognized persona layer for the AI agent ecosystem** (per L22 tagline).
> - Revenue is sufficient to be Anton's primary venture — or W.A.Y. has raised intentionally for category-leadership land-grab (bootstrap-vs-VC fork is itself a v1 decision).
> - **Persona portability is real** — personas import/export/update across 3+ AI tool ecosystems without re-authoring (Claude Code + Notion AI + at least one other).
> - **First third-party skill creator** has shipped to the marketplace and earned revenue — producer-side flywheel started.

---

## §3 — Non-goals

### §3.1 Deferred — not in v0, planned for later releases

> - **Marketplace S2** (additional skill SKUs sold à la carte) — v1+ per L13.
> - **Multi-platform install wizards beyond Claude Code** — Notion AI second-target at v0.5 per L20; Codex CLI / ChatGPT / Atlassian / Canva / Figma get "drop the folder, it works" status until v1+.
> - **Multi-role personas** (developer / marketer / sales / consultant / C-suite) — v0.5+/v1+ per L8.
> - **Workflow/preferences extension layer (L11)** — v1+ pending v0/v0.5 feedback on what the questionnaire missed.
> - **Track 2 consulting motion** (free intro → €250/1.5h → enterprise custom) — v1+ launch.
> - **Cloud storage / multi-device sync** — opt-in paid feature from v0.5+ per L17.
> - **Gamified skill-tree UX** — BACKLOG; could ship as the marketplace-browsing surface in v1+.
> - **Mobile-native questionnaire experience** — BACKLOG; v0 is desktop-only.
> - **Persona update / re-onboarding path** — needs ADR before v1.
> - **Paid tier launch** (Stripe + subscription + per-skill pricing) — deferred per 2026-05-18 decision. v0 and v0.5 are entirely free. Triggers for revisit: revenue conviction from v0.5 user signal (waitlist depth, unsolicited "I'd pay" messages, Track 2 consult demand).
> - **Cookie consent banner** — required only at v0.5 (when GA loads); v0 (private testing, no GA on questionnaire pages) skips it.

### §3.2 Out of W.A.Y.'s scope (not pursued; reversible by strategy shift + ADR)

> - **A general-purpose skill marketplace.** Space is saturated (Anthropic's own + Notion's + lobehub + skillsmp + 1M+ community skills). W.A.Y. competes on persona depth, not marketplace mechanic (L19).
> - **A hosted LLM inference platform.** W.A.Y. does NOT pay per-message API costs. The user's chosen AI tool provides the runtime. Core to the "no API coins" pitch (L2).
> - **A destination AI chat product** (Replika / Character.AI category). *Note:* a brief in-product **persona preview chat** — letting users validate their newly-created persona before downloading the zip — is a candidate v0.5+ feature tracked in `BACKLOG.md`. That's a focused on-the-way-out validation utility, not a destination chat. The line: W.A.Y. is **not where you go to chat with AI**; it might be where you briefly test that *your persona reads like you* on the way out the door.
> - **An AI-twin / digital-you entertainment product** (Replika / Character.AI category). W.A.Y. is a professional-agent platform.
>
> *(Enterprise compliance suite — moved to `BACKLOG.md` per 2026-05-18; Track 2 candidate.)*

### §3.3 Brand-defining non-goals (W.A.Y. cannot do these without becoming a different company)

> - **A persona-data harvesting service.** W.A.Y. never trains models on user persona content. Client-side default (L17); opt-in cloud backup encrypted-at-rest with explicit consent.
> - **A platform-lock-in service.** Personas use the open Skills standard. Portability promise (L20) is non-negotiable.
> - **An LLM-generated persona service.** The user is the author of their own persona; W.A.Y. structures the interview, not the answers. Pushback discipline rejects generic answers (L21).

### §3.4 Common-confusion clarifications

> - **W.A.Y. is not the community `persona-builder` skill ported to web.** The community skill is MIT-licensed, member-consent-driven. W.A.Y. is a separate commercial product (Anton's personal/private venture per project [`CLAUDE.md`](CLAUDE.md)) that authors its own purpose-built interview protocol (L21). The community skill remains community-owned and unchanged.
> - **W.A.Y. is not the same as the persona-driven peer-evaluation workflow Anton has been exploring separately.** That workflow is Anton's own separate concept, currently not formally connected to the Warsaw AI Community. W.A.Y. doesn't replace or compete with it — different audience (paying founders building their own agents) and different output (an installable Claude Skill, not an evaluation draft). The two could cross-pollinate later; separate concerns now.
> - **W.A.Y. v0 is not a public product.** Private testing with Anton's network + 4 community personas as synthetic test users. Public launch = v0.5.
> - **W.A.Y. has no public roadmap commitment past v0.** §2.2 / §2.3 are directional sketches; [`BACKLOG.md`](BACKLOG.md) drives prioritization between releases.

---

## §4 — Users / stakeholders

### Primary users — by release

> **v0 (private testing — free):**
> - Founders in Anton's network. Early-stage founders / small-business operators (ICP per L6) who know Anton personally and trust him enough to try a private product. Target: 10-20 persona creations, ≥ 5 full Claude Code installs.
> - Warsaw AI Community personas as synthetic technical-test inputs. Heorhii K., Dmitry B., Maksym P., Mark S. — used to verify the *technical packaging path* across diverse persona shapes. **Consent flow per §7.**
>
> **v0.5 (public launch — FREE, paid tier deferred):**
> - Founder-tier free users. Same ICP, acquired via LinkedIn / Hacker News / founder Slack/Discord / Telegram circles in Anton's reach / podcast guest spots.
> - Waitlist signups for "tell me when paid features arrive" (signal of future willingness to pay).
>
> **v1+ (marketplace + Track 2):**
> - Multi-role expansions — devs / marketers / sales / consultants — adjacent cohorts surfaced by v0/v0.5 demand signal.
> - Track 2 enterprise consulting clients — C-suite at mid-size companies (CEO / COO / CFO / VP). Free intro → €250 / 1.5h paid consult → custom enterprise engagement. Anton-delivered service, not self-service.
> - Marketplace skill producers — third-party developers selling Claude Skills that compose with W.A.Y. personas (revenue-share economics TBD, BACKLOG).

### Stakeholders (parties affected, not necessarily users)

> - **Anton Safronov** — founder, sole decision-maker, sole builder for v0 and likely v0.5. Per project [`CLAUDE.md`](CLAUDE.md): W.A.Y. is Anton's personal/private commercial venture, not a Warsaw AI Community sub-project.
> - **Warsaw AI Community** — the parent OSS community. **NOT operationally a stakeholder** in W.A.Y. The relationship: W.A.Y. lives in the community repo as a working surface and inherits *design principles* from the `persona-builder` skill (per L21), without absorbing it or routing revenue back. The community is a **sibling project**, not a parent or customer.
> - **Platform partners** (Anthropic, OpenAI, Notion, Atlassian, others) — provide the runtime + distribution + Skills standard. W.A.Y. is downstream of their roadmap decisions; platform pricing/policy changes tracked as risks (§9). Future direction: pursue partnership badges / certifications (BACKLOG).
> - **Future contributors / co-builders** — TBD. v0 is solo-Anton; whether v0.5+ adds contractors / co-founders / employees is a future decision tied to revenue thresholds.
> - **Future marketplace skill creators (v1+)** — third-party developers shipping skills to W.A.Y.'s marketplace. Producer-side; revenue share + onboarding terms = BACKLOG / S2 brainstorm.

### Block-relationships (who could stop W.A.Y. from shipping)

> - **Anthropic / OpenAI** — if either deprecates the Skills standard or changes pricing aggressively, W.A.Y.'s portability claim narrows. Mitigation: open-standard adoption across multiple vendors reduces single-vendor risk.
> - **Anton's own bandwidth** — solo-founder bandwidth is the rate-limiter for v0 / v0.5. No external dependencies that can block in v0.
> - **Community member consent for synthetic testing** — if any of the 4 personas decline to be used as test inputs, W.A.Y. needs alternative test data (Anton's own persona + fictional founder personas Anton authors).

---

## §5 — Constraints

### Technical

> - **Open Skills standard.** Persona delivery uses the Claude Skills folder format (L10) for cross-vendor portability. Any schema change must preserve this compatibility.
> - **No MCP server dependencies in v0 sub-skills (L12).** v0 task sub-skills work only with Claude Code's built-in filesystem + web tools. MCP-dependent skills deferred to S2 marketplace.
> - **Three-layer storage (L17).** Persona content client-side by default; server-side limited to account metadata. Cloud backup = opt-in paid v0.5+ feature.
> - **Marketplace delivery = git-as-backend (L18).** Private git repos host versioned skill bundles; auto-update mechanism handles installs invisibly.
> - **No hosted LLM inference (L2).** User's chosen AI tool bears runtime cost.
> - **Tech stack (defaults — ADR candidate before v0 build):** Next.js + Vercel for frontend + serverless backend; Stripe deferred; Gitea or self-hosted private-git-host for marketplace backend at v1+. Matches repo convention (gbrain + community-platform).

### Time

> - **v0 build target: 6-8 weeks** (per L15/L16) — polished web questionnaire + 4 task sub-skills + Claude Code wizard, private testing. Aggressive cadence via Claude Code as build accelerator (L14) partially offsets bandwidth.
> - **v0.5 build target: 4-6 weeks after v0** — public launch + Notion AI second-target wizard. Free; no Stripe.
> - **v1 build target: months after v0.5** — marketplace + workflow layer + Track 2 launch. Payment infrastructure added here (or later).
> - **Anton's bandwidth is the rate limiter.** Solo founder; W.A.Y. competes for time against other Warsaw AI Community sub-projects + life.

### Budget

> - **Personal venture, no external funding for v0.** Bootstrap from Anton's resources.
> - **Hosting:** Vercel free / pro tier for frontend; eventual private git hosting (Gitea VPS or GitHub Pro) for v1 marketplace.
> - **No Stripe processing fees in v0 / v0.5** (paid tier deferred per 2026-05-18).
> - **No marketing spend in v0 / v0.5.** Acquisition is organic.
> - **No paid contributors in v0.** Solo build via Claude Code.
> - **Analytics:** Google Analytics + GTM (free, Anton's choice 2026-05-18); activates at v0.5 only.

### Ethical / consent

> - **Community member persona consent** (→ §7): synthetic-test use requires explicit per-member consent beyond the MIT license.
> - **Privacy posture is non-negotiable (L17 + §3.3).** Persona content client-side default; no model training on user content.
> - **GDPR compliance**: privacy policy required at v0; cookie banner + GA gate required at v0.5; full ToS + GDPR DPA only when paid tier launches.
> - **Cross-platform portability promise (L20)** is a constraint, not just a feature. Any architectural shortcut that breaks Skills-standard compatibility violates a brand-defining non-goal.

### Legal / commercial

> - **Commercial entity**: NOT required for v0 or v0.5 (no payments per 2026-05-18). Required when paid tier launches (future). Entity decision (sp. z o.o. / Estonian e-residency / sole prop / other) becomes a parallel-track decision at that point — no longer blocks v0.5.
> - **Licensing**: W.A.Y. closed-source / Anton's IP; community `persona-builder` stays MIT. Two separate IP streams.
> - **Trademark**: "W.A.Y." name TBD on availability check before v0.5 public launch (cheap pre-launch step).
> - **Privacy policy** (simple template): required at v0 baseline for email collection + analytics.

---

## §6 — Approach

### High-level model

W.A.Y. is a **client-side persona-to-Claude-Skill packager** with a thin server-side waitlist surface and an install wizard layer. Persona content never leaves the browser. The user's existing AI tool (Claude Code / Notion AI / etc.) is the runtime; W.A.Y. is the *authoring + packaging + onboarding* layer.

```
┌─ USER'S BROWSER ────────────────────────────────────────────┐
│  ┌──────────┐   ┌─────────────┐   ┌──────────────────────┐ │
│  │ Landing  │ → │ Questionnaire│→ │ Persona→Skill        │ │
│  │ +waitlist│   │ (~30-60 min)│   │ Packager (JS, JSZip) │ │
│  └──────────┘   └─────────────┘   └─────────┬────────────┘ │
│                                              ▼              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Claude Skill ZIP downloaded by user:               │  │
│  │  way-persona-{slug}/                                │  │
│  │  ├── SKILL.md          (top-level entry)            │  │
│  │  ├── persona.md        (the full persona file)      │  │
│  │  ├── INSTALL.md        (wizard text inline)         │  │
│  │  └── skills/                                        │  │
│  │      ├── draft-linkedin-post/SKILL.md               │  │
│  │      ├── draft-investor-update/SKILL.md             │  │
│  │      ├── draft-email-followup/SKILL.md              │  │
│  │      └── prep-1on1/SKILL.md                         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │  (only email leaves the browser)
                         ▼
┌─ W.A.Y. SERVER (minimal — Vercel + KV store) ──────────────┐
│  - POST /api/waitlist  (email, opt-in flags only)          │
│  - Google Analytics + GTM (from v0.5 only; cookie-gated)   │
│  - NEVER receives persona content                          │
└─────────────────────────────────────────────────────────────┘

┌─ USER'S MACHINE ────────────────────────────────────────────┐
│  ~/.claude/skills/way-persona-{slug}/   ← unzipped here     │
│  ↓                                                          │
│  Claude Code loads skill on next launch                     │
│  User: "use my-persona to draft a LinkedIn post about X"    │
│  → Claude reads persona.md + task sub-skill → outputs in    │
│    user's voice                                             │
└─────────────────────────────────────────────────────────────┘
```

### Components

**1. W.A.Y. web app (Next.js + Vercel)**
- Public landing page with L22 tagline + waitlist email capture + "Create my persona" CTA.
- Questionnaire flow — polished web UI rendering the W.A.Y. interview protocol (L21). v0 schema inherits the persona-builder's 6 sections (Identity, Tags, Background narrative, Evaluation posture, Role dispositions, Verifiable evidence) per L11.
- Browser-side persona Markdown generator.
- Browser-side Claude Skill folder generator + zip packaging.
- Install wizard pages (Claude Code v0; Notion AI v0.5).
- **Architectural note for future variants (BACKLOG approved direction):** questionnaire engine designed to read a *variant config* (which sections, which questions, which pushback rules, which schema overlays). v0 ships one config (founder, ~45-min standard depth); future variants (sector × industry × position × depth) are config-only additions, not engine rewrites.

**2. Persona-to-Skill renderer (browser-side TypeScript)**
- Takes structured persona answers.
- Emits a complete Claude Skill folder (top-level SKILL.md, persona.md, INSTALL.md, skills/ × 4).
- Packages into downloadable ZIP via JSZip.

**3. Minimal server backend (Vercel serverless functions)**
- `POST /api/waitlist` — email + opt-in flags → Vercel KV.
- `GET /api/health` — uptime check.
- Google Analytics + GTM from v0.5 (cookie-gated).
- **NEVER has a persona-content endpoint in v0/v0.5.** Privacy promise enforced by absence of API surface.

**4. Install wizards (web pages, content not code)**
- Claude Code wizard (v0): step-by-step page — where to drop ZIP, what `~/.claude/skills/` looks like, how to verify, how to invoke. Screenshots + commands + expected outputs.
- Notion AI wizard (v0.5): equivalent for Notion's custom skills (March 2026 launch).

**5. Future components (deferred)**
- Marketplace backend (v1+) — private git repos hosting versioned skill bundles per L18.
- Cloud persona backup (v0.5+ opt-in) — encrypted-at-rest server-side storage; only if user explicitly opts in.
- Persona preview/test chat (BACKLOG, v0.5+ candidate).
- Track 2 consulting intake (v1+).

### Data flow (v0)

1. User lands on the W.A.Y. domain.
2. Clicks "Create my persona."
3. Questionnaire in browser; `localStorage` auto-save for pause/resume. ~30-60 min total.
4. Browser generates `persona.md` from answers (no server call).
5. Browser generates full Claude Skill folder + 4 task sub-skill files.
6. JSZip packages into `way-persona-{slug}.zip`.
7. User downloads ZIP.
8. User reads wizard page; drops ZIP into `~/.claude/skills/`, restarts Claude Code.
9. User invokes: `use my-persona to draft a LinkedIn post about [topic]`.
10. Claude Code loads skill, reads `persona.md` as context, runs LinkedIn drafter sub-skill, outputs in user's voice.

Steps 1-7 are entirely browser-local. Steps 8-10 are entirely on user's machine. Server is touched only if user opts into the waitlist.

### Tech stack (defaults — ADR before v0 build commits)

| Layer | Choice | Why |
|---|---|---|
| Frontend + backend | Next.js 16 (App Router) on Vercel | Repo convention; Anton's fluency |
| Language | TypeScript end-to-end | Type safety |
| Styling | TailwindCSS (or design-system from `/design-shotgun`) | Repo convention; explorable |
| Browser zip | JSZip or `@zip.js/zip.js` | Mature; browser-ready |
| Form state + validation | React Hook Form + Zod | Standard for Next.js |
| Local persistence | Browser `localStorage` (questionnaire resume) | No server needed |
| Email/waitlist storage | Vercel KV (v0); Supabase if features grow | Simplest; revisitable |
| Analytics | Google Analytics + GTM (Anton's choice; v0.5 only) | Free; familiar; standard funnel signal |
| Source control | Monorepo at `projects/way-who-are-you/app/` | Vercel `rootDirectory` = same |

### Key design decisions (cross-referenced to locks)

| Decision | Rationale | Lock |
|---|---|---|
| Persona content stays in browser | Privacy-first brand promise; no PII server liability | L17, §3.3 |
| Claude Skill folder = deliverable | Cross-vendor portable; no SaaS infra needed | L10 |
| Claude Code v0 primary target | Largest founder base + tool execution capability | L3 |
| Notion AI v0.5 second target | Largest knowledge-work base; March 2026 custom-skills launch | L20 |
| No hosted LLM inference | "No API coins" pitch; user pays their own tool | L2 |
| No marketplace in v0 | Saturated space; persona depth is the moat | L13, L19 |
| Open-standard delivery | Cross-platform identity is the brand promise | L20, §3.3 |
| Git-as-backend marketplace (future) | Aligns with Anthropic Feb 2026 native mechanism | L18 |
| Custom web questionnaire (not skill wrap) | Polished 2026 UI is brand differentiator | L15, L21 |
| 4 bundled tasks in v0 | Substantive enough to validate menu; doesn't cannibalize marketplace | L9, L16 |
| Free at v0 + v0.5 | Focus on platform quality; payments deferred | 2026-05-18 |
| Questionnaire engine variant-aware | Multi-axis variants approved direction (BACKLOG); architecture supports without building | L8 + BACKLOG |

---

## §7 — Data & consent

### Data classification

| Class | Examples | Storage | Why |
|---|---|---|---|
| **Persona content** | persona.md (career arc, knowledge, patterns, posture, role dispositions, evidence, private notes) | **Browser only.** No server endpoint accepts it. | §3.3 brand-defining; L17 |
| **Generated artifacts** | Claude Skill folder, ZIP file | **Browser only.** Generated client-side; downloaded by user. | Same as above |
| **Email + opt-in flags** | Waitlist signup; product update preferences | Vercel KV (server-side) | Required for outreach |
| **Stripe customer ID + purchase records** | NOT in v0/v0.5 (paid tier deferred) | Server-side when paid tier launches | Required for billing when monetization begins |
| **Anonymous analytics** | Page views, button clicks, conversion funnel events | Google Analytics + GTM (from v0.5 only) | Marketing-funnel signal; NOT persona content |

### What W.A.Y. NEVER does

> - Train models on user persona content. Ever.
> - Sell or share persona content with third parties. Ever.
> - Use persona content for product analytics (even aggregated). Brand promise: persona content never leaves your browser.
> - LLM-generate or LLM-edit user personas. User is the author (inherited principle from `persona-builder` per L21; §3.3).

### User authorship enforcement

The user is the author. The interview protocol enforces this (inherited from `persona-builder/SKILL.md` design discipline per L21):

> - **Pushback on weak answers** — generic responses ("I love solving hard problems") get rejected with "Give me a specific moment" / "Example from the last 12 months." Up to two rounds per field, then accept + flag for sharpening.
> - **Depth-inflation refusal** — `expert` depth across >3 industries or >2 functional roles gets refused; user must downgrade.
> - **Named-story routing** — sharp observations naming specific people/companies default to a `private_notes` section that gets stripped from any export the user shares.

### Privacy posture by user type

**Anonymous visitor (no email given):**
> Lands on site → runs questionnaire → generates persona zip → downloads → installs → uses persona in Claude Code. W.A.Y. has *no record* this user exists beyond anonymous analytics page-views (v0.5 onward). This is the **default path** — works end-to-end with zero PII exposure.

**Email/waitlist user:**
> Provides email + opt-in flags. Email + flags stored in Vercel KV. **Persona content still never reaches the server.** Deletion via `mailto:` link in v0; minimal account UI at v0.5.

**Future opt-in cloud-backup user (v0.5+ paid feature; not in v0/v0.5 launch):**
> Explicitly opts in to "back up my persona to W.A.Y. cloud for multi-device access." Persona content stored server-side, **encrypted at rest**, accessible only via user-authenticated download. W.A.Y. operations (Anton) has no read access even with cloud backup — encryption keys are user-derived (TBD: passphrase / OAuth / hardware key; ADR candidate).

### Community member persona consent (the §4 open question, resolved)

The 4 Warsaw AI Community personas are MIT-licensed via the community repo — legally permitting any use. But the W.A.Y. brand promise is *member-author-controlled*; using community personas for commercial-product testing without explicit consent is brand-misaligned.

**Working policy for v0:**

> 1. **Anton asks each member individually** before using their persona as a W.A.Y. test input.
> 2. Concrete ask: *"I'd like to use your persona.md as a test input for W.A.Y.'s packaging code — only to verify the code handles diverse persona shapes. I won't store outputs, share them, or use your content for any other purpose. Yes / no?"*
> 3. If any member declines, fallback: (a) Anton's own persona; (b) fictional founder personas Anton authors for testing.
> 4. **No community persona is ingested into W.A.Y. infrastructure.** Tests run only in Anton's local dev environment; community personas never touch the W.A.Y. server, codebase commits, or deployment.

### GDPR compliance posture

> - **v0**: No paid tier; no PII beyond opt-in email. Privacy policy required (simple template). No cookie banner (no GA in v0).
> - **v0.5 public launch**: Same data classes; GA + GTM activated; **cookie banner required** because GA uses cookies; gated on consent before GA loads.
> - **Future paid tier launch**: Full ToS + GDPR DPA + cookie banner + right-to-be-forgotten flow + data export endpoint. Lawyer review before €1k MRR or first enterprise client.

### Retention & deletion

> - **Email/waitlist:** retained until user requests deletion via `mailto:` (or account UI from v0.5). Deletion within 30 days.
> - **Anonymous analytics:** retention per GA defaults (typically 14 months; configurable).
> - **Persona content:** never stored by W.A.Y. (browser-only). User controls retention on their own machine.
> - **Future cloud-backup users (v0.5+ paid):** retention until user revokes opt-in; deletion within 7 days.

---

## §8 — Testing & success criteria

### v0 — testing approach

**Technical testing (Anton-run):**

> - **Unit tests** on the persona-to-skill renderer: input persona JSON → produces valid Claude Skill folder structure; task sub-skills emit correct frontmatter; ZIP integrity check.
> - **Integration tests** using 4 community personas as fixtures (with explicit consent per §7) → run through renderer → verify each ZIP contains expected files in correct shape.
> - **Manual install test** — Anton runs full flow: questionnaire → zip → drop into `~/.claude/skills/` → restart Claude Code → invoke task → verify voice-recognizable output.
> - **Cross-browser questionnaire test** — Chrome, Safari, Firefox, Edge (latest).

**Feedback collection from private-test cohort:**

> - 5-10 founders from Anton's network agree to test (pre-onboarded individually).
> - Anton onboards each personally (~30 min call or async).
> - Each tester reports: did the LinkedIn drafter output sound like them? Would they post it as-is, edit, or scrap it?
> - Feedback channel: `mailto:` link or Notion form (no formal infra in v0).

**Success criteria for v0 (FIRM per §2.1):**

> - 10+ persona creations (+ 4 community personas as synthetic).
> - 5+ Claude Code installs completing full flow.
> - 3+ "this sounds like me" testimonials.
> - Zero PII breach (privacy-by-absence enforced).
> - Architecture validated end-to-end.

### v0.5 — testing approach

**Technical testing:**

> - All v0 tests carry forward.
> - Notion AI install path tested with at least 3 personas.
> - Waitlist signup flow tested.
> - GA + GTM loading verified; cookie banner gating verified.

**Feedback collection from public users:**

> - In-product feedback widget (Notion form embedded or Cal.com link).
> - Waitlist as conversion-readiness signal.
> - LinkedIn / Hacker News comment threads on launch posts as qualitative signal.
> - Optional 1-question NPS / "would you recommend" survey.

**Success criteria for v0.5 (DIRECTIONAL per §2.2):**

> See §2.2 metrics.

### v1 — testing approach (sketch)

> - Marketplace skill installation + version tracking + auto-update tested end-to-end.
> - Workflow/preferences layer (L11) validated with 10+ existing v0/v0.5 users.
> - Track 2 consulting intake flow tested (booking → consult → custom persona delivery).
> - Multi-role expansion: at least one second role shipped + tested.

### Continuous testing (all releases)

> - **Privacy invariant audit (CI gate, set up at v0).** Lint or routing-table check on every PR confirms no `POST /api/persona-content` (or similar) endpoint appears. The brand-defining non-goal becomes a CI gate.
> - **Cross-platform sanity** — per platform compatibility research; each supported install target tested with a fresh persona on each release.
> - **Persona-quality regression check** — every release, Anton's own persona is re-installed; LinkedIn drafter output is compared to previous release's output on the same prompt. Significant voice drift is flagged for investigation.

### Definition of "done" per release

> **v0 done when:**
> - All 4 task sub-skills produce voice-recognizable output on Anton's persona.
> - 5+ private-testers complete install + use without Anton-side hand-holding.
> - 3+ "sounds like me" testimonials secured.
> - Privacy invariant verified (no persona-content endpoint exists).
>
> **v0.5 done when:**
> - Public launch post live.
> - Notion AI wizard polished + verified working.
> - Cookie banner deployed; GA loading gated on consent.
> - 50+ persona creations within 30 days of launch.
>
> **v1 done when:**
> - Marketplace S2 live with 3+ first-party skills.
> - L11 workflow/preferences layer shipped.
> - At least one second role beyond founder.
> - Track 2 (consulting) launched.

---

## §9 — Risks & open questions

### Technical risks

| Risk | Mitigation | Severity |
|---|---|---|
| Claude Skills standard changes break compatibility | Multi-vendor adoption (OpenAI, Notion) reduces single-vendor risk; track standard changes; ADR for any breaking response | M |
| Browser zip generation fails for edge-case persona sizes | JSZip handles MB-scale; persona files are <100KB; unit-tested | L |
| Multi-platform compatibility surprises | [Platform compatibility research](research/2026-05-18-platform-compatibility-matrix.md) surfaces these per release | M |
| Persona quality regresses invisibly between releases | Persona-quality regression check (§8) — same prompt, diff outputs, flag drift | L |

### Strategic risks

| Risk | Mitigation | Severity |
|---|---|---|
| **Anthropic / OpenAI ships native "persona as skill"** | W.A.Y. = end-to-end, guided, expert-authored service with custom-built knowledge. Founders want pre-built, expert-delivered solutions, not DIY tools. **Fallback positioning:** if platform competition becomes existential, W.A.Y. pivots to **consulting-led with W.A.Y. as the internal tool** (Track 2 becomes the company). Moat: questionnaire depth + 4-axis variants (BACKLOG) + brand + Anton-as-expert. | H |
| **Claude Pro pricing changes break user base** *(Anton: biggest risk)* | Open standard (L20) lets users migrate to Codex CLI / Notion AI / ChatGPT / future tools when Anthropic changes terms. **Watch item — Apple MLX + on-device LLM development:** if local LLM quality matches Claude Pro through 2026 / early 2027, W.A.Y.'s "your laptop, no platform dependency" positioning gets *stronger*. Quarterly check on this trend. | H |
| Skill marketplace saturation drowns "persona layer" message | Don't compete on marketplace; position as identity foundation (L19). Multi-axis questionnaire variants (BACKLOG) become the depth-of-product moat. | M |
| Founder-cohort organic acquisition fails | Network + Warsaw AI Community + LinkedIn/HN/Twitter is v0/v0.5 path; paid acquisition deferred to v1+ | M |
| Solo founder = single point of failure | v1+ hiring tied to revenue trigger; Track 2 consulting business doesn't require team scale | M |
| Competitive landscape unknown | [Competitor research scaffold](research/2026-05-18-competitive-landscape.md); quarterly refresh | M |

### Market risks

| Risk | Mitigation | Severity |
|---|---|---|
| "Persona layer" isn't a category founders pay for | Free at v0/v0.5; waitlist depth = pricing-readiness signal | M |
| AI personalization not valuable enough to drive purchase | v0 testimonials are smoke test | M |
| "Clone yourself" framing oversells | v0 demo honest; marketing positions as "voice + judgment" not "AI replacement" | M |
| Privacy-first positioning doesn't differentiate enough | Brand-defining non-goals defend; on-device-LLM trend reinforces | L |

### Compliance risks

| Risk | Mitigation | Severity |
|---|---|---|
| GDPR violations | Privacy policy at v0; cookie banner at v0.5; client-side persona = low PII surface | L |
| Trademark conflict on "W.A.Y." | Cheap pre-launch check via WIPO/USPTO/EUIPO before v0.5 | L |
| Open-standard adoption uneven across platforms | Platform research tracks; v0 stays Claude-Code-primary if others drift | M |

### Watch items (separate from risks)

> - **Apple MLX + on-device LLM trajectory** — quarterly check. If on-device quality matches Claude Pro, W.A.Y. positioning gets stronger AND the "Claude Pro pricing" risk severity drops. Updates feed back into §1 (Why now) and §9 (Risks).
> - **Competitive landscape evolution** — quarterly research refresh; new entrants in 2026 are inevitable; staying current directly shapes §1, §9, and marketing copy.

### Open questions (decisions needed later)

| Question | When to decide | Decision type |
|---|---|---|
| Today's competitive landscape | Dedicated research session ASAP | Research file (scaffolded); refresh quarterly |
| Apple MLX / on-device LLM trajectory check | Quarterly | Watch-item update |
| Pricing for paid tier (€X/mo, per-skill SKUs) | When paid tier launches (future) | ADR + experiment |
| Commercial entity (sp. z o.o. / Estonian e-res / other) | Concurrent with paid tier launch | ADR |
| Multi-sector/industry/position/depth questionnaire variants | Dedicated brainstorm post-v0 (BACKLOG, approved direction; no timing commitment) | New brainstorm + spec section |
| Polish-language version timeline | Post-v0.5 (PL founder demand signal?) | BACKLOG candidate |
| Marketplace producer-side economics | S2 brainstorm pre-v1 | ADR + spec section |
| Track 2 consulting pricing/packaging | Pre-v1 launch | ADR + spec section |
| Persona update / re-onboarding flow | Pre-v1 (L11 workflow layer changes how persona evolves) | ADR + design doc |
| Cross-platform wizard priority order beyond Notion AI | After platform research completes | BACKLOG / spec update |
| Cookie consent integration choice | At v0.5 GA-enable | Implementation |
| Encryption-key model for v0.5+ cloud backup | Pre-cloud-backup ship | ADR |

### Known unknowns (we know we don't know)

> - **How long the polished v0 questionnaire UX actually takes to build.** Estimate 4-6 weeks; could be 3 (aggressive) or 8+ (with polish iterations). Calibrate after 2 weeks of build.
> - **Whether 5+ founders in Anton's network actually agree to test v0.** Pre-onboarding required.
> - **Voice-fidelity threshold founders accept.** Is 70 % "sounds like me" enough? 90 %?
> - **What v0 users say about the demo-task choice (LinkedIn).** Drives v0.5+ prioritization.
> - **Whether the multi-axis questionnaire direction lands as a v0.5 add or v1 add.** Depends on v0 signal.

---

## §10 — Decisions log

### Existing relevant ADRs (Warsaw AI Community)

| ADR | Title | W.A.Y. relevance |
|---|---|---|
| **[ADR-0001](../../docs/decisions/0001-oss-first-licensing.md)** | OSS-first licensing | Community-side stance. W.A.Y. is a *separate IP stream* — closed-source product code. ADR-0001 binds the `persona-builder` skill, NOT W.A.Y.'s product. |
| **[ADR-0004](../../docs/decisions/0004-commercial-track-accelerated.md)** | Commercial-track accelerated | W.A.Y. is exactly the kind of commercial track this ADR anticipates. "No commercial entity yet" caveat applies — W.A.Y. defers entity until paid-tier launch (per 2026-05-18). |
| **[ADR-0006](../../docs/decisions/0006-secret-handling-and-rotation.md)** | Secret handling and rotation | Applies — W.A.Y. inherits the repo-wide secret hygiene policy. |

### Spec-internal decisions (locks; documented inline, no ADR required)

The 22 architecture locks (L1-L22 + 2026-05-18 refinements) live in this spec (see §0 lock list and §6 key design decisions). Recorded by-reference here.

### ADR candidates for W.A.Y. (sequence continues from 0015)

> Each item below becomes an `NNNN-...-md` file in `docs/decisions/` when triggered. The `adr-writer` skill handles numbering and supersession-linking.

| Candidate | Trigger | Priority |
|---|---|---|
| **W.A.Y. tech stack lock** (Next.js + Vercel + TypeScript + Tailwind + JSZip + Vercel KV) | Before v0 build commits start | **High — gates v0** |
| **W.A.Y. license posture** (closed-source product; persona-builder stays MIT) | Before v0 ships to founder testers | **High** |
| **W.A.Y. ↔ Warsaw AI Community relationship** (sibling project; no revenue back; private commercial venture) | Pre-v0 (avoids confusion in public references) | Med |
| **W.A.Y. persona schema decision** (extends persona-builder, doesn't fork) | Pre-v0 build start | Med |
| **Privacy invariant CI-gate implementation** (route audit method) | Pre-v0 ship | Med |
| **Domain name + trademark check decision** | Pre-v0.5 public launch | Med |
| **Cookie consent integration choice** | Pre-v0.5 (GA enable trigger) | Med |
| **Commercial entity choice** | When monetization trigger fires | Deferred |
| **Multi-axis questionnaire architecture** | When dedicated brainstorm fires (BACKLOG; no commitment) | Deferred |
| **Marketplace producer economics** | S2 brainstorm pre-v1 | Deferred |
| **Encryption-key model for v0.5+ cloud backup** | Pre-cloud-backup ship | Deferred |
| **Persona update / re-onboarding flow** | Pre-v1 (paired with L11 workflow layer) | Deferred |

### Rule of thumb — when to write an ADR vs. update the spec

> - **Update spec, no ADR**: spec-internal locks, scope refinements, metric calibration, BACKLOG additions, research-file expansions.
> - **Write an ADR**: any decision with *reversibility cost* — tech stack choice (replatforming is expensive), licensing (commits IP), entity (legal/tax implications), schema (breaks installed users), pricing model (re-trains user expectations), marketplace economics (sets ecosystem precedent).
>
> The check: if future-Anton (or a future contributor) would ask *"why did we choose this and not the alternative?"* and need a dated, reasoned answer to do their job — that's an ADR. If the answer is *"we just liked it better and it's easy to change"* — that's a spec note.

### Decision-log discipline going forward

> 1. **Spec-internal decisions** (L1-L22, future locks) — recorded inline in this `spec.md`; cross-referenced here.
> 2. **ADRs** — written via `adr-writer` skill; numbered sequentially from **0015** (next available as of 2026-05-18).
> 3. **Supersession** — when one ADR supersedes another, bidirectional links per project [`CLAUDE.md`](CLAUDE.md).
> 4. **BACKLOG → ADR promotion** — when a BACKLOG idea matures into a decision, a dedicated brainstorm session triggers the ADR.

---

## Spec changelog

| Date | Change | Trigger |
|---|---|---|
| 2026-05-17 | Spec scaffolded (template) | `project-scaffold` skill on chat-1 |
| 2026-05-18 | All 10 sections drafted + §0 added + 22 locks consolidated | `superpowers:brainstorming` on chat-3 (Q1-Q9 + meta) |
| 2026-05-18 | "No payments yet" refinement applied across §2.2, §3.1, §5 | Anton mid-brainstorm direction |
| 2026-05-18 | Multi-axis questionnaire approved as direction (BACKLOG) | Anton during §8 review |
| 2026-05-18 | Competitor landscape research + platform compatibility matrix scaffolded | Anton during §9 review |
