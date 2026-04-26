# ADR-0010: `/summarize` deferred to 0.1.3 with per-topic message-cache strategy

**Status:** Accepted
**Date:** 2026-04-26
**Deciders:** Anton Safronov (founder)
**Related:** [`projects/gbrain/spec.md`](../../projects/gbrain/spec.md), [`docs/specs/2026-04-26-gbrain-ask-search-help-design.md`](../specs/2026-04-26-gbrain-ask-search-help-design.md), [`docs/specs/2026-04-26-gbrain-ask-search-summarize-help-design.md`](../specs/2026-04-26-gbrain-ask-search-summarize-help-design.md) (superseded v1)

## Context

The questionnaire (§3.1 B3) marked `/summarize` as a top-3 want — *"high-utility, demoable, strong 'wow' for breadth."* The v1 design proposed a "Strategy A — reply-chain only" implementation: bot listens for `/summarize` invoked as a reply, walks `message.reply_to_message.reply_to_message...` to gather thread context, summarizes via Gemini.

The v2 review (architect + typescript-reviewer, converging independently) demonstrated this is **infeasible under the Telegram Bot API**:

1. **`reply_to_message` is one level deep.** The Telegram webhook payload exposes `message.reply_to_message` for the immediate parent only. The serialized parent message does not itself carry a populated `reply_to_message`. The recursive walk does not exist.

2. **No `getMessage(message_id)`.** The Bot API has no method to retrieve arbitrary historical messages by id. Bots can only see (a) the message in the current webhook event, (b) `reply_to_message` (one level), and (c) messages that arrived in a webhook event the bot was awake for.

3. **Result:** Strategy A would deterministically summarize **2 messages** (trigger + parent) — failing the v1 day-30 success-criterion gate of *"`/summarize` collapses a ≥10-message rehearsal thread into a coherent ≤200-word summary."*

The only correct implementations require the bot to maintain its own message store. Two paths surfaced in the v1 spec:

- **Strategy B (per-topic message cache):** webhook listener writes every observed message to a bounded ring-buffer at `community/archive/_summarize_cache/<topic_id>.jsonl`, rotated on size/TTL. `/summarize` reads from the cache.
- **Forwarded-message bundle:** require members to forward N messages to the bot, which summarizes the bundle. Awkward UX.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Drop `/summarize` from 0.1.2; defer to 0.1.3 with Strategy B** *(chosen)* | Removes the single infeasible piece from 0.1.2; preserves `/ask` + `/search` + `/help` clean ship at day-30; gives Strategy B (which has real consent-reconciliation implications) its own design pass. | Loses one of the questionnaire's three top features from the day-30 gate; breadth-acquisition demo relies entirely on `/ask` quality. |
| B. Ship Strategy A as-is, accept ≤2-message summaries | Ship something quickly. | Fails the v1 day-30 gate by definition; sets the wrong product expectation; bad-UX surface that members will encounter and report. |
| C. Ship Strategy B inside 0.1.2 | Keeps `/summarize` in scope. | Strategy B needs an ADR for the new ephemeral-persistence surface (cache holds non-consented messages transiently); needs TTL/rotation design; needs founder review of the consent posture; would inflate 0.1.2 scope past breadth-discipline. |
| D. Ship a forwarded-message bundle UX | No persistence needed. | UX is awkward — members must select+forward N messages individually; doesn't match the natural "summarize this thread" mental model; low acquisition value. |

## Decision

**Adopt Option A: drop `/summarize` from 0.1.2; defer to a separate 0.1.3 spec with Strategy B as the design starting point.**

**0.1.2 scope (this version-line):** `/ask` + `/search` + `/help` + pinned-message scaffolding. No `/summarize`.

**0.1.3 scope (subsequent version-line):** `/summarize` via Strategy B. The 0.1.3 spec will design:

1. **Cache surface and lifecycle.** Path (`community/archive/_summarize_cache/<topic_id>.jsonl`); rotation policy (size cap, TTL ≤24h); never committed long-term, never indexed by `_index/`, never returned outside the requesting topic.
2. **Consent reconciliation.** The cache contains messages from members who have not `#kb`-tagged or topic-consented. The 0.1.3 spec will reconcile this against §4.1 item 1 (consent rules) and §4.4 item 4 (no scraping non-consented Telegram content) of the questionnaire — likely landing on "ephemeral, in-flight cache for invocation-time summarization is a different consent surface from archival, with explicit invariants documented in the spec and ADR."
3. **Failure modes.** What happens if the cache is corrupt, rotates mid-summarize, or exceeds size limits.
4. **Deletion semantics.** Whether `/gbrain-forget` propagates to the summarize cache (it should — but the timing differs from `_removed/` because the cache is in-memory and file-backed for warm-container persistence only).

## Consequences

**Easier:**

- 0.1.2 ships cleaner — three features that all work, instead of three working + one degraded.
- Strategy B gets the design attention it warrants. Its consent surface is non-trivial and merits its own ADR (referenced as ADR-NNNN in the 0.1.3 spec when written).
- The day-30 success criterion in the 0.1.2 bundle becomes achievable — gate 3 (`/summarize` ≥10-message thread) is not in the gate at all; gates 1, 2, 4, 5, 6 stand.
- The breadth-acquisition demo surface is `/ask` only, which is fine if `/ask` quality is good (the calibration gate in spec §1 #6 ensures it is).

**Harder:**

- Lose one of the questionnaire §3.1 top-3 wants from 0.1.2. Mitigated by deferral, not removal — `/summarize` remains a planned feature, just on the next version-line.
- Strategy B has a new ephemeral persistence surface (`_summarize_cache/`). This is genuinely novel for GBrain (existing storage is markdown-canonical with derived index; cache is neither). The 0.1.3 spec must define it with the same rigor as `_index/`.
- A prospect demoing GBrain on day 30 sees `/ask` + `/search` + `/help`, not `/summarize`. The "30-second wow" surface is reduced. Acceptable trade-off if `/ask` quality clears the calibration gate.

## Implementation

This ADR is non-implementing — no 0.1.2 code change beyond the spec text drop.

The 0.1.3 spec writing-plans cycle is a future task, sequenced after `gbrain-v0.1.2` ships to staging and the day-30 gate passes. The 0.1.3 spec will reference this ADR as the deferral source.

### Supersedes / amends

None as a forward decision. As context: this ADR records that the v1 spec design (`2026-04-26-gbrain-ask-search-summarize-help-design.md`) was technically infeasible and that the v2 superseding spec corrected scope.

### Change control

Reintroducing `/summarize` into 0.1.2 (skipping 0.1.3) requires either: (a) demonstrating Strategy A actually does summarize ≥10 messages somehow (would require a Telegram API update we are not aware of), or (b) shipping Strategy B inside 0.1.2 with its own ADR landing first. Either is a superseding-ADR-level decision, not an operational tweak.
