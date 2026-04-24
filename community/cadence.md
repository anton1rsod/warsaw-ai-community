# Cadence

## Rhythm

| What | When | Where | Who runs it |
|---|---|---|---|
| **Weekly offline meetup** | Every week (day of week TBD) | Warsaw venue (rotating / fixed — TBD) | Rotating host from core organizers |
| **Event-driven burst** | As needed (major AI news, launches, guest speakers, hackathons) | Hybrid (Telegram thread + optional in-person) | Whoever proposes it |
| **Async discussion** | 24/7 | Telegram topics | Self-organized |
| **Monthly metrics review** | First week of each month | Async in `docs/playbooks/monthly-review.md` (to be created) | Founder |

**No mandatory online sync calls.** Telegram topics carry all async traffic.

## Weekly meetup

**Purpose.** The forcing function. Every week we all meet, show what we shipped/learned, and pitch what's next. No week skipped — if the regular day doesn't work, we reschedule within the same week.

**Default agenda (60–90 minutes):**

1. **Welcomes** (5m) — new members, guests.
2. **What I shipped this week** (15–20m) — round-table, one paragraph per person.
3. **News & Signals** (10m) — what moved in AI this week, curated from the topic.
4. **Deep dive / talk / demo** (20–30m) — one member leads on a topic, tool, or project.
5. **Builds & Pitches** (10–15m) — anyone pitching something gets the floor.
6. **Open floor + coffee** (remaining time).

**Logging.** Every meetup produces a file in [`meetings/weekly/YYYY-MM-DD.md`](meetings/weekly/) using the template in [`meetings/weekly/_template.md`](meetings/weekly/_template.md). Fields: attendees, agenda, notes, action items. Notes get a `#kb` implicit tag — gbrain ingests weekly meeting notes as a primary knowledge source.

**Attendance.** Opt-in but tracked. Members can mark `rsvp` in the Meetups Telegram topic. No pressure, but the roster exists so we notice when someone disappears.

## Event-driven bursts

**When triggered.**
- A major model / product launch (new frontier model, new API, new framework).
- A hot news cycle (policy shift, regulation, acquisition).
- A guest speaker available.
- A member proposes a hackathon or sprint (min 3 participants).

**How.**
1. Proposer opens a thread in Telegram (usually **Builds & Pitches** or **News & Signals**).
2. Any core organizer can greenlight.
3. A folder is created: [`community/events/<YYYY-MM-DD-slug>/`](events/) with `README.md`, `pitch.md`, `outcomes.md`.
4. Event happens (online or offline).
5. Outcomes written up within 48h. Outcomes are `#kb` by default.

## What we don't do

- **Fixed weekly online call.** Too much overhead for a community that meets in person.
- **Calendar invites for async topics.** Telegram is the channel.
- **Formal AGMs, votes, ceremony.** Governance is lightweight (see [`governance/governance.md`](governance/governance.md)).

## Open items

- Pick a default day + time for the weekly meetup (proposal: Tuesdays 19:00).
- Pick a default venue or rotation policy.
- Decide on a fallback when the host is away (auto-rotate to next core organizer).
