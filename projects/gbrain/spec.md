# GBrain — Design Spec

**Status:** Draft v1 — awaiting founder review
**Date:** 2026-04-24
**Author:** Anton Safronov (via brainstorming session with Claude)
**Project:** `projects/gbrain/`
**Parent program:** [Warsaw AI Community](../../docs/specs/2026-04-24-warsaw-ai-community-program-design.md)

---

## 1. Problem

Community knowledge lives in Telegram scrollback — lossy, unsearchable at scale, and invisible to new joiners. When a member answers a question brilliantly in Q&A, that answer disappears. When someone writes a Guide, it's 3 topic-scrolls away a week later. When News & Signals covers a model launch, the signal dies in the channel history.

**GBrain** turns conversation into durable, queryable memory the community owns: a Telegram-accessible knowledge base that ingests opt-in content, summarises what's happening, and (Phase 2) answers questions with citations drawn from the community's own output.

## 2. Goals

**Phase 1 (v0.1 — ships in ≤ 2 months):**
- Deploy `@WarsawAIBrainBot` to the Warsaw AI Community Telegram channel.
- Ingest `#kb`-tagged messages and messages posted in formal topics (with `#skip` escape) into `community/archive/YYYY-MM/<slug>.md`.
- Post a daily **News & Signals digest** summarising the previous 24h of tagged news into the `News & Signals` topic.
- Prove consent rules work in practice (topic pre-consent + author confirm hybrid).
- Establish observability + cost tracking via Vercel AI Gateway.

**Phase 2 (v0.2 — follows v0.1 success):**
- Add **Q&A mode**: `/ask <question>` DMs or in-topic returns an answer with citations drawn from the archive + repo docs.
- Introduce a derived **Postgres + pgvector** index rebuildable from markdown.

**Phase 3 (v0.3 — acknowledged, not committed):**
- Weekly recap digest, meetup-prep digest, per-topic digests.
- Per-member "what did I miss?" digest.

## 3. Non-goals (explicit scope cuts)

- **No retroactive ingestion of pre-existing messages in v0.1.** We start from "today" forward. A one-time manual export backfill may be considered in Phase 2 after consent is re-confirmed.
- **No general-purpose chatbot behaviour.** GBrain only responds to specific commands and to tagged messages. It does not free-associate in the channel.
- **No LLM-generated answers in v0.1.** Digest is the only LLM output in v0.1; Q&A is Phase 2.
- **No user-facing web app in v0.1.** Telegram is the only interface. The repo is the secondary interface (browsing markdown).
- **No member PII beyond Telegram handles and what they choose to publish.** Archive stores handle + timestamp + content; never real names (unless the member put them in the message themselves), phone numbers, or locations.
- **No commercial offering, licensing, or external access in v0.1.** GBrain serves the Warsaw AI Community only. Commercial path is a Phase 3+ decision (new ADR at that point).

## 4. Users & stakeholders

| Role | Expectation |
|---|---|
| **Members** (19 today → 200 in 12 months) | Tag content they value (`#kb`), receive DM confirmations when their message is proposed for archive, read daily digest, browse archive via GitHub or Phase 2 Q&A |
| **Core organizers** (0–4, nominated) | Moderate archive (remove content on request), tune prompts, triage bot failures, own `/gbrain-forget` requests |
| **Founder (Anton)** | Owns the bot deployment, Vercel project, secrets, roadmap |
| **Community at large** (public, via the OSS repo) | Can read the archive markdown, see design decisions, propose improvements via PR |

## 5. Constraints

- **Time:** v0.1 must ship within ~2 months of spec approval.
- **Budget:** Vercel free tier + pay-as-you-go Gemini API. Target: < €20/mo for v0.1, < €100/mo for v0.2.
- **Privacy / legal:** Polish jurisdiction, GDPR applies. Consent is the primary defence. All archived content must be traceable to a consent event (tag, topic rule, or DM confirmation).
- **Ops capacity:** Founder is the sole operator in v0.1. No on-call. Failures degrade gracefully (missed digest is acceptable; silent PII leak is not).
- **OSS posture:** GBrain code is MIT-licensed and lives in this repo. Prompts, config, and operating procedures are public. Secrets and ingested content's PII handling are the only non-public elements.

## 6. Architecture overview (Phase 1)

```
┌──────────────────────────────┐
│   Telegram (Warsaw AI Chat)   │
│                                │
│  Members tag / post messages   │
└───────┬────────────────────┬──┘
        │                    │
  webhook (HTTPS)      webhook (HTTPS)
        │                    │
        ▼                    ▼
┌─────────────────────────────────────┐
│   Vercel (Next.js App Router)        │
│                                       │
│   /api/telegram/webhook              │◄───── Bot webhook entrypoint
│   /api/cron/daily-digest  (Cron)     │◄───── Scheduled 1×/day
│                                       │
│   Shared modules:                     │
│    - consent/       (rules engine)   │
│    - ingest/        (msg → markdown) │
│    - digest/        (LLM summariser) │
│    - telegram/      (bot SDK wrap)   │
│    - ai/            (Gateway client) │
│    - store/         (git commit)     │
└──────┬───────────────────────┬───────┘
       │                       │
       │ Gemini direct          │ git push
       │ (@ai-sdk/google,       │ (auto-commit to community/archive/)
       │  since 0.1.1)          │
       ▼                       ▼
┌──────────────────┐   ┌──────────────────────┐
│ Gemini API       │   │ This git repo         │
│ (gemini-2.5-     │   │ community/archive/... │
│  flash)          │   │ (canonical storage)   │
│                  │   └──────────────────────┘
└──────────────────┘
(Vercel AI Gateway is no longer in the path; see §16 + §20. Gateway re-entry
is a Phase 2 / 0.3.0+ option if multi-provider fail-over becomes important.)
```

**Phase 2 adds:**
- `/api/telegram/ask` — Q&A handler.
- **Neon Postgres + pgvector** (via Vercel Marketplace) — derived index, rebuildable from markdown.
- **Indexer job** (Vercel Cron or on-commit GitHub Action) that syncs markdown → embeddings.

## 7. Components & responsibilities

| Module | Responsibility | Testable independently? |
|---|---|---|
| `consent/` | Decide if a given message is archive-eligible (topic pre-consent? tag? author DM?) | Yes — pure function of `(message, topic, tags, author_pref)` → `{allow, require_confirm, deny}` |
| `ingest/` | Turn a Telegram message into a deterministic markdown file with frontmatter (author, timestamp, topic, source_link) | Yes — `(message) → markdown_string` |
| `store/` | Commit markdown to the repo using a bot identity. Branch protection bypass is limited to `community/archive/**` | Yes — mock git, assert paths and commit messages |
| `digest/` | Select N recent News & Signals messages, call LLM, render digest markdown, post to Telegram | Yes — mock LLM + Telegram, assert prompt shape + output shape |
| `ai/` | Thin client around `@ai-sdk/google` (since 0.1.1). Handles model selection (`gemini-2.5-flash` etc.), timeout, retry, cost tagging | Yes — mock the provider factory, assert model id + params |
| `telegram/` | Wrap bot SDK. Handle webhook parsing, message sending, DM confirmations, `/gbrain-*` commands | Yes — standard webhook testing |
| `commands/` | Slash command handlers (`/gbrain-forget`, `/gbrain-optout`, `/gbrain-status`) | Yes — command → action mapping |

Each module < 300 lines target, < 800 hard max. Single-responsibility.

## 8. Data flow — ingestion

```
Telegram message posted
        │
        ▼
Webhook hits /api/telegram/webhook
        │
        ▼
consent.evaluate(message, topic, tags, author_prefs)
        │
        ├── DENY  ──────────────────► no-op (log reason)
        │
        ├── CONFIRM_REQUIRED
        │       │
        │       ▼
        │   telegram.dm(author, "Archive this? /yes /no")
        │       │
        │       ├── /yes ──► proceed to ALLOW
        │       ├── /no  ──► no-op, record refusal
        │       └── 48h timeout ──► auto-no
        │
        └── ALLOW
                │
                ▼
          ingest.toMarkdown(message) → string
                │
                ▼
          store.commit(
            path: community/archive/YYYY-MM/SLUG.md,
            content: markdown,
            author: "gbrain-bot",
            message: "archive: <topic> — <author-handle> — <timestamp>"
          )
                │
                ▼
          telegram.react(message, "🧠")   (visual confirmation)
```

## 9. Data flow — daily digest

```
Vercel Cron triggers /api/cron/daily-digest (once per day, 09:00 Warsaw time)
        │
        ▼
Fetch messages from News & Signals topic, last 24h, status=not-skipped
        │
        ▼
ai.summarise({
  model: "google/gemini-2.0-flash",
  prompt: DIGEST_PROMPT,
  input: messages[],
  max_tokens: 1500
})
        │
        ▼
Render digest markdown (template: headline per item + "why it matters" + source link)
        │
        ▼
telegram.post(topic: "News & Signals", content: digest, as: "🧠 Daily Digest — <date>")
        │
        ▼
store.commit(community/archive/digests/YYYY-MM-DD.md)
```

## 10. Consent machine (the rules engine)

Codified in `consent/rules.ts`. Exported as pure function.

### Topic classification (from ADR-0003)

| Topic | Class | Default |
|---|---|---|
| General | casual | deny unless `#kb` tagged + author confirmed |
| Questions & Answers | casual | deny unless `#kb` tagged + author confirmed |
| Guides | formal | allow unless `#skip` (48h escape) |
| Meetups | formal | allow unless `#skip` |
| Projects & Repos | formal | allow unless `#skip` |
| News & Signals | formal | allow unless `#skip` |
| Tools & Stacks | formal | allow unless `#skip` |
| Builds & Pitches | formal | allow unless `#skip` |

### Decision table

| Input | Output |
|---|---|
| message in casual topic + no tags | **deny** |
| message in casual topic + `#kb` tag + tagger == author | **allow** |
| message in casual topic + `#kb` tag + tagger != author | **require_confirm** (DM author) |
| message in casual topic + `#skip` tag | **deny** (hard) |
| message in formal topic + no tags | **allow (48h pending window)** |
| message in formal topic + `#skip` tag | **deny** (hard) |
| message in formal topic + `#kb` tag | **allow immediately** (skip pending window) |
| author has `/gbrain-optout` set | **deny** regardless of topic/tags |

### Pending window (formal topics)

- Messages in formal topics enter a **48-hour pending queue**.
- If author posts `#skip` within 48h, entry is dropped before commit.
- After 48h, queued entries are committed in batch.
- Trade-off: real-time archive delayed by 48h for formal topics. Acceptable — digest is the real-time layer.

### `/gbrain-forget` (post-commit removal)

- Any member can DM the bot `/gbrain-forget <message-link>` for their own content.
- Bot removes the markdown file and commits a removal record (`community/archive/_removed/YYYY-MM-DD.md` with hash only, no content).
- Core organizers can forget any content (for moderation cases).

## 11. Phase 1 — what ships

**Code / infra:**
- [ ] Next.js App Router project initialised at `projects/gbrain/app/` (or co-located as a sibling folder — see section 14).
- [ ] `vercel.ts` configured with project name, framework, cron entry.
- [ ] `@WarsawAIBrainBot` created via @BotFather (founder action).
- [ ] Telegram webhook registered against Vercel production URL.
- [ ] Vercel AI Gateway configured with Gemini as primary, Claude Sonnet + OpenAI GPT-4o-mini as fail-over.
- [ ] Env vars set: `TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, `AI_GATEWAY_API_KEY`, `GITHUB_BOT_TOKEN`, `DIGEST_TARGET_TOPIC_ID`, etc.
- [ ] Auto-commit flow to `community/archive/` (via GitHub bot token, scoped to archive path).

**Operating artifacts:**
- [ ] Onboarding doc at `community/telegram/onboarding-gbrain.md` — how to interact with the bot, consent model, commands.
- [ ] Playbook at `docs/playbooks/gbrain-operations.md` — how to handle ingestion failures, cost spikes, forget requests.
- [ ] ADR-0006 — Secret handling & rotation protocol.
- [ ] ADR-0007 — Gbrain Phase 1 architecture decisions (this spec's highlights, crystallised).

**Gates for Phase 2 (from Q8 — community-tested):**
- [ ] ≥ 5 non-organizer members have archived content.
- [ ] ≥ 10 archived items total.
- [ ] Digest posted successfully ≥ 14 days in a row.
- [ ] Quick poll in General: "Is the daily digest useful?" — ≥ 3 positive.
- [ ] Onboarding doc exists and is linked from channel welcome.
- [ ] No critical incidents in last 7 days.

## 12. Phase 2 — scope preview (not committed)

- `/ask <question>` handler. Returns streamed Telegram message with answer + citations (file + line link).
- Neon Postgres + pgvector via Vercel Marketplace.
- Indexer cron job: markdown → chunks → embeddings → DB.
- Embedding model: Gemini `text-embedding-004` or equivalent through Gateway.
- RAG prompt template with citation-enforcing constraints.

## 13. Phase 3 — acknowledged backlog

- Weekly recap digest.
- Meetup-prep digest ("here's what to know before Tuesday").
- Per-topic digests (Tools & Stacks weekly, Builds & Pitches monthly).
- Per-member "what did I miss?" DM on request.

## 14. Repository layout — `projects/gbrain/`

**Option A (chosen):** GBrain app code lives at `projects/gbrain/app/` as a self-contained Next.js project. Deployed independently to Vercel. The parent repo's root is *not* the Vercel project root — we use `vercel.ts` + Vercel's "Root Directory" setting to point at `projects/gbrain/app/`.

```
projects/gbrain/
├── README.md              (exists)
├── spec.md                (this file)
├── plan.md                (to be written by writing-plans)
├── CHANGELOG.md           (to be created)
├── app/                   (Next.js project)
│   ├── package.json
│   ├── vercel.ts
│   ├── app/
│   │   └── api/
│   │       ├── telegram/
│   │       │   └── webhook/route.ts
│   │       └── cron/
│   │           └── daily-digest/route.ts
│   ├── src/
│   │   ├── consent/
│   │   ├── ingest/
│   │   ├── digest/
│   │   ├── ai/
│   │   ├── telegram/
│   │   ├── store/
│   │   └── commands/
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   └── .env.example       (documents required env vars, never real values)
```

**Community archive** (written to by the bot):
```
community/
└── archive/
    ├── YYYY-MM/
    │   └── <slug>.md
    ├── digests/
    │   └── YYYY-MM-DD.md
    └── _removed/
        └── YYYY-MM-DD.md   (removal records, hash-only)
```

## 15. Secrets & security

**Never in repo, never in logs, never in prompts.**

| Secret | Where it lives | Rotation |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Vercel env var (prod + preview) | On suspected leak; quarterly audit |
| `GEMINI_API_KEY` | Vercel env var | On leak (e.g., accidental paste); quarterly audit. **Current key was pasted in spec chat — rotate before deploy.** |
| `AI_GATEWAY_API_KEY` | Vercel env var | Quarterly |
| `GITHUB_BOT_TOKEN` | Vercel env var, fine-grained PAT scoped to this repo (GitHub PATs are repo-level; `community/archive/` sub-path enforcement lives in the bot's `assertAllowedPath`, not in the PAT itself) | Quarterly; revoke on contributor departure |

Guardrails:
- `.env.example` committed; `.env` gitignored (already in `.gitignore`).
- CI check: reject PR if regex matches common token shapes in diff.
- AI Gateway "zero data retention" enabled.
- Prompt templates logged, but never with bound values (parameterised only).
- Archive markdown is committed with bot identity (`gbrain-bot <noreply@...>`), separate from human commits — easy audit trail.

Detailed protocol in **ADR-0006** (to be written alongside this spec).

## 16. Observability

- **Google AI Studio dashboard** (since 0.1.1) — per-request token usage and cost. Was Vercel AI Gateway dashboard until 0.1.0; switched in 0.1.1 because Gateway requires a credit card on file even for free credits.
- **Vercel logs** — function invocations, errors. `console.error("[gbrain.digest] ...")` writes here.
- **Custom metric events** (via Vercel log drain → future observability tool):
  - `gbrain.ingest.allowed` / `gbrain.ingest.denied` / `gbrain.ingest.pending`
  - `gbrain.digest.run` with outcome (success / degraded / failed) — `runDigest()` returns `degraded:true` on AI failure (see §19 rollback).
  - `gbrain.forget.requested`
  - `gbrain.cost.daily` (summed from Google AI Studio when log drain lands; manual check via dashboard until then)
- Weekly internal report (manual in v0.1) posted to **Announcements** when it exists, or to core-organizer DM until then.

## 17. Testing strategy

Per global TDD rule (80%+ coverage, tests first).

| Layer | Framework | What we test |
|---|---|---|
| Unit | Vitest | `consent.evaluate()`, `ingest.toMarkdown()`, slug generation, prompt rendering |
| Integration | Vitest + Telegram webhook fixture | Webhook → consent → commit pipeline with mocks |
| E2E | Playwright (for any future web UI) / manual script | Full "member tags → bot reacts → commit lands → file visible in GitHub" |
| Safety | Fixed prompt-injection cases | Malicious message payloads must not exfiltrate secrets or break consent |

CI on every PR (GitHub Actions) — no merge without green tests.

## 18. Rollout

- **Pre-launch (week 1–2):** bot deployed to Vercel preview env, webhook points to staging Telegram group (a 3-member test chat).
- **Soft launch (week 3–4):** bot added to real Warsaw AI Community channel. Core organizers only can tag. Members notified via pinned post explaining consent + commands.
- **Full launch (week 5):** consent rules unlock for all members. Daily digest begins.
- **Observation (week 5–8):** monitor ingestion volume, digest quality, costs. Tune prompts. Write onboarding updates based on questions asked.
- **Phase 1 review (end of week 8):** measure against gates in section 11. Go / no-go on Phase 2.

## 19. Rollback

- **If bot misbehaves:** revoke Telegram webhook (one API call — bot goes silent). Vercel deployment can be rolled back in one click.
- **If archive gets polluted:** `git revert` bot commits in the offending window. Consent rules may need tightening via ADR.
- **If cost spikes:** feature-flag the digest off (`DIGEST_ENABLED=false` env var — no redeploy needed with Vercel).
- **Full kill-switch:** `GBRAIN_KILL_SWITCH=true` env var — all webhook invocations return 200 without processing.

## 20. Risks & open questions

| Risk | Severity | Mitigation |
|---|---|---|
| Member posts PII (phone, address) and it hits the archive | High | `#skip` tag prominently documented; `/gbrain-forget` always works; moderation scan of auto-committed content weekly |
| Cost spike from runaway digest or ingestion | Medium | Google AI Studio dashboard for daily token totals; `GBRAIN_KILL_SWITCH` env var; `DIGEST_ENABLED=false` to feature-flag off |
| Gemini provider outage | **Medium (was Low until 0.1.1)** | Direct Gemini call (no Gateway fail-over). `runDigest()` returns degraded — cron commits a tombstone digest, skips Telegram post. Outage = no digest that day. Multi-provider fail-over is a Phase 2 / 0.3.0+ candidate to revisit. |
| Consent rule bug (e.g., archives a `#skip`-tagged message) | High | Rules engine is pure-function, heavily tested; each failure = P0 incident + ADR |
| Bot token leaked (token in git, accidental screenshot) | Critical | Env-var-only policy; pre-commit secret scan; immediate rotation protocol (ADR-0006) |
| Member perceives bot as "watching everything" and leaves | Medium | Transparent onboarding doc; clear commands (`/gbrain-status`) showing exactly what's ingested |
| Github auto-commits flood PRs / clutter history | Low | Bot commits stay on `main` via a restricted path; we can move to a separate branch/repo in Phase 2 if needed |
| GDPR data-subject request arrives | Medium | Playbook documents removal workflow; `community/archive/_removed/` is the cleanup index |

**Open questions:**
- Default digest time (proposal: 09:00 Europe/Warsaw).
- Whether digest posts to **News & Signals** (intuitive) or to its own "Announcements" topic (requires adding topic — deferred).
- Handling edits: if a member edits a message after it's archived, do we re-archive the edit? (v0.1: no; edits require re-tagging.)

## 21. Decisions log (ADR cross-references)

| ADR | Applies how |
|---|---|
| [ADR-0001](../../docs/decisions/0001-oss-first-licensing.md) | GBrain code is MIT. Archive content follows community license. |
| [ADR-0003](../../docs/decisions/0003-telegram-topic-structure.md) | Topic pre-consent classification in section 10 derives from this ADR. |
| [ADR-0004](../../docs/decisions/0004-commercial-track-accelerated.md) | GBrain's commercial-path posture (no commercial v0.1, path preserved) follows from this ADR. |
| **ADR-0006** *(to be written)* | Secret handling & rotation. Triggered by the leaked Gemini key incident. |
| **ADR-0007** *(to be written)* | Phase 1 architecture decisions (stack, runtime, bot model, consent model) crystallised from this spec. |

## 22. Success criteria for this spec

- [ ] All 8 brainstorming decisions captured accurately.
- [ ] Phase boundaries explicit; Phase 2 and Phase 3 scoped but not committed.
- [ ] Consent rules are a decision table that can be implemented mechanically.
- [ ] Secrets protocol is explicit (no ambiguity about where keys live).
- [ ] Founder approves before `writing-plans` runs.
- [ ] ADR-0006 (secrets) + ADR-0007 (architecture) written alongside this spec.

---

**Next step after approval:** Write ADR-0006 + ADR-0007, then invoke `superpowers:writing-plans` to produce `projects/gbrain/plan.md` with milestones, verification criteria, and ordered tasks.
