# Persona Creation — Warsaw AI Community

A guided interview that produces a structured, peer-visible persona of you, the community member, and a private companion file used to draft evaluations of business ideas in your voice.

If you have 45–60 minutes of focused time and a Claude account, you can do the whole thing in one sitting. You can also pause and resume.

---

## Why we are doing this

The Warsaw AI Community is, in plain terms, a small group of IT-industry operators, founders, and experts who evaluate each other's business ideas. That activity only works if we can match each idea to the **right** evaluators — peers who actually know that domain, that buyer, that builder context — and if their input arrives with enough specificity to be useful.

Two problems get in the way:

1. **We do not know who knows what.** A community of 19+ people quickly outgrows the limit of "I remember Anna once mentioned…". Without structured signal about each member's expertise, evaluator selection collapses to "whoever's online" or "whoever speaks first."
2. **Generic input produces generic feedback.** "Great idea, have you thought about your go-to-market?" helps no one. What helps is the patterns you reliably notice, the failure modes you've watched recur, the question you instinctively ask first when someone pitches you something. That signal lives in members' heads and never gets written down.

This skill is a one-time interview that turns that signal into a structured file the community can use.

## What we are trying to achieve

Concretely, three things:

1. **A persona database.** One file per member, in a consistent schema, stored in `personas/`. Together they form the community's directory of expertise — searchable by industry, role, company stage, and depth.
2. **Honest evaluator selection.** When an idea comes in for evaluation, the system can pick members whose actual depth matches the idea (not whoever happens to be loudest). Depth is self-reported and calibrated against an honest "would I be the sharpest person in a room of 10 peers?" test.
3. **Voice-preserved evaluation drafts.** A future evaluation-drafting assistant reads a member's persona file and ghostwrites a first-pass evaluation in their voice — using their stated patterns, their bullish/skeptical defaults, their typical first question. The member edits and signs, rather than writing from a blank page.

What we are **not** trying to achieve:

- We are **not** generating personas with an LLM. The member is the author. The skill just structures the interview.
- We are **not** building public profiles for marketing. The peer-visible file is for community use, not external publication.
- We are **not** ingesting your Telegram history, LinkedIn, or any other source. The interview is the only input.

## What you will produce

Two Markdown files when you finish the interview:

| File | Contains | Who sees it |
|---|---|---|
| `persona-{your-id}.md` | Everything you wrote, including a `## Private notes` section. | The community admin (source of truth). The future evaluation-drafting assistant reads this when drafting evaluations on your behalf. |
| `persona-{your-id}.public.md` | Same file with the entire `## Private notes` section stripped. | Other community members, in the peer-visible persona view. |

`{your-id}` is a slug like `jane-d` (first name + last initial). Both files are sent back to the admin, who files them in the community's `personas/` directory.

The schema is fixed. It has six sections: Identity & metadata, Tags, Background narrative, Evaluation posture, Role dispositions, Verifiable evidence — plus an optional Private notes section that only exists in the source-of-truth file. See [`skills/persona-creation/SKILL.md`](skills/persona-creation/SKILL.md) for the full schema.

## Before you start

You need:

- **45–60 minutes of focused time.** This is not a 5-minute form. The value of the persona is in its specificity, and specificity takes time. You can pause and resume.
- **Specific examples from the last 12 months.** Career moments that shaped your thinking, patterns you have seen recur, things you have actually bought or built. The skill will push back on generic answers — that is the job.
- **A Claude account.** Claude.ai is fine; Cursor and Claude Code also work. The skill is portable across them.
- **Optional, recommended:** a thirty-second think about which 1–3 industries and roles you would honestly claim `expert` depth in. The skill enforces an "honest depth" rule and will refuse inflated claims.

You do **not** need:

- Git, GitHub, the command line, or any developer tooling — Path A below is paste-and-go.
- A polished bio — the skill will draw the specifics out of you.
- To finish in one sitting.

## How to run the skill

Three paths depending on your setup. Pick the easiest one for you.

### Path A — Claude.ai (no install, recommended for most members)

1. Open [claude.ai](https://claude.ai) and start a new chat.
2. Get the skill text. Either:
   - Ask the community admin to send you the contents of `skills/persona-creation/SKILL.md` (a single Markdown file).
   - Or open the file directly in this repo and copy everything.
3. Paste the entire skill text as your first message in the chat.
4. Send a second message: **"Run this skill for me."** (Or in Ukrainian: **"Зроби мою персону."**)
5. Claude will start the interview. Answer in whatever language you prefer.
6. At the end, Claude will render both files inline in the chat as code blocks. Copy each block into a file with the stated name (`persona-jane-d.md` and `persona-jane-d.public.md`) and send both files to the admin (Telegram, email — whatever channel you usually use).

### Path B — Cursor

1. Open Cursor and create a new chat (any model that supports skills works; pick a Claude model).
2. Same as Path A, steps 2–6.

### Path C — Claude Code (for admins and developer-members)

1. Clone the repo:
   ```bash
   git clone <repo-url>
   cd "Warsaw AI Comunity/persona-builder"
   ```
2. Launch Claude Code from the `persona-builder/` root:
   ```bash
   claude
   ```
3. The skill is at `skills/persona-creation/SKILL.md`. Either:
   - Reference it directly in your prompt: **"Use the persona-creation skill at skills/persona-creation/SKILL.md to create my persona."**
   - Or paste its contents and say "Run this skill for me."
4. With filesystem access, Claude Code writes the two output files directly into the working directory. The skill will tell you the paths.

## What the interview will ask you

In order:

1. **Identity & metadata** — your display name, slug, the date.
2. **Tags** — pick from controlled vocabularies and assign a depth (`familiar`, `practitioner`, or `expert`) to each:
   - Industries (1–5 from a vocabulary of 34).
   - Functional roles (1–3 from 21).
   - Company stages (1–3 from 5).
   - Optional free-text "niche expertise" tags for things the controlled vocab does not capture.
3. **Background narrative** — a one-line bio, ~200 words on the career moments that shaped how you think, ~200 words on what you know that most people in your field do not, and ~200 words on the patterns you reliably notice when you look at ideas. The skill will push hard for specificity here.
4. **Evaluation posture** — what makes you bullish on an idea, what makes you reflexively skeptical, three patterns of failure you have seen recur, three patterns of success, and the one question you always ask first when someone pitches you something.
5. **Role dispositions** — when you act as a buyer (budget, authority, recent purchases), when you act as a builder (what you built, scale, stack), and what substitutes or competitors you currently use in the categories the community evaluates. At least one of the three is required.
6. **Verifiable evidence** *(optional)* — LinkedIn, talks, public writing. Each item tagged `verified` (publicly checkable) or `self-reported`.
7. **Private notes** *(optional)* — sharp observations you would say to a trusted colleague but not in a room with peers: named stories, unflattering patterns, strong opinions. **This section is stripped from the peer-visible file** and only the future evaluation-drafting assistant sees it.

At the end, Claude shows you a summary, gives you one last chance to sharpen any weak answers, and then produces both output files.

## Languages — English, Ukrainian, or both

You can do the whole interview in **English**, **Ukrainian**, or **both in parallel** (each narrative field written in both languages). Just trigger the skill in your preferred language and Claude will detect it. If you want the bilingual mode, say so explicitly (e.g., "Let's do this in both English and Ukrainian" / "Давай зробимо обома мовами").

What stays English regardless of your choice: the structural parts of the file — YAML field names, section headings, controlled-vocab tag slugs (`fintech-payments`, `founder-ceo`, `seed`, …), depth values, and ISO dates. This keeps the persona database machine-parseable. Your narrative answers are in whichever language(s) you chose.

If you describe an industry in Ukrainian (e.g., `фінтех`), Claude will map it to the closest English slug and confirm with you before storing.

## Pause and resume

At any point you can say **"pause, I'll come back"** (in any language). Claude will:

1. Produce a partial draft of everything captured so far, with unfilled fields marked `[pending]`.
2. Tell you which section you should resume at.
3. In Claude.ai or Cursor: render the partial draft as a code block. **Save it locally** — paste it back as your first message next session and tell Claude to continue.
4. In Claude Code: save it as `persona-{your-id}.partial.md` in the working directory.

Do not produce the final files from a partial draft. Resume first, complete the interview, then produce both files.

## After you submit your files

Send both files to the community admin. The admin:

1. Files them under `personas/` in the community's repository.
2. Maintains the schema (any breaking changes are versioned through `schema_version`).
3. The peer-visible `.public.md` file is rendered in the community's persona view.
4. The full `.md` file becomes the input to evaluation drafting once that workflow exists.

If you want to update your persona later, run the skill again with the same `persona_id` and tell Claude you are updating. A future `persona-update` skill will streamline this; for now, re-running `persona-creation` and replacing both files works.

## Privacy and visibility

This is a member-consent system. Three things to know:

1. **You are the author and maintainer.** No persona is generated about you without you actively sitting through the interview and sending the files back. The `maintained_by` field reinforces this.
2. **Two audiences, two files.** Peers see `.public.md`. The future evaluation-drafting assistant sees the full `.md`. The `## Private notes` section is the place for things you do not want peers to see — named stories, unflattering patterns, strong opinions. The skill will not put a placeholder, comment, or stub in the peer file to indicate that private notes existed.
3. **You can withdraw.** Tell the admin to remove your persona files. There is no other store.

The skill does **not** ingest content from Telegram, LinkedIn, GitHub, or any other source. The only input is your interview.

## FAQ / Troubleshooting

**"I started the chat but Claude is not running the skill — it just chats normally."**
Make sure you pasted the *entire* contents of `SKILL.md` first (including the YAML frontmatter at the top), then sent a second message asking Claude to run it. The trigger phrase matters: try **"Run this skill for me"** or **"Help me create my persona"**.

**"Claude said I claimed expert across too many industries."**
That is the skill doing its job. The honest-depth rule asks you to keep `expert` for industries where you would be the sharpest person in a room of 10 peers. Downgrade the rest to `practitioner` or `familiar`. Tagging fewer items at honest depth helps the community match the right evaluators to ideas.

**"Claude keeps pushing back on my answer as 'generic'."**
The value of this persona is specificity. Generic LinkedIn-style answers ("I love solving hard problems") get rejected because they cannot be drafted from. Give a concrete moment, an example from the last 12 months, or skip to the next field if you genuinely cannot recall one.

**"How long is this really going to take?"**
45–60 minutes if you focus. Two pause-and-resume sessions of 25 minutes each works fine. People who try to do it in 15 minutes produce a useless file.

**"Do I have to fill in role dispositions for all three (buyer, builder, competitor)?"**
At least one. If you genuinely never act as a buyer, say so and skip. Missing role dispositions just mean you will not be auto-selected for that role downstream — there is no penalty.

**"What if my name has accents or apostrophes?"**
The slug rule strips accents, apostrophes, and punctuation. `Zoë O'Brien` becomes `zoe-o`. If two community members would generate the same slug, fall back to full last name (`jane-doe`) or a numeric suffix (`jane-d-2`) — Claude will ask.

**"Can I write in Russian / Polish / German / another language?"**
The skill explicitly supports English and Ukrainian. Claude can technically conduct the interview in other languages too, but the structural tokens (headings, tag slugs) stay English regardless. If you need a third language for the narrative, mention it at the start.

**"What happens to my private notes?"**
They live only in the `.md` file (not the `.public.md` file). The admin stores both files. The future evaluation-drafting assistant reads the full `.md` when ghostwriting drafts on your behalf — so your private observations inform drafts you sign, but other members never see them.

**"I do not have a Claude account."**
Claude.ai has a free tier sufficient for this interview. Sign up at [claude.ai](https://claude.ai). If that is a blocker, ask the admin — they can run the interview with you in a shared session.

## Where to ask for help

- **Telegram:** post in the community's general topic, or DM the admin.
- **GitHub issues** (if the repo is public): open an issue describing what got stuck.
- **Direct:** ping Anton.

## Scope and what is **not** in this skill

This skill produces persona files only. It does **not**:

- Evaluate ideas (a future `persona-evaluation` skill will).
- Select evaluators automatically (also future).
- Aggregate personas into search indexes (also future).
- Modify or update an existing persona in-place (a future `persona-update` skill will streamline this; today, re-run `persona-creation` and replace both files).

Those sibling skills will live next to `persona-creation/` under `skills/` when they are built.

## License and attribution

This skill and its surrounding tooling follow the parent community's OSS-first stance — MIT licence, member-consent for data use, no commercial entity behind it (yet). See the parent [`Warsaw AI Comunity`](../) repo for the charter, governance, and full ADR trail.

The persona schema is versioned (`schema_version: 1.0` at time of writing). Breaking changes go through a new ADR.

---

**TL;DR** — open Claude.ai, paste the contents of `skills/persona-creation/SKILL.md`, say *"run this skill for me"* (or *"зроби мою персону"*), spend 45–60 minutes answering specifically, send the two output files to the admin. Done.
