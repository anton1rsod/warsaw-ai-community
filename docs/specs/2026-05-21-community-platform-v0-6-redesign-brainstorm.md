# v0.6 Visual Redesign — Brainstorm Output (chat-34)

**Date:** 2026-05-21 · **Chat:** 34 · **Spec:** `projects/community-platform/spec.md` §16

This doc captures the brainstorm decisions + ASCII-equivalent of the visual locks. The live mockup HTML (`design-preview.html`) lives in gitignored `.superpowers/brainstorm/` and won't persist; future chats reference this doc + spec §16 as canonical.

## Trigger

Anton, chat-34 opening: *"v0.5.1 just shipped (tag `community-platform-v0.5.1` at `ef009d5` on main; 1047/1047 tests; all 6 hardenings H81-H86 green). The platform works but visually it's a basic Tailwind scaffold with generic AI-slop aesthetic — sterile neutrals, default font, no distinctive identity. Doesn't look good at all for a top community platform."*

## Process discipline

- Initial handoff said "skip `superpowers:brainstorming`, go direct Q&A"; Anton overrode: *"NO!! Brainstorm and then ask me questions. wtf"*. Brainstorm skill was then invoked. (Lesson saved to memory: don't skip brainstorming on design/feature discovery, even if handoff explicitly says to.)
- Visual companion accepted; ran at `http://localhost:49515` for 4 question screens (aesthetic, hierarchy, typography, design preview).
- Surface scope locked via `AskUserQuestion` in terminal (4 surfaces — single-select; recommended option picked).
- One color-inheritance bug surfaced mid-brainstorm — frame template's dark-mode default text color (`#f5f5f7`) made all my no-explicit-color elements invisible on cream. One-line fix: `#claude-content { color: #1a1a2e; }` (inherited color loses to any explicit child color).

## Locks (4 brainstorm picks + 5 implicit)

| Axis | Anton's pick | Recommended? |
|---|---|---|
| Aesthetic flavor | **D — Warm maximalist** (amber pushed, italic serif + mono voice + hand-drawn marks) | Yes — I recommended B (Brutalist Warsaw) OR D; Anton picked D |
| Hierarchy lens | **1 — Event-first** (next meetup is the hero) | No — I recommended 2 (Shipping-first); Anton picked 1, valid reasoning (event is the platform's reason-to-exist; build feed lacks critical mass) |
| Display serif | **C — Fraunces** (variable, SOFT + WONK axes) | Yes — recommendation accepted |
| Surface scope | **All 4** — `/` + `/home` + `/events` + `/events/[slug]` + shared Header/Footer | Yes — recommendation accepted |
| Body font | Inter (kept from v0.4) | Implicit lock |
| Mono voice | JetBrains Mono | Implicit lock |
| Color anchor | Amber `#f59e0b` (kept from v0.4 ADR-0014) | Implicit lock |
| Dark mode | Light-only for v0.6; token slots ready for v0.7 override | Implicit (existing posture) |
| Motion | Sober — static tilt + hover translateY only; no JS animation | Implicit per §16.6 |

## Design preview ASCII (the cohesive system)

**Tokens:**
- Palette: cream `#fef6e6` · cream-deep `#fdebc9` · amber `#f59e0b` · amber-deep `#d97706` · ink `#1a1a2e` · dust `#8b6f3a` · paper `#ffffff` · alert `#dc1f1f`
- Type: Fraunces italic 400/700/900 · Inter 400/600 · JetBrains Mono 400/700
- Motifs: amber tag rotated -1.5° · dashed-ink pill · solid ink pill · 0 radii · 1.5px rules · spacing scale 4/12/24/48

**Shared chrome:**
```
Anonymous header:   [dark ink strip]  warsaw.ai    events · members · ships · handbook    [ sign in ]
Signed-in header:   [dark ink strip]  warsaw.ai    EVENTS(amber) · members · ships · handbook    [AS] anton ▾
Footer:             [dark ink strip]  © 2026 Warsaw AI · built in public, MIT             about · telegram · github · license
                                       (serif italic)                                       (mono)
```

**`/` (anon visitor):**
```
// next meetup · in 6h 12m
Warsaw AI
ships in [public.]
Where Warsaw's AI builders learn, ship, and find each other.

┌────────────────────────────────────┐
│ // tonight                         │
│ AI Community Meetup № 4            │  ← italic Fraunces title
│ 19:00 · Grzybowska 85a · @anton   │
│ [RSVP →] [+ calendar]              │
└────────────────────────────────────┘

[sign in with github]  [join telegram]
```

**`/home` (signed-in):**
```
// your week · meetup in 6h
Tonight, Anton—
[Meetup № 4.]

┌────────────────────────────────────┐
│ AI Community Meetup № 4            │
│ 19:00 · Grzybowska 85a            │
│ [✓ going] [+ calendar]             │
└────────────────────────────────────┘

// this week · 3 ships
┃ @kazia · persona-builder v0.3            2h
┃ @anton · community-platform v0.5.1       1d
```

**`/events`:**
```
// events · 1 upcoming
Events.
[+ new event]  [subscribe (ICS)]

// upcoming
┌─────────────────────────────────────┐
│ [21]  AI Community Meetup № 4       │  ← amber date-badge tilted -1.5°
│ [MAY] 19:00 · Grzybowska 85a       │
│       [1 going]                     │
└─────────────────────────────────────┘

// past
No past events yet — Warsaw AI starts tonight.  (italic Georgia, dust)
```

**`/events/[slug]`:**
```
// meetup № 04 · 21 may · 19:00 sharp
AI Community
Meetup № 4 [tonight.]
120 min · Grzybowska 85a · hosted by @anton1rsod
[✓ going] [interested] [+ calendar]

┌────────────────────────────────────┐
│ Agenda                             │
│ Persona setup · NDA signing ·     │
│ Idea round · Validation skill.    │
│ When · Where (article body)        │
└────────────────────────────────────┘

// going (1)        // interested (0)
[AS]                No one's marked yet.
```

## Design system one-liner

Three motifs do the "no AI-slop" lifting:

1. **Fraunces variable axes (SOFT + WONK)** — per-surface expression control without extra font files; rejects the Inter/Roboto default that screams "Tailwind template"
2. **Rotated amber tag (`-1.5°`)** — signature gesture across all surfaces; preserves v0.4 brand equity while pushing it to the maximalist edge
3. **Editorial framing (dark band / cream body / dark band)** — sandwich rhythm no other community platform uses; preserves H56 / v0.4 H66 server-rendered Header posture

## What v0.6 doesn't touch

- `/members`, `/me/edit`, `/admin/events/new`, `/handbook`, `/decisions`, `/projects/*`, `/meetings/*`, `/this-week`
- All non-redesigned pages inherit the new Header + Footer + tokens; they're not visually "stale" relative to v0.5.1, just not bold-redesigned
- v0.4.7 EventRsvpButton hydration + v0.4.8 force-dynamic posture preserved unchanged
- All v0.5.x admin event-creation surfaces preserved unchanged

## What chat-35 reads

1. `STATE.md` (post-v0.6.0 ship snapshot)
2. `projects/community-platform/spec.md` §16 (canonical contract)
3. This doc (visual reference)
4. `docs/specs/2026-05-21-community-platform-v0-6-redesign-implementation-handoff.md` (written by chat-34 if writing-plans skill output lands here)

## Why "warm maximalist" + "event-first" together work

Event-first puts the NEXT MEETUP at center fold. Warm maximalist makes that meetup feel like a poster, not a calendar entry. Together they answer "what is Warsaw AI Community?" with: *a city that gathers tonight at 19:00, in writing that takes itself seriously enough to deserve italic display.*

The risk: if no event is scheduled within 7 days, the hero block goes flat. Mitigation: the empty-state copy `"Next meetup lands soon. Watch this strip."` (italic) keeps the warmth even at empty. v0.7 can introduce a multi-event preview list if that empty state hurts.

---

*Output of chat-34 brainstorm; locked into spec §16. Spec ready for Anton review → writing-plans skill → v0.6.0-plan.md.*
