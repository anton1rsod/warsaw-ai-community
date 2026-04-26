# Next-chat prompt — GBrain extension brainstorming

**Date:** 2026-04-26
**For:** the new chat after this session 4 closeout

Copy the block below verbatim into a fresh Claude Code chat. The new chat starts with no context except what this prompt + the linked files provide.

---

```
Read these three files in order, then run brainstorming:

1. docs/specs/2026-04-26-gbrain-session-4-closeout.md
   — what we shipped in 0.1.1 and the open backlog

2. docs/specs/2026-04-26-gbrain-extension-questionnaire.md
   — Anton has filled out his answers. Treat his answers as the source of
     truth for priorities, constraints, and ranked feature interest.

3. projects/gbrain/spec.md
   — current architectural baseline (note §6/§16/§20 reflect the 0.1.1
     direct-Gemini change)

Then:

(a) Invoke superpowers:brainstorming. The skill expects clarifying questions
    one at a time, but use Anton's questionnaire answers as the answers to
    those questions WHERE THEY APPLY. Only ask follow-ups for things the
    questionnaire genuinely didn't cover.

(b) Generate 8-12 candidate features ordered by Anton's priorities from
    questionnaire §2.1 (depth/breadth/fork-readiness/commercial). For each,
    list:
    - one-sentence pitch
    - effort (S/M/L) bound to Anton's time budget from §2.2
    - cost-to-run estimate against §2.3
    - extends-current vs replaces-current architecture (per §2.4)
    - which questionnaire item(s) this addresses (B*, D*, P*, A* from §3)

(c) Propose a top-3 with explicit recommendation and reasoning. Anton's
    "explain impact + recommend on decisions" feedback memory applies —
    don't present neutral menus.

(d) Once Anton picks one of the top-3, take it through the brainstorming
    skill's normal design flow → spec doc → invoke writing-plans → wait
    for Anton's go before implementation.

Constraints (carry over from session 4):
- Do NOT touch the canonical 8 topics on the real channel. Real-channel
  launch is Phase E in a SEPARATE dedicated chat (don't mix brainstorming
  with the launch session).
- Bot token rotation is a Phase E task. Don't do it in this brainstorm chat.
- Stay in the 0.1.x version line for any incremental work; 0.2.0 is reserved
  for the real-channel soft launch.
- Direct-Gemini is the AI path now; don't propose Vercel AI Gateway
  re-introduction unless cost/fail-over data justifies it (none expected
  before 0.3.0).

Anton's known preferences (from /Users/antonsafronov/.claude/projects/
-Users-antonsafronov-Projects-Warsaw-AI-Comunity/memory/):
- never echo/store API keys pasted in chat (feedback_secret_handling)
- explain impact + recommend on decisions, don't present neutral menus
  (feedback_decisions_with_recommendation)

Start by acknowledging the closeout, summarizing the questionnaire's top-3
priorities in your own words for Anton to confirm, then proceed to (b).
```

---

## Why this prompt is structured this way

- **Three reads, in order**: closeout (state) → questionnaire (priorities) → spec (architectural baseline). Without the questionnaire, brainstorming defaults to the agent's hypothesis of what matters; with it, ideas are filtered through Anton's actual priorities.
- **Skill invocation is explicit**: `superpowers:brainstorming` runs in the new chat fresh, not as a continuation of this session.
- **The prompt enforces the gate**: "Don't implement until Anton picks one and approves the spec." This matches the brainstorming skill's HARD-GATE.
- **Memory references**: the new chat will load auto-memory from `~/.claude/projects/.../memory/` automatically (CLAUDE.md says so). The prompt re-surfaces the two feedback memories that matter for this brainstorm specifically.
- **Phase E firewall**: keeping the real-channel launch in a separate dedicated chat means the brainstorm session doesn't accidentally do destructive things on the production Telegram channel.

## Pre-flight before opening the new chat

1. Anton fills out [`2026-04-26-gbrain-extension-questionnaire.md`](./2026-04-26-gbrain-extension-questionnaire.md) — at minimum §1, §2, and §3 (the rankings drive everything).
2. Commit the filled questionnaire so the new chat reads the same version.
3. Open new chat, paste the block above.
