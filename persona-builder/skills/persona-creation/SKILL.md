---
name: persona-creation
description: >-
  Use when a community member wants to create, draft, write, update, redo,
  revise, fill out, or resume their structured persona profile for a peer
  business-idea evaluation community (IT operators, founders, experts
  evaluating ideas together). Triggers on English phrases like "help me
  create my persona", "run the persona skill", "I want to join the
  community persona database", "create a persona MD for me",
  "build my community persona", "start my persona", "onboard me into the
  persona database", "write up my persona", "fill out my community
  profile", "I have my partial draft, let's continue". Also triggers
  when the member writes in Ukrainian or asks for a bilingual
  (English + Ukrainian) persona; sample Ukrainian triggers: "зроби мою
  персону", "допоможи створити персону", "створи мою персону",
  "давай зробимо мою персону".
---

# Persona Creation

## Overview

Interview the community member and produce a structured persona for a peer-evaluation community of IT-industry operators, founders, and experts. The persona feeds two downstream consumers: (1) the human community (which sees a peer-visible version) and (2) an evaluation-drafting assistant (which reads the full version to ghostwrite evaluation drafts in the member's voice).

Target interview time: 45–60 minutes. The member may pause and resume at any point.

## Deliverables (produce both, every time)

On completion, produce two Markdown files:

1. `persona-{persona_id}.md` — full persona including `## Private notes`. Source of truth. Sent to the community admin. Read by the evaluation-drafting pipeline.
2. `persona-{persona_id}.public.md` — identical to (1) with the entire `## Private notes` section (heading and body) removed. Rendered in the community-visible persona view.

Produce both files. Both. Every time. The member sends both back to the community admin.

`.public.md` is derived by stripping from `.md` — do not reword or regenerate its content.

### Delivery rules (match the environment you are running in)

- **With filesystem tools available** (e.g., Claude Code, an agent harness with Write access): write both files directly — either to the working directory, to a path the member specifies, or to `./personas/` if that directory exists. Tell the member the full paths.
- **In stateless chat environments** (Claude.ai, Cursor, plain chat): render each file inline as a fenced Markdown code block with the filename as the block label, clearly delimited. Tell the member to copy each block into a file of the stated name before sending them to the admin.

Do not compress, summarize, truncate, or replace content with "…" in either file.

## Language support (English, Ukrainian, or both)

Conduct the interview in **English**, **Ukrainian**, or **both in parallel**. Detect or ask before the opening message:

- Clear Cyrillic / Ukrainian in the trigger message → Ukrainian interview.
- Clear English → English interview.
- Mixed or ambiguous → ask in both languages: "English, Ukrainian, or both (both = each narrative field written in both)? / Англійською, українською, чи обома (обома = кожне розгорнуте поле обома мовами)?"

Record the choice as `languages` in the output frontmatter: `[en]`, `[uk]`, or `[en, uk]`.

### Localize into the chosen language

Translate: the opening message, every interview question, every pushback phrase, the confirmation summary, and all narrative-field answers. Preserve **pushback strength** — "Give me a specific moment" must land with the same edge in Ukrainian. Do not soften in translation.

### Keep English (never translate)

- YAML field names (`persona_id`, `display_name`, `languages`, `schema_version`, …).
- Section and subsection headings in the output file (`## Tags`, `### Industries`, `### Buyer contexts`, `## Private notes`, …).
- Tag slugs from the controlled vocabularies (`fintech-payments`, `founder-ceo`, `seed`, …).
- Depth values (`familiar`, `practitioner`, `expert`).
- Evidence confidence flags (`verified`, `self-reported`).
- ISO dates (`YYYY-MM-DD`).
- Filenames (`persona-{persona_id}.md` / `.public.md` / `.partial.md`).

Keeping these English ensures files stay machine-parseable for downstream tooling regardless of interview language.

### Ukrainian → English slug mapping

When the member describes a vocab item in Ukrainian (e.g., `фінтех`, `засновник-CEO`, `посівна стадія`), map to the closest English slug and confirm before storing: "I'll map that to `fintech-payments` — ok? / Я занесу це як `fintech-payments` — підходить?". Store only the English slug.

### Bilingual rendering (`languages: [en, uk]`)

Every narrative field renders as two labelled blocks, each independently meeting its length constraint:

```
### One-line bio
**EN:** [English bio, ≤ 200 chars]
**UK:** [Ukrainian bio, ≤ 200 chars]
```

Apply to every narrative field (bio, career arc, domains, recurring patterns, bullish, skeptical, each pattern entry, typical first question, all three role-disposition blocks, private notes). Controlled-vocab tags appear once — always English slug. `niche_expertise` free-text follows the member's preference: offer both-language variants but do not force them.

Never machine-translate the member's answers without consent — it silently loses voice. If only one language is filled, ask them to write the other themselves, or mark the missing side `[to translate]` and raise it at the final summary.

## Opening message (say this before any questions)

Before asking anything, tell the member:

> This interview takes 45–60 minutes. You can save progress and come back at any point — just say "pause, I'll come back."
>
> This persona will be visible to the rest of the community. Write what you'd defend in a room with them. For the sharpest observations — specific failure stories, unflattering patterns you've seen — use the `private_notes` section. That section is stripped before publication and only the evaluation system sees it.
>
> The value of this persona is specificity. Generic LinkedIn-speak produces a useless profile. I will push back when answers are too vague — that is the job.

Then start Section 1.

## Non-negotiable behaviors

These three behaviors are enforced throughout the interview. Do not soften them.

### 1. Push back on weak answers

When the member writes generic copy ("I'm passionate about building great products", "I love solving hard problems", "I care about users"), reject it and ask for a concrete follow-up:

- "Tell me a specific moment where that belief was tested."
- "Give me an example from the last 12 months."
- "What did you actually do differently because of this?"

Do not accept the original. The value of this skill is the specificity it extracts.

**Pushback cap:** push back up to **two** rounds per field. If the member still gives a vague answer after the second round, accept it but mark the field `[needs sharpening before publication]` in your internal notes and raise it again in the end-of-interview summary.

### 2. Refuse inflated depth claims

If the member claims `expert` depth across more than 3 industries, or across more than 2 functional roles, push back:

> That's a broad claim. In which of these would you be comfortable being the sharpest person in a room of 10 peers? Keep `expert` only for those — mark the rest as `practitioner` or `familiar`.

Depth inflation kills downstream selection quality. Tag fewer items at honest depth rather than many at inflated depth.

### 3. Respect the visibility contract

Two audiences: the community (reads `.public.md`) and the evaluation-drafting system (reads `.md`). If the member shares a sharp, named, or unflattering observation during the interview, ask whether it belongs in the main body or in `private_notes`. Default to `private_notes` for:

- Named stories about specific people or companies.
- Unflattering patterns about identifiable groups.
- Strong opinions the member would not say in a room with peers.

## Interview flow

Walk the member through the sections in order:

1. Identity & metadata
2. Tags (depth required on every tag)
3. Background narrative
4. Evaluation posture
5. Role dispositions (at least one of the three must be filled in)
6. Verifiable evidence (optional)
7. Private notes (optional)

At the end, show a summary of every input, ask the member to confirm, then produce both files.

If the member says "pause, I'll come back" at any point, save a partial draft they can resume — see the Pause and resume section below.

## Section 1 — Identity & metadata

**Purpose:** Establish who maintains this persona and the filename slug used across the system. The `maintained_by` field reinforces that the persona is endorsed, not simulated.

**Fields (all required):**

- `persona_id` — slug of the form `firstname-lastinitial` (e.g., `jane-d`). Used as the filename.
- `display_name` — how the member wants to be referenced.
- `schema_version` — emit `1.0`.
- `created_at` — today's ISO date.
- `last_updated` — today's ISO date (same as `created_at` on first run).
- `maintained_by` — the member themselves.

**Ask:**

- "What name should appear on your persona? This goes in `display_name`."
- "What's your first name and last initial? I'll use them to build your `persona_id` slug (e.g., Jane D. → `jane-d`)."
- Confirm `maintained_by` matches `display_name`.

**Slug rules (for `persona_id`):**

- Lowercase ASCII only. Replace spaces with hyphens. Strip accents, apostrophes, and punctuation (e.g., `Zoë O'Brien` → `zoe-o`).
- If the member says the admin already uses that slug (or suspects a collision), fall back in order: `firstname-lastname` full (e.g., `jane-doe`), then a numeric suffix (`jane-d-2`). Ask the member which to use.

**`created_at` vs `last_updated`:** on a first-run interview, both are today's ISO date (`YYYY-MM-DD`). On a resume-across-sessions interview, keep `created_at` as the original start date and set `last_updated` to the date the interview finishes.

**Good:** `display_name: Jane D.`, `persona_id: jane-d`, `maintained_by: Jane D.`

**Weak:** `display_name: The AI Guy`. Why it fails: no real identity signal the community can attribute. Ask for a first name + last initial format.

## Section 2 — Tags (controlled vocabularies)

**Purpose:** Machine-readable metadata for downstream evaluator-selection. Every tag must carry a depth value.

**Depth values (required on every tag):**

- `familiar` — I can hold a conversation, I've seen it from nearby.
- `practitioner` — I've done it hands-on for months-to-years.
- `expert` — sharpest person in a room of 10 peers.

**Depth-calibration rule:** Tag fewer items at honest depth than many at inflated depth. Apply the inflation-refusal behavior above whenever the member over-claims.

### 2a. Industries — required, 1 to 5 tags (from a vocabulary of 34)

Present this vocabulary at the start of the section — do not wait to be asked:

- **Software & infra:** `b2b-saas`, `devtools`, `dev-infra-cloud`, `data-analytics-ml`, `ai-ml-applications`, `cybersecurity`, `no-code-low-code`
- **Consumer:** `consumer-social`, `consumer-subscription`, `creator-economy`, `gaming`, `media-entertainment`, `consumer-mobile-apps`
- **Commerce & marketplaces:** `ecommerce-dtc`, `b2b-marketplaces`, `consumer-marketplaces`, `vertical-saas`
- **Financial:** `fintech-payments`, `fintech-lending-credit`, `fintech-wealth-trading`, `insurtech`, `crypto-web3`, `financial-services-traditional`
- **Physical & regulated:** `healthtech`, `biotech-pharma`, `climate-energy`, `mobility-transport`, `real-estate-proptech`, `manufacturing-supply-chain`, `agtech-food`
- **Work & services:** `hr-future-of-work`, `legaltech`, `edtech`, `govtech-defense`

**Ask:** "Which industries have you worked in deeply enough to have a point of view? Pick 1–5 from the list above and assign a depth to each."

**Good:** `fintech-payments — expert`, `b2b-saas — practitioner`. Two tags, honest depth.

**Weak:** `fintech-payments — expert`, `healthtech — expert`, `cybersecurity — expert`, `ai-ml-applications — expert`, `b2b-saas — expert`. Five experts. Refuse: ask which one or two the member would actually be sharpest in, downgrade the rest.

### 2b. Functional roles — required, 1 to 3 tags (from a vocabulary of 21)

Present this vocabulary at the start of the section:

- **Founding & leadership:** `founder-ceo`, `founder-cto`, `founder-non-technical`, `operator-executive`, `chief-commercial-officer`
- **Product & design:** `product-manager`, `product-designer`, `user-researcher`, `program-manager`
- **Engineering & data:** `software-engineer`, `engineering-manager`, `data-scientist-ml-engineer`
- **Go-to-market:** `sales-enterprise-b2b`, `sales-smb-plg`, `business-development-partnerships`, `marketing-growth`, `marketing-brand-social`, `customer-success`
- **Capital & advice:** `investor-vc`, `angel-advisor`
- **Specialists:** `domain-expert`

**Ask:** "Which functional roles have you actually held (not admired from afar)? Pick 1–3 with depth."

**Disambiguation rule:** If the member picks `program-manager`, prompt them to add a `niche_expertise` tag clarifying the flavor (`tpm`, `product-program`, `strategic-initiatives`, etc.) — the term is ambiguous otherwise.

### 2c. Company stages — required, 1 to 3 tags (from a vocabulary of 5)

Vocabulary: `pre-seed`, `seed`, `series-a`, `growth`, `public-enterprise`.

**Ask:** "At which company stages have you operated? Pick 1–3 with depth."

**Good:** `seed — expert`, `series-a — practitioner`. Two stages, honest progression.

**Weak:** all five stages at `expert`. Refuse.

### 2d. Niche expertise — optional, up to 5 free-text tags

**Purpose:** Escape hatch for expertise the controlled vocab doesn't capture.

**Ask:** "Is there specific expertise the controlled vocab didn't capture? Up to 5 free-text tags."

**Good:** `PSD2 compliance`, `embedded finance for non-banks`, `GTM for regulated-industry buyers`.

**Weak:** `innovation`, `strategy`, `leadership`. Why it fails: no signal. Ask for a sharper phrasing or drop.

## Section 3 — Background narrative

**Purpose:** The drafting prior. The evaluation assistant reads this when ghostwriting drafts in the member's voice. It must be specific enough to draft from.

**Fields (all required):**

- `one_line_bio` — ≤ 200 characters. Elevator pitch.
- `career_arc` — ~200 words. 3–5 career moments that shaped how this person thinks. Moments, not titles. Not a CV.
- `domains_of_hard_won_knowledge` — ~200 words. What the member knows that most people in their field don't. The asymmetric-information section. **Push hard for specificity.**
- `recurring_patterns_i_see` — ~200 words. Mental models, heuristics, "things I always notice when I look at X." The evaluation leverage lives here.

**Ask (one question per field):**

- "Write a one-line bio (≤ 200 chars). What do you do and for whom?"
- "Give me 3–5 career moments — not titles, moments — that shaped how you think. Keep it ~200 words."
- "What do you know that most people in your field don't? The sharper, the better. ~200 words."
- "What patterns do you reliably notice when you look at ideas or companies? Mental models, heuristics. ~200 words."

**Good (`domains_of_hard_won_knowledge`):**

> Most fintech founders underestimate how much of the product budget gets absorbed by card-scheme compliance once you pass the first million transactions. I've been on three teams that hit this wall; two rewrote their authorization stack. I can spot it in a pitch deck from the unit economics slide.

**Weak (`domains_of_hard_won_knowledge`):**

> I'm deeply passionate about fintech and have a lot of experience helping teams build great products customers love.

Why it fails: zero specificity, no asymmetric knowledge, no artefact the evaluation system can draft from. Reject and ask for a concrete moment.

## Section 4 — Evaluation posture

**Purpose:** Directly feeds the evaluation drafting pipeline.

**Fields (all required):**

- `what_makes_me_bullish` — ~100 words. What gets this member excited about an idea.
- `what_makes_me_skeptical` — ~100 words. Reflexive objections. **Critical — this is what prevents the "polite LLM" failure mode in drafts.**
- `patterns_of_failure_ive_seen_recur` — exactly 3 entries. Each is a pattern, not a named company or founder.
- `patterns_of_success_ive_seen_recur` — exactly 3 entries. Same format.
- `my_typical_first_question` — ≤ 150 characters. The one question this member always asks when someone pitches them.

**Pattern-entry refusal rule:** If a pattern entry names a specific company, product, or founder ("Fred at Acme Corp", "what happened at Stripe in 2019"), reject it and ask for the generalized version. "Founders with no domain experience underestimating regulated-industry sales cycles" is a pattern. "Fred at Acme Corp" is not.

**Ask:**

- "What gets you bullish on an idea? ~100 words."
- "What makes you reflexively skeptical? Be honest — the drafts need this to avoid polite-LLM mush. ~100 words."
- "Give me 3 patterns of failure you've seen recur. Patterns, not named people or companies."
- "Give me 3 patterns of success you've seen recur. Same format."
- "What's the one question you always ask when someone pitches you? ≤ 150 chars."

**Good (`my_typical_first_question`):** `Who pays, and how angry are they about the alternative?`

**Weak:** `What's your vision?`. No signal. Push for the member's actual reflexive first question.

## Section 5 — Role dispositions

**Purpose:** When the evaluation system assigns evaluators to an idea, it matches ideas to members acting in a given role (buyer, builder, competitor/substitute). A missing role disposition means the member is not auto-selected for that role.

**Fields (at least one required):**

- `buyer_contexts` — when this member acts as a buyer. Budget size, decision-making authority, what they've actually bought recently.
- `builder_contexts` — when this member acts as a builder. What they've built, at what scale, in what stack or domain.
- `competitor_substitute_contexts` — substitutes the member currently uses in the product categories the community evaluates.

**Actively prompt for competitor/substitute.** Members skip it because it feels negative. Ask explicitly: "What do you currently use in the categories this community will evaluate? Anything — including 'a spreadsheet' or 'nothing, we live with the pain'."

**Ask:**

- "As a buyer — what do you have authority to buy, at what budget, and what have you actually bought in the last 12 months? If this role doesn't apply, say so."
- "As a builder — what have you built, at what scale, in what stack or domain? If not, say so."
- "As a competitor/substitute user — what products or workarounds do you currently use in the categories this community will evaluate?"

**Good (`buyer_contexts`):**

> €50–€200k/yr SaaS purchases for a 40-person fintech. Final decision on infra and dev-tooling spend. Last 12 months: bought Datadog, migrated off New Relic, trialled and rejected three feature-flag vendors on pricing.

**Weak:** `I sometimes buy things.` No budget, no authority, no recency. Reject.

## Section 6 — Verifiable evidence (optional)

**Purpose:** Trust signals. The member pastes or links LinkedIn URLs, notable projects, public writing, talks.

**Confidence flag (used only in this section — do not apply elsewhere):**

- `verified` — externally checkable (public URL, verifiable employment record, published work).
- `self-reported` — everything else.

**Ask:** "Paste or link any evidence you want peers to see: LinkedIn, notable projects, public writing, talks. Mark each as `verified` (externally checkable) or `self-reported`."

**Good:** `https://linkedin.com/in/jane-d — verified`, `Talk at FinTech Summit 2024 (video link) — verified`, `Internal memo on PSD2 migration — self-reported`.

**Weak:** `LinkedIn` (no URL), `various talks` (no proof). Push for links or drop.

## Private notes (optional, stripped from `.public.md`)

**Purpose:** Sharp, specific observations that inform evaluation drafting but should not be visible to peers. Named stories, unflattering patterns, strong opinions.

**Ask:** "Anything you'd say to a trusted colleague but not in a room with peers? Named stories, unflattering patterns, strong opinions? This section is stripped from the peer-visible file — only the evaluation drafting system sees it."

**Good:**

> Watched an ex-colleague raise a Series A on a pitch I'd reject in 30 seconds — the metric they sold on was an accounting artefact. I always ask for the raw event log now, not the dashboard number.

**Weak:**

> Some people exaggerate metrics sometimes.

Why it fails: generic; no drafting leverage. Push for a specific moment the member actually saw.

## Output file format

Produce both files as valid Markdown with a YAML frontmatter block at the top. Use this structure exactly. Do not rename fields, merge sections, or add decorative prose.

```markdown
---
persona_id: jane-d
display_name: Jane D.
languages: [en]
schema_version: 1.0
created_at: 2026-04-24
last_updated: 2026-04-24
maintained_by: Jane D.
---

# Jane D.

## Tags

### Industries
- fintech-payments — expert
- b2b-saas — practitioner

### Functional roles
- founder-ceo — expert
- sales-enterprise-b2b — practitioner

### Company stages
- seed — expert
- series-a — practitioner

### Niche expertise
- PSD2 compliance, embedded finance for non-banks

## Background

### One-line bio
[one-line bio, ≤ 200 chars]

### Career arc
[~200 words]

### Domains of hard-won knowledge
[~200 words]

### Recurring patterns I see
[~200 words]

## Evaluation posture

### What makes me bullish
[~100 words]

### What makes me skeptical
[~100 words]

### Patterns of failure I've seen recur
1. [pattern 1]
2. [pattern 2]
3. [pattern 3]

### Patterns of success I've seen recur
1. [pattern 1]
2. [pattern 2]
3. [pattern 3]

### My typical first question
[≤ 150 chars]

## Role dispositions

### Buyer contexts
[or: (not applicable)]

### Builder contexts
[or: (not applicable)]

### Competitor / substitute contexts
[or: (not applicable)]

## Verifiable evidence
- [item] — verified
- [item] — self-reported

## Private notes
[free-form — STRIPPED from the .public.md file]
```

### Deriving `.public.md` from `.md`

The `.public.md` file is byte-identical to `.md` **except**: remove the entire `## Private notes` heading and its body, up to the next heading or end of file. Just strip.

Do not:

- Regenerate, paraphrase, or summarize the stripped content.
- Leave a stub like `## Private notes\n(none)`, `## Private notes\n(stripped)`, or `## Private notes\n[redacted]`.
- Leave the `## Private notes` heading in place with an empty body.
- Add a comment, HTML comment, or any trace that private notes existed.

If the original `.md` had no private notes at all (the member skipped the section), the stripping is a no-op — the two files are identical. That is the correct outcome.

## End-of-interview confirmation

Before producing the files:

1. Show a compact summary of every field the member provided.
2. Flag any weak answers that slipped through — give the member one last chance to sharpen them.
3. Ask: "Ready to produce both files? (yes / no)"
4. On `yes`, produce `persona-{persona_id}.md` and `persona-{persona_id}.public.md`.
5. Tell the member where the files were saved and instruct them to send both to the community admin, who will file them in the community's `personas/` directory.

## Pause and resume

If the member says "pause, I'll come back" (or equivalent) at any point:

1. Produce a partial draft capturing every field completed so far, using the same frontmatter and section headings as the final file, with unfilled fields marked `[pending]`.
2. Add an HTML comment at the top of the partial draft: `<!-- partial draft — resume at: {section name} -->`.
3. **With filesystem tools:** save the draft to `persona-{persona_id}.partial.md` and tell the member the path.
4. **In stateless chat:** render the partial draft as a fenced Markdown code block and instruct the member to save it locally and paste it back as their first message next session to resume.
5. Stop the interview. Do not produce final files from a partial draft.

When the member returns and pastes (or loads) a partial draft, read the resume-at hint from the HTML comment and continue from that section. Do not restart unless they ask.

## Common rationalizations to refuse

You (the skill) will be tempted to cut corners when the member is tired, polite, or in a hurry. Do not. Here are the specific shortcuts to refuse, and why:

| Rationalization | Reality |
|---|---|
| "The member already answered something similar — I'll reuse it." | Each field has its own prompt for a reason. Ask every field explicitly. |
| "This field is optional, I'll skip it silently." | Ask every optional field at least once. The member can decline; you do not decline for them. |
| "The answer is weak but the member seems frustrated." | Push back at least once. Cap at two rounds, then tag `[needs sharpening before publication]`. |
| "I'll infer depth from context." | Depth is never inferred. Ask the member to self-assign it for every tag. |
| "They claimed expert on five industries but they sound competent." | Refuse inflated depth regardless of how competent they sound. The constraint is peer-room sharpness, not competence. |
| "The private-notes story is also fine in the public body." | If the content names a specific person or company, it defaults to `private_notes`. Only move it to the public body if the member explicitly confirms after being told the visibility consequence. |
| "Producing one file is fine, they can strip the other themselves." | Produce both files. Both. Every time. |

## Scope guardrails

This skill produces persona files only. It does not:

- Evaluate ideas.
- Select evaluators.
- Aggregate personas.
- Emit anything other than the two Markdown files (plus an optional `.partial.md` during pause/resume).

Those are the job of sibling skills (`persona-evaluation`, `persona-update`) added in future passes.
