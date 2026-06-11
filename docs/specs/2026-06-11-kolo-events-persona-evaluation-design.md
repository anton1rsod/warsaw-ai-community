# Kolo Events persona-panel evaluation — design (one-off run)

**Date:** 2026-06-11 · **Status:** approved-pending-spec-review · **Owner:** Anton (DRI)
**Scope:** one evaluation run connecting persona-builder personas to Maksym's `validate-idea` skill. Reusable `persona-evaluation` skill extraction is **out of scope** (backlog; extract from what works here).

## 1. Context

- persona-builder has 6 member-authored personas (`personas/`): anton-safronov, dmitry-b, heorhii-k, maksym-pavlenko, mark-spasonov, nazar-k. The README promised a future `persona-evaluation` capability; `ideas/` and `evaluations/` dirs are pre-scaffolded and empty.
- Maksym's `validate-idea` skill (community-contributed, currently at `~/Downloads/validate-idea/`) is evidence machinery: falsifiable brief → triage gate → 9-dimension fan-out web research → evidence hierarchy (1–7) → 5-question red-team → script-enforced scorecard (`scorecard.py`; GO ≥20/25, PIVOT 15–19, KILL <15) → field-validation plan. Core rule: no link = no evidence = no score.
- The idea under evaluation: **Kolo Events** (founders Ivan + Marat) — free events/clubs platform for Warsaw, RU/UA/EN, PWA live, monetization planned (5–10% ticket commission, User Pro €3–7/mo, Creator Pro €10–20/mo). Concept doc: `persona-builder/ideas/kolo-events/concept.md` (copied in from the founders' doc).
- Division of labor: **validate-idea produces the shared evidence base; personas produce attributed expert judgment on top of it.** Facts frozen, judgment free.

## 2. Decisions log (Anton, 2026-06-11)

| # | Decision | Choice |
|---|---|---|
| D1 | Deliverable | One-off kolo evaluation now; skill extraction later |
| D2 | Evaluators | All 6 personas (first full-panel run; weak-match honesty is part of the test) |
| D3 | Draft shape | Structured template, in-voice |
| D4 | Language | All English (concept is RU; drafts EN) |
| D5 | Execution | Two-stage pipeline with subagent fan-out |
| D6 | Draft disclosure | Share full package as clearly-labeled AI simulation (members have NOT signed) |
| D7 | Standards pass | Design validated against LLM-judge / synthetic-persona / AI-labeling standards; deltas in §5 |

## 3. Pipeline

**Step 0 — Prep.** Commit untracked `personas/dmitry-b/` + `personas/nazar-k/`. Copy concept → `ideas/kolo-events/concept.md`.

**Step 1 — Falsifiable brief + triage gate.** Kolo is two-sided and free-first, so the falsifiable hypothesis is the *monetization* one (organizers pay Creator Pro / ticket commission; users pay User Pro) — not "people want events." Run the triage gate honestly (prior: Pain ~3, Market ~3, Speed ~2 ≈ 8/15 → proceeds, Speed flagged). If <7/15 → stop and ask Anton per the skill.

**Step 2 — Research fan-out.** 9 dimensions grouped into 5 parallel web-research subagents: (1+2) competitors+pricing · (3+4) demand signals+trends · (5+9) bottom-up market size+distribution · (6+7) timing triggers+failure postmortems (Locals.md shutdown is a named lead) · (8) regulation light-touch (GDPR/profiles now, PSD2/acquiring when payments land). Each returns dated, linked findings. Bar: 10+ distinct sources; dimensions 1–3 non-empty; ≤18 months preferred, older flagged stale.

**Step 3 — Red-team + scorecard.** Answer all 5 red-team questions from collected evidence only. Build `scorecard.json`; verdict via `python3 scripts/scorecard.py` — never hand-computed. Fill Maksym's `report-template.md` → `ideas/kolo-events/validation-report.md`.

**Step 4 — Persona drafts (6 parallel Sonnet subagents).** Each receives: the persona's **full `.md` verbatim** (incl. private notes), the validation report **with the scorecard verdict/score section redacted** (evidence + red-team facts only), the concept, the template (§4), and the hard rules (§6). Output: in-voice English draft → `evaluations/kolo-events/evaluation-{persona-id}.md`.

**Step 5 — QA + synthesis.** Orchestrator QA per draft (checklist §7; one redo cycle max), then `evaluations/kolo-events/synthesis.md`: six blind stances vs. the script verdict, where the panel agrees/splits, the single most actionable next experiment, provenance block. Commit + push.

## 4. Per-persona draft template

```markdown
---
ai_generated: true
model: <model id>
generated_at: 2026-06-11
persona_source: personas/{id}/persona-{id}.md (self-authored interview, schema 1.0, created <date>)
signed_by_member: false
---
# Evaluation: Kolo Events — {display_name}
> **AI-ghostwritten simulation** drafted from {display_name}'s self-authored persona file.
> {First name} has NOT reviewed, edited, or endorsed this draft. Not a substitute for their actual judgment.

## My first question, answered      ← the persona's literal first question, applied to Kolo
## What makes me bullish here
## What makes me skeptical here
## Failure patterns I recognize    ← only patterns from their file that genuinely map
## My verdict                      ← own GO / PIVOT / KILL from evidence — formed BLIND to the script verdict
## The one experiment I'd run next
```

Sections ~50–150 words. Citations `[n]` map to the validation report's numbered sources.

## 5. Standards-check deltas (D7)

1. **Blind verdict (anchoring bias).** LLM-as-judge literature: judges anchored on a prior verdict don't judge independently. Personas see evidence + red-team facts, NOT the script verdict/score. Synthesis compares blind stances vs. script verdict. (Replaces the earlier "verdict stance vs scorecard" section.)
2. **Verbatim persona grounding + role-adherence QA.** Known synthetic-persona failure modes are identity flattening and shallow role adherence (PersonaCite, "Whose Personae?", arXiv 2512.00461 / 2601.22288). Subagents anchor on verbatim persona text; QA traces draft claims to persona-file fields.
3. **Provenance + labeling.** EU AI Act Art. 50 transparency obligations apply 2026-08-02; drafts simulate real named people, so prominent disclosure is mandatory hygiene even though a private founder memo is likely out of legal scope: machine-readable frontmatter + visible header (§4), provenance block in synthesis.
4. **Simulation ≠ validation.** Synthesis frames panel output as hypothesis-generation feeding the founders' *field* validation (interviews, fake door, concierge) — consistent with "Synthetic Founders" (arXiv 2509.02605) and validate-idea's evidence hierarchy (desk research caps at level 3–4).
5. **Monoculture caveat.** All 6 drafts come from one base model conditioned on different personas; stylistic convergence is a known risk. Mitigation: verbatim anchoring + QA for voice distinctiveness; disclosed in synthesis.

## 6. Hard rules (per draft)

- Every factual claim cites `[n]` or is explicitly framed as the persona's own experience ("In my experience…").
- Drafts must never contradict the evidence; stance divergence from the script verdict is expected and surfaces in the synthesis (drafts are verdict-blind per §5.1).
- `## Private notes` may inform tone/skepticism but must never surface identifiably (drafts are founder/peer-visible).
- No invented depth: where the persona file lacks relevant tags/experience, the draft says so in-voice rather than faking expertise.
- Honest-search rule inherited from validate-idea: thin demand evidence is a finding, not a prompt to keep digging.

## 7. QA checklist (orchestrator, per draft)

- [ ] All factual claims cited `[n]` or framed as persona experience
- [ ] Claims about the persona trace to actual persona-file fields (role adherence)
- [ ] No private-notes content identifiable
- [ ] Verdict formed blind (no reference to script score/verdict)
- [ ] Voice distinct from the other drafts (no template-clone phrasing)
- [ ] Disclosure header + frontmatter intact

## 8. Risks & open items

- **Member consent posture (Anton owns):** members are simulated by name without having signed the output. Mitigation: D6 labeling + a Telegram heads-up to the 6 members before/when the package goes to the founders.
- **Founders' delivery (Anton owns):** package = validation report + 6 labeled drafts + synthesis. Anton decides channel/framing.
- **validate-idea lives in Downloads:** run from there for this one-off; adopting it into the repo (e.g., `persona-builder/skills/`) is a backlog item with Maksym's involvement.
- **Conflict note for synthesis:** anton-safronov persona is the founder of an adjacent Warsaw community platform; his draft should disclose that lens.

## 9. Out of scope

Reusable `persona-evaluation` skill · evaluator auto-selection · persona search index · non-English output · founders' field validation itself.
