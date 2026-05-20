# v0.5 brainstorm seed — `/admin/events/new` admin event-creation UI

**Status:** SEED — chat-31 brainstorm output via `superpowers:brainstorming`. Not a full v0.5 spec yet. Slots into a future v0.5 brainstorm-then-spec-then-plan cycle.

**Date:** 2026-05-20 (chat-31, immediately post chat-30 v0.4.6+v0.4.7+v0.4.8 ship).

**Source pointer:** [`projects/community-platform/V0_5_BACKLOG.md` — chat-29 admin event-creation UI entry](../../projects/community-platform/V0_5_BACKLOG.md).

**Pattern precedent:** [`/admin/invite`](../../projects/community-platform/app/admin/invite/page.tsx) (chat-9 v0.1.1).

---

## 0. TL;DR

Ship a single admin-only form at `/admin/events/new` that commits a new `community/events/<slug>/README.md` via the warsaw-ai-bot GitHub App, mirroring the `/admin/invite` shape: page does the RBAC redirect gate, form is a client component, server action re-verifies RBAC + Zod-validates + composes the README + calls `gh.writeFile`. 12 numbered hardenings (H69–H80) translate 1:1 to `describe("H<n>:")` test blocks. ~7 net files, 3–4 days of work, ships under ADR-0015 (admin write permissions for events).

Edit (tier 2) + status-flip (tier 3) are explicitly deferred to v0.5.1 / v0.5.2 per [[feedback_ia_defer_future_placement]].

---

## 1. Trigger / motivation

Chat-29 seeded the first real event (`community/events/2026-05-21-meetup-4/`) by hand-editing files on Anton's desktop. The workflow works fine when:

- Anton is at his desktop.
- He has the repo cloned.
- He's comfortable with multi-file git commits + push.

It breaks down when:

- He's mobile (no repo clone).
- He's away from his desktop (e.g. immediately after a meetup, while consensus is fresh).
- The event detail (date, time, agenda) changes while in conversation and he wants to commit fast.

Mobile event-creation via GitHub.com's web editor requires multi-file commits across `README.md` + (optional) `pitch.md` and frontmatter editing without IDE support — measured at ~5 min friction per event in chat-29's hand-seed exercise.

**Current cadence:** Meetup #4 is the 4th event. Cadence is climbing toward weekly. At ≥1 event/wk + ad-hoc additions (guest speakers, news-driven bursts), the ~5 min × ≥4 events/month × mobile-friction tax is real.

**Counter-argument considered (and answered):** "Just open GitHub web editor." That works for editing existing files, but creating a new folder + README in one PR is multi-step UX in the GitHub web editor. The form replaces 5 min of multi-step UI with ~30 sec of typing.

---

## 2. Scope — three tiers; v0.5 ships tier 1 only

### Tier 1 — CREATE-ONLY MVP (recommended for v0.5)

- `/admin/events/new` form page.
- Form fields: title, date, start_time, duration_minutes, location, host, url (optional), body (markdown textarea).
- Server action commits one new file: `community/events/<slug>/README.md`.
- Slug auto-derived from `date + title`; admin can override.
- Status hard-coded to `scheduled` server-side (not exposed in form).
- Post-submit redirect to `/events/<slug>` (the page Anton just created).

### Tier 2 — CREATE + EDIT (deferred to v0.5.1)

- `/admin/events/<slug>/edit` form (frontmatter + body re-edit).
- SHA-gated writes (matches `saveProfile` + `rsvpEvent` pattern).
- **Why defer:** editing existing events is rare. Anton edited the v0.4.6 ICS bug + the first event seed via desktop git fine. **Trigger to re-evaluate:** the first time Anton reports "I needed to fix an event from my phone and couldn't."

### Tier 3 — FULL LIFECYCLE (deferred to v0.5.2 or later)

- Status-flip action: `scheduled → cancelled` and `scheduled → completed`.
- ICS-subscriber notification implications (calendar apps poll the feed every 5 min — flipping `status: cancelled` re-emits `STATUS:CANCELLED` VEVENT, which most calendar apps surface as a notification).
- **Why defer:** status-flip is rare AND notification-sensitive. The git workflow handles it fine today (Anton edits frontmatter, pushes, Vercel rebuilds, ICS auto-updates within 5 min). Premature UI adds risk without value. **Trigger to re-evaluate:** first cancellation in the wild + Anton reports git-only flow was inadequate.

### What's in scope for v0.5 tier 1

- One admin-only page + form + action + pure lib.
- 12 numbered hardenings (H69–H80) with test blocks.
- ADR-0015 (admin write permissions for events).
- Re-uses existing infra: `lib/auth.ts`, `lib/github-app.ts`, `lib/content-snapshot.ts` `isAdmin()`, `/api/preview-markdown` route.
- 100% lines coverage on new `lib/event-author.ts`; 100% lines coverage on action; ≥80% branches on action.

### What's out of scope for v0.5 (regardless of tier)

- Image upload (frontmatter has no image field; events don't have hero images yet).
- `/admin/events` index page listing all events (admin can browse `/events`).
- `pitch.md` / `outcomes.md` / `artifacts/` editing (these are post-event; out of scope for *creation*).
- Member-proposed events (own brainstorm — governance, moderation, spam risk; v1.0+ candidate per chat-29 V0_5_BACKLOG entry).
- Recurring event templates (weekly sync etc. — v0.6+ if cadence proves stable).
- Multi-language event content (Polish localization is its own v0.5+ track).

---

## 3. User journey (admin POV — Anton, post-v0.5)

```
[Phone, Telegram conversation with guest speaker arranging Meetup #5]
1. Anton opens https://warsaw-ai-community-platform.vercel.app on his phone.
2. He's already signed in (NextAuth session valid).
3. He taps "Admin" → "New event" (or types the URL directly: /admin/events/new).
4. Form renders with:
   - Title: empty
   - Date: today (pre-filled)
   - Start time: 19:00 (community default per community-defaults.ts)
   - Duration minutes: 120 (community default)
   - Location: empty
   - Host: @anton1rsod (pre-filled from session.githubHandle)
   - URL: empty
   - Slug: <empty; placeholder shows derived value as user types>
   - Body: pre-filled with sanitized _template/README.md (intro + agenda placeholder)
5. He types title "Guest: Foo Bar on RAG patterns" → slug auto-derives to "2026-05-28-guest-foo-bar-on-rag-patterns".
6. He sets date to 2026-05-28, location to "Grzybowska 85a, Warsaw".
7. He edits body: replaces placeholder agenda with the actual one.
8. (Optional) He clicks "Preview" → live HTML preview renders below textarea via /api/preview-markdown.
9. He clicks "Create event".
10. Action validates RBAC + Zod + slug uniqueness + body size, composes README, commits via warsaw-ai-bot.
11. Action revalidates /events, /events/<slug>, /home, /, /api/calendar.ics.
12. Page redirects to /events/2026-05-28-guest-foo-bar-on-rag-patterns.
13. ICS subscribers' calendar apps see the new event within ≤5 min (300s public-cache TTL).
14. Vercel auto-rebuilds main on the bot's push; content-snapshot.json regenerates; /events index shows the new event.
```

**Total user time:** ~30 sec of typing (vs ~5 min mobile git web editor today).

**Failure modes the admin sees in the UI:**

- "Not authorized." — server-side RBAC oracle defense (H69).
- "An event with that slug already exists." — H70 collision guard.
- "Invalid date or slug shape." — H71 / H77 Zod failures.
- "Event body too large." — H76 cap.
- "Internal error. Try again." — GitHub App failure (network, rate limit, etc.).

All errors are inline on the form; the form preserves user input on error (no data loss).

---

## 4. Architecture — mirrors `/admin/invite` exactly

### 4.1 Files (~7 net for tier 1)

```
projects/community-platform/
├── app/admin/events/new/page.tsx          # NEW   ~30 lines  RBAC gate + render <EventForm action={createEvent} />
├── app/components/EventForm.tsx           # NEW   ~150 lines text/date/time inputs + preview + submit
├── app/actions/create-event.ts            # NEW   ~120 lines RBAC + Zod + slug + compose + writeFile + revalidate
├── lib/event-author.ts                    # NEW   ~80 lines  PURE: composeEventReadme, deriveEventSlug, helpers
├── tests/unit/event-author.test.ts        # NEW   ~120 lines
├── tests/unit/create-event-action.test.ts # NEW   ~200 lines (mocked GitHubAppClient)
└── e2e/v0-5-admin-events-new.spec.ts      # NEW   ~60 lines  1 happy path scenario

docs/decisions/0015-admin-write-permissions-for-events.md  # NEW   ~80 lines  ADR

projects/community-platform/spec.md        # AMEND  +1 §15  (or fold into broader v0.5 §15 once that brainstorm runs)
projects/community-platform/CHANGELOG.md   # AMEND  +1 [0.5.0] entry at v0.5 ship time (not seed time)
projects/community-platform/STATE.md       # AMEND  at v0.5 ship time
```

**No edits to existing source files** (this is a strictly additive surface). The only exceptions are minor: amend `spec.md` §15 / `CHANGELOG.md` / `STATE.md` at ship time per `/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/community-platform/CLAUDE.md` update protocol.

### 4.2 Page (`app/admin/events/new/page.tsx`)

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { EventForm } from "@/app/components/EventForm";
import { createEvent } from "@/app/actions/create-event";
import { getDefaults } from "@/lib/community-defaults";

export const dynamic = "force-dynamic";

export default async function AdminEventsNewPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) redirect("/login");
  if (!isAdmin(session.githubHandle)) redirect("/home");

  const { events: eventDefaults } = getDefaults();
  return (
    <main className="mx-auto max-w-prose p-6">
      <h1 className="text-2xl font-semibold">New event</h1>
      <p className="mt-2 text-sm text-gray-700">
        Commit a new event to the community calendar. Subscribers see updates within 5 minutes.
      </p>
      <EventForm
        action={createEvent}
        defaults={{
          startTime: eventDefaults.defaultStartTime, // e.g. "19:00" per community-defaults.json events.defaultStartTime
          durationMinutes: eventDefaults.defaultDurationMinutes, // e.g. 120
          location: eventDefaults.defaultLocation, // e.g. "Grzybowska 85a, Warsaw"
          host: session.githubHandle,
          today: new Date().toISOString().slice(0, 10),
        }}
      />
    </main>
  );
}
```

**Why `force-dynamic`:** matches `/admin/invite` (line 8). Reading `auth()` requires per-request execution; SSG cannot satisfy. This is a v0.4.8-pattern-aligned posture (cache-control `private, no-cache, no-store` injected by Vercel edge).

### 4.3 Form (`app/components/EventForm.tsx`, client)

State:
- All field values (controlled inputs).
- `submitting: boolean`.
- `error: string | null` (action error).
- `successSlug: string | null` (for post-submit redirect).
- `showPreview: boolean` toggle.
- `previewHtml: string | null` (preview-markdown response cache).

Fields:
- `title` (text, required, min 1 max 200).
- `date` (`<input type="date">`, required).
- `startTime` (`<input type="time">`, default from community-defaults).
- `durationMinutes` (number, default 120, min 1 max 600).
- `location` (text, optional).
- `host` (text, default `@session.githubHandle`).
- `url` (text, optional, URL validation client-side).
- `slug` (text, optional override; placeholder shows derived; visual hint "auto from title+date").
- `body` (textarea, monospace, ~12 rows; pre-filled from sanitized template).

UI affordances:
- "Preview" button → fetches `/api/preview-markdown?body=<body>` → renders below textarea.
- "Create event" submit button → calls action.
- Inline error display below submit on action failure.
- On success: `useEffect(() => router.push("/events/" + successSlug))` (Next.js client-side navigation; revalidate already done server-side).

**Why not a server-side `<form action={createEvent}>` without client state:** preview button + slug-derivation-as-you-type are client-side conveniences; the form is small enough that going hybrid adds complexity for no win.

### 4.4 Action (`app/actions/create-event.ts`)

```typescript
"use server";

import { z } from "zod";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { createGitHubApp } from "@/lib/github-app";
import { isAdmin, listEventsFromSnapshot } from "@/lib/content-snapshot";
import {
  EventSlugSchema,
  parseEventFrontmatter,
  normalizeEventFrontmatter, // export to be added per §11 dependency item
} from "@/lib/events";
import {
  composeEventReadme,
  deriveEventSlug,
} from "@/lib/event-author";

const CreateEventInputSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  durationMinutes: z.coerce.number().int().positive().max(600).optional(),
  location: z.string().max(200).optional(),
  host: z.string().max(80).optional(),
  url: z.string().url().optional(),
  slug: z.string().optional(),
  body: z.string().max(50_000), // H76 — 50 KB cap
});

export type CreateEventResult =
  | { ok: true; slug: string }
  | {
      ok: false;
      error:
        | "not_authorized"
        | "invalid_input"
        | "slug_exists"
        | "invalid_slug"
        | "invalid_date"
        | "body_too_large"
        | "internal_error";
    };

export async function createEvent(
  formData: FormData,
): Promise<CreateEventResult> {
  // H69: RBAC oracle defense — single error for no-session ∪ not-admin
  const session = await auth();
  if (!session?.githubHandle || !isAdmin(session.githubHandle)) {
    return { ok: false, error: "not_authorized" };
  }

  // Zod-validate raw form input
  const raw = {
    title: formData.get("title"),
    date: formData.get("date"),
    startTime: formData.get("startTime") || undefined,
    durationMinutes: formData.get("durationMinutes") || undefined,
    location: formData.get("location") || undefined,
    host: formData.get("host") || undefined,
    url: formData.get("url") || undefined,
    slug: formData.get("slug") || undefined,
    body: formData.get("body") ?? "",
  };
  const parsed = CreateEventInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  // H71 + H77: derive slug + validate via EventSlugSchema (calendar date + kebab)
  const slugCandidate = parsed.data.slug ?? deriveEventSlug(parsed.data.date, parsed.data.title);
  const slugParsed = EventSlugSchema.safeParse(slugCandidate);
  if (!slugParsed.success) return { ok: false, error: "invalid_slug" };
  const slug = slugParsed.data;

  // H70: pre-existence guard via snapshot
  const existing = listEventsFromSnapshot().some((e) => e.slug === slug);
  if (existing) return { ok: false, error: "slug_exists" };

  // H72: round-trip-validate via parseEventFrontmatter BEFORE commit
  const readmeContent = composeEventReadme({
    date: parsed.data.date,
    slug,
    title: parsed.data.title,
    startTime: parsed.data.startTime,
    durationMinutes: parsed.data.durationMinutes,
    location: parsed.data.location,
    host: parsed.data.host,
    url: parsed.data.url,
    status: "scheduled", // H75: server-only status
    body: parsed.data.body,
  });

  // Defensive re-parse — if compose+parse round-trip fails, refuse the commit
  // (matches the gray-matter usage in lib/events.ts:126)
  try {
    const { data: fm, content: body } = matter(readmeContent);
    // listEventsFromDisk's snake_case → camelCase normalization runs INSIDE parseEventFrontmatter's
    // upstream caller; we mirror that here by re-using normalizeEventFrontmatter exported alongside
    // parseEventFrontmatter (extract during implementation).
    parseEventFrontmatter(slug, { ...normalizeEventFrontmatter(fm), body });
  } catch {
    return { ok: false, error: "invalid_input" };
  }

  // H78: pre-existence guard at the GitHub level (defense in depth — snapshot can be stale)
  const gh = buildClient();
  const path = `community/events/${slug}/README.md`;
  const file = await gh.readFile(path);
  if (file !== null) return { ok: false, error: "slug_exists" };

  // Commit
  const safeHandle = session.githubHandle.replace(/[\r\n]/g, ""); // H73 CRLF strip
  try {
    await gh.writeFile(path, readmeContent, {
      message:
        `chore(events): @${safeHandle} create "${slug}"\n\n` +
        `Co-Authored-By: ${safeHandle} <${safeHandle}@users.noreply.github.com>\n`,
      // No sha — new file
    });
  } catch (err) {
    console.error(
      `[create-event] writeFile failed: ${err instanceof Error ? err.message : String(err)}`,
    );
    return { ok: false, error: "internal_error" };
  }

  // H79: fan-out revalidate
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath("/home");
  revalidatePath("/");
  revalidatePath("/api/calendar.ics");

  console.warn(`[create-event] @${safeHandle} created ${slug}`);
  return { ok: true, slug };
}
```

(`buildClient()` factored out same as `rsvp-event.ts:42-51`; `parseReadme` is gray-matter — same as `lib/events.ts:126`.)

### 4.5 Lib (`lib/event-author.ts`, pure)

```typescript
// composeEventReadme — build the README.md content from frontmatter + body
export interface EventAuthorInput {
  date: string;        // YYYY-MM-DD
  slug: string;
  title: string;
  startTime?: string;  // HH:MM
  durationMinutes?: number;
  location?: string;
  host?: string;
  url?: string;
  status: "scheduled" | "cancelled" | "completed";
  body: string;
}

export function composeEventReadme(input: EventAuthorInput): string {
  // Build snake_case frontmatter (matches existing event files; lib/events.ts normalizes back to camelCase on read)
  const lines: string[] = ["---"];
  lines.push(`date: ${input.date}`);
  lines.push(`slug: "${input.slug}"`);
  lines.push(`title: ${quoteYamlString(input.title)}`);
  if (input.startTime) lines.push(`start_time: "${input.startTime}"`);
  if (input.durationMinutes !== undefined) lines.push(`duration_minutes: ${input.durationMinutes}`);
  if (input.location) lines.push(`location: ${quoteYamlString(input.location)}`);
  if (input.host) lines.push(`host: "${input.host}"`);
  if (input.url) lines.push(`url: "${input.url}"`);
  lines.push(`status: "${input.status}"`);
  lines.push("---");
  lines.push("");
  // H80: body cannot start with "---\n" — that would create a second frontmatter block
  const sanitizedBody = input.body.replace(/^---\s*\n/g, "");
  lines.push(sanitizedBody);
  return lines.join("\n");
}

// deriveEventSlug — slugify(title) prepended with date; sanitize to kebab-lowercase-alnum
export function deriveEventSlug(date: string, title: string): string {
  const titleSlug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "") // strip accents/punctuation
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60); // cap suffix at 60 chars
  return `${date}-${titleSlug}`;
}

// quoteYamlString — minimal quoting for the YAML emitter (single-line strings only)
function quoteYamlString(s: string): string {
  // Wrap in double quotes; escape backslash + double quote
  const escaped = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}
```

**Pure + side-effect-free** → trivially testable. 100% lines + branches coverage realistic. Mirrors `composeProfile` in `lib/profile-editor.ts` (same shape, same role).

---

## 5. Hardenings — H69 through H80

| ID | Hardening | Where enforced | Test block | Precedent |
|---|---|---|---|---|
| H69 | RBAC oracle defense — collapse no-session ∪ not-admin into single error | `create-event.ts:33-37` | `describe("H69:")` | `mint-invitation.ts:34-40` |
| H70 | Slug collision via snapshot — refuse if exists | `create-event.ts:56-58` | `describe("H70:")` | new |
| H71 | Slug shape — `EventSlugSchema` (kebab + calendar-valid date) | `create-event.ts:51-54` | `describe("H71:")` | `lib/events.ts:6-24` |
| H72 | Round-trip parse — `composeEventReadme` output re-parses cleanly | `create-event.ts:79-84` | `describe("H72:")` | new |
| H73 | CRLF strip on session-derived handle in commit message | `create-event.ts:96` | `describe("H73:")` | `rsvp-event.ts:100` |
| H74 | Path constructed server-side from validated slug only | `create-event.ts:88` | `describe("H74:")` | implicit in rsvp-event |
| H75 | Status default — `"scheduled"` hard-coded server-side | `create-event.ts:73` | `describe("H75:")` | new |
| H76 | Body size cap — 50 KB | `create-event.ts:CreateEventInputSchema body field` | `describe("H76:")` | new |
| H77 | Date Zod — `^\d{4}-\d{2}-\d{2}$` regex (calendar validity from H71's EventSlugSchema) | `create-event.ts:CreateEventInputSchema date field` | `describe("H77:")` | `lib/events.ts:30` |
| H78 | GitHub-level pre-existence guard — `readFile` must be null | `create-event.ts:89-91` | `describe("H78:")` | new |
| H79 | Revalidate fan-out — `/events`, `/events/<slug>`, `/home`, `/`, `/api/calendar.ics` | `create-event.ts:118-122` | `describe("H79:")` | partial `rsvp-event.ts:176-177` |
| H80 | Body cannot inject second frontmatter block — strip leading `---\n` | `event-author.ts composeEventReadme` | `describe("H80:")` | new |

**Coverage of risk surfaces:**
- **Authorization** — H69 (RBAC).
- **Input validation** — H70, H71, H76, H77.
- **Output integrity** — H72, H75, H80.
- **Path / injection** — H73, H74, H78.
- **Reactivity** — H79.

**12 hardenings — every one greppable + testable**. Hardening density (12 / 1 surface) is high but matches v0.1.1 invitation density (13 / 1 surface) because admin write to canonical content has comparable risk shape.

---

## 6. ADR-0015 candidate

**Filename:** `docs/decisions/0015-admin-write-permissions-for-events.md` (next free ADR number; ADR-0014 was v0.4 anonymous landing).

**Shape (follows `adr-writer` skill template):**

- **Title:** Admin write permissions for events
- **Status:** Proposed (becomes Accepted at v0.5 ship)
- **Context:**
  - Events ship as canonical content (`community/events/<slug>/README.md`); they're the basis for `/events`, `/events/[slug]`, `/api/calendar.ics`, and the anonymous landing "Next event" slot.
  - Today, event creation requires git access (clone, edit, commit, push) — a 5-minute mobile friction point.
  - Cadence is climbing toward weekly events; mobile creation needs to be a 30-second flow.
- **Options considered:**
  1. **Admin-only direct commit** — admin form commits straight to main via warsaw-ai-bot. Matches every other write surface (profile, RSVP, thanks, consent). **Recommended.**
  2. **Admin-only PR-based** — form opens a PR; admin merges. Adds round-trip latency without value (admin reviewing their own PR is theater).
  3. **Member-proposed with admin moderation** — defer; needs its own brainstorm (governance, spam risk, moderation flow). Premature for v0.5.
- **Decision:** Option 1 — admin-only direct commit via warsaw-ai-bot. Member-proposed events deferred to a future ADR.
- **Easier:** event creation latency drops from ~5 min to ~30 sec; mobile event creation becomes viable; consistent write pattern with profile / RSVP / thanks.
- **Harder:**
  - Single admin can spam events (manipulation-resistance vector). Mitigated by:
    - Audit trail (every commit signed by warsaw-ai-bot + Co-Authored-By admin handle).
    - `isAdmin()` list is short (≤3 names) and tracked in `community/members/roster.md` `admin: true` flag.
    - 12 hardenings (H69–H80) prevent injection-style abuse.
  - Member-proposed events require a future ADR + design pass — backlog parking spot is the chat-29 V0_5_BACKLOG entry.
- **Supersedes:** none.
- **Implementation references:** `app/admin/events/new/page.tsx`, `app/actions/create-event.ts`, `lib/event-author.ts`.

**Why this is its own ADR rather than folded into a bigger v0.5 ADR:** the write-permission model is one decision (admin-only vs PR-based vs member-proposed). Folding it into a multi-decision v0.5 ADR makes superseding harder when member-proposed events eventually ship.

---

## 7. Testing strategy (TDD per ~/.claude/TDD.md)

### Unit — `tests/unit/event-author.test.ts`

- `composeEventReadme` with all fields → string roundtrips through `gray-matter` + `parseEventFrontmatter` (H72-style guard).
- `composeEventReadme` with optional fields omitted → frontmatter omits them (matches `_template/README.md` pattern of commented-out optional keys; actual emitted YAML just omits, doesn't comment).
- `composeEventReadme` H80 guard — body starting with `---\n` gets the leading triple-dash stripped.
- `composeEventReadme` with multi-line title — YAML escape produces parseable output.
- `composeEventReadme` with embedded `"` in title/location — escaping works.
- `deriveEventSlug` happy path — `"AI Community | Meetup #5"` + `"2026-05-28"` → `"2026-05-28-ai-community-meetup-5"`.
- `deriveEventSlug` edge cases — empty title (returns `<date>-`, which fails `EventSlugSchema` downstream — acceptable since action catches that), unicode accents (NFKD strips), max length (60-char suffix cap), double-spaces, leading/trailing whitespace.

**Coverage target:** 100% lines / 100% branches on `event-author.ts`. Pure function — achievable.

### Unit — `tests/unit/create-event-action.test.ts` (mocked `GitHubAppClient`)

12 `describe` blocks, one per hardening:

- `describe("H69: RBAC oracle defense")` — 3 sub-cases: no session, signed in non-admin, signed in admin. First two return identical error; third proceeds.
- `describe("H70: slug collision via snapshot")` — mock snapshot with existing slug; action returns `slug_exists` without calling GitHub.
- `describe("H71: slug shape rejection")` — invalid kebab, non-calendar date (e.g. `2026-02-31`), missing date prefix.
- `describe("H72: round-trip parse")` — composed README always re-parses (this is a property-style test; harder to construct a failing input, but the test asserts the action *would* refuse if composed README failed to parse).
- `describe("H73: CRLF in handle stripped")` — mock auth returns handle with CR/LF; commit message has no `\r`/`\n`.
- `describe("H74: path constructed server-side")` — even if form sends `slug=../../etc/passwd`, EventSlugSchema rejects → action never builds an arbitrary path.
- `describe("H75: status hard-coded to scheduled")` — even if form sends `status=cancelled`, composed README has `status: "scheduled"`.
- `describe("H76: body size cap")` — body of 50_001 bytes → Zod fails → `invalid_input` (or its own `body_too_large` error if we want to differentiate UX).
- `describe("H77: date Zod regex")` — `date=not-a-date` → fail.
- `describe("H78: GitHub-level pre-existence guard")` — `gh.readFile` returns non-null → action returns `slug_exists` without calling `writeFile`.
- `describe("H79: revalidate fan-out")` — on success, `revalidatePath` is called for `/events`, `/events/<slug>`, `/home`, `/`, `/api/calendar.ics` (5 calls).
- `describe("H80: body frontmatter injection guard")` — body starting with `---\nmalicious: true\n---\n` → composed README still has only the action's frontmatter block.

**Coverage target:** 100% lines on action; ≥80% branches (defensive fallbacks like `internal_error` on writeFile throw are acceptable).

### E2E — `e2e/v0-5-admin-events-new.spec.ts`

1 scenario — happy path:

```
test("admin can create a new event via /admin/events/new", async ({ page }) => {
  // 1. Sign in as admin (re-use existing auth fixture)
  await signInAsAdmin(page);
  // 2. Navigate to /admin/events/new
  await page.goto("/admin/events/new");
  // 3. Fill the form
  await page.fill("[name=title]", "E2E Test Event");
  await page.fill("[name=date]", "2099-01-15");
  await page.fill("[name=location]", "Test Location");
  await page.fill("[name=body]", "Test body content.\n\n## Agenda\n1. Test item.");
  // 4. Submit
  await page.click("button[type=submit]");
  // 5. Expect redirect to /events/<slug>
  await page.waitForURL(/\/events\/2099-01-15-e2e-test-event$/);
  // 6. Page renders new event content
  await expect(page.locator("h1")).toContainText("E2E Test Event");
});
```

**NOTE:** E2E happy path commits to git, which is destructive against any real repo. The plan-writing chat (post-spec-lock) needs to decide:
- Option A — point E2E at a sandbox repo via `GITHUB_REPO_OWNER` / `GITHUB_REPO_NAME` env override.
- Option B — mock `gh.writeFile` at the route level (needs Playwright fixture for action call interception).
- Option C — skip E2E for v0.5; ship with unit + integration coverage only (acceptable per v0.3 precedent — Task 4.2 deferred its 14 scenarios to v0.4).

**Recommend Option C for v0.5 MVP** (matches v0.3 precedent of deferring E2E until UI surfaces stabilize). Re-evaluate Option A in v0.5.1+.

---

## 8. Open questions for v0.5 spec lock (not chat-31 decisions)

| ID | Question | Recommended answer | Re-evaluate at |
|---|---|---|---|
| O1 | Post-submit redirect to `/events/<slug>` or stay on form? | Redirect — matches saveProfile pattern | v0.5 spec lock |
| O2 | Re-use `/api/preview-markdown` for body preview? | Yes — zero new infra, big UX win | v0.5 spec lock |
| O3 | Slug field — auto-derive read-only OR editable with placeholder? | Editable with placeholder — admin sees what they'll commit | v0.5 spec lock |
| O4 | Pre-fill body from `_template/README.md`? | Yes — mirrors what admin does manually today | v0.5 spec lock |
| O5 | Reject `date < today`? | Allow back-dating with UI warning — real workflow for retroactive write-ups | v0.5 spec lock |
| O6 | E2E happy path — option A (sandbox repo), B (mock), or C (skip)? | C (skip for MVP) — matches v0.3 deferral precedent | v0.5 plan-writing |
| O7 | `/admin/events` index page (list all events with edit links)? | No for v0.5; deferred to tier 2 v0.5.1 | v0.5.1 brainstorm |
| O8 | Mobile form ergonomics — single column or multi-step wizard? | Single column with native HTML date/time inputs — wizard is overengineering for 8 fields | v0.5 spec lock |
| O9 | Show derived slug live as user types title? | Yes — non-blocking; pure client-side; uses `deriveEventSlug` lib | v0.5 spec lock |
| O10 | Submit button label — "Create event" or "Commit event"? | "Create event" — user-facing language, not git jargon | v0.5 spec lock |
| O11 | Where does form initial-fill default `host` come from when admin is impersonating? | `session.githubHandle` — admin = host by default; admin can override | v0.5 spec lock |
| O12 | Audit logging beyond commit history? | No — git commit log + warsaw-ai-bot identity + Co-Authored-By is the audit trail | v0.5 spec lock |

---

## 9. Acceptance criteria (v0.5 tier 1 ship)

1. Admin user (Anton) can sign in → `/admin/events/new` → fill form → submit → see new event on `/events/<slug>` within 2 min (Vercel rebuild + content-snapshot regen + revalidate).
2. Anonymous user sees the new event in `/events`, `/api/calendar.ics`, anonymous landing's "Next event" slot within 5 min (300s ICS cache TTL).
3. Non-admin user signed in → `/admin/events/new` redirects to `/home`.
4. Direct POST to action endpoint without admin session returns `{ ok: false, error: "not_authorized" }`.
5. Slug collision returns `slug_exists` without overwriting.
6. All 12 hardenings (H69–H80) have at least one `describe("H<n>:")` test block; full unit + integration suite passes.
7. `pnpm tsc --noEmit` clean.
8. `pnpm lint` clean.
9. Coverage report shows: `lib/event-author.ts` 100% lines + branches; `app/actions/create-event.ts` 100% lines + ≥80% branches.
10. CI green (Lint+typecheck+test+build).
11. Production smoke (anonymous + admin) post-merge: anonymous sees new event; admin's commit appears on main with warsaw-ai-bot author + Co-Authored-By trailer.
12. ADR-0015 status: Accepted at ship.

---

## 9a. Known limitation — multi-admin slug race (accepted for v0.5)

H78's pre-existence guard (`gh.readFile` must return null) is not atomic with the subsequent `writeFile`. If two admins create the same slug within the same ~1 sec window, both see `readFile === null`, both call `writeFile`, GitHub returns 422 to the second one, and the action returns `internal_error`. On the second admin's retry, `readFile` returns the now-existing file → `slug_exists`. **Acceptable for v0.5** because:

- Admin pool is ~3 names; concurrent admin event creation is vanishingly rare.
- Failure mode is non-destructive (second admin's work isn't silently lost — they see an error, retry, and get a clear `slug_exists`).
- Atomic compare-and-create requires `commitMultipleFiles` (multi-file commit API) and a more complex code path; not worth the v0.5 scope.

**Re-evaluate** if admin pool grows to ≥5 OR a real race is observed in CHANGELOG.

## 10. NOT in v0.5 (explicit defers)

- Edit form (`/admin/events/<slug>/edit`) — tier 2, v0.5.1.
- Status flip (cancel / complete) — tier 3, v0.5.2.
- Member-proposed events with admin moderation — v1.0+; own brainstorm.
- Image upload — v0.6+ if hero images become a design requirement.
- `/admin/events` index page — v0.5.1 when edit form ships.
- `pitch.md` / `outcomes.md` / `artifacts/` editing — post-event content; out of scope for *creation* UI.
- Recurring event templates — v0.6+ if cadence stabilizes.
- Polish localization of form labels — paired with v0.5+ next-intl track.

---

## 11. Out-of-band dependencies before v0.5 ship

- `lib/community-defaults.ts` `getDefaults()` returns `{ timezone, meetings: {...}, events: { defaultStartTime, defaultDurationMinutes, defaultLocation } }` — already shipped v0.3 per `spec.md` §13.6. **CONFIRMED 2026-05-20 via source read.**
- `lib/content-snapshot.ts isAdmin()` already exposed per `/admin/invite` page line 3. **CONFIRMED 2026-05-20 via source read.**
- `/api/preview-markdown` already exists per v0.2 (`spec.md` §12.7). Re-confirm route + tests still green at v0.5 start.
- `lib/github-app.ts gh.writeFile` accepts new-file semantics — `WriteOptions.sha?: string` is optional (line 21). **CONFIRMED 2026-05-20 via source read** — new file creation = omit `sha` from options object.
- `lib/events.ts` `normalizeEventFrontmatter` is currently `function`-scope private (line 84) but the round-trip parse in `create-event.ts` needs it. **Action item for plan-writing:** export it as `export function normalizeEventFrontmatter` so the action can re-use the same snake_case → camelCase normalization that `listEventsFromDisk` does. Trivial 1-character edit (`function` → `export function`); no risk of import-cycle since `events.ts` doesn't import from `event-author.ts`.

---

## 12. Effort estimate

- Day 1 — lib (`event-author.ts`) + unit tests TDD; ADR-0015 draft.
- Day 2 — action (`create-event.ts`) + 12 hardening test blocks TDD.
- Day 3 — page (`page.tsx`) + form (`EventForm.tsx`) + integration tests for the page+form+action wire-up.
- Day 4 — security-reviewer + code-reviewer + typescript-reviewer dispatch; fixups; ship.

**Total: 3–4 days.** Single-chat-feasible via `superpowers:subagent-driven-development` once spec is locked + plan is written.

---

## 13. References

- **Pattern precedent**: `projects/community-platform/app/admin/invite/page.tsx` (chat-9, v0.1.1 ship).
- **Action precedent**: `projects/community-platform/app/actions/mint-invitation.ts` (RBAC oracle defense), `app/actions/rsvp-event.ts` (GitHub App SHA-gated writes + CRLF strip + revalidate fan-out).
- **Lib precedent**: `projects/community-platform/lib/profile-editor.ts composeProfile` (pure compose function pattern).
- **Read path**: `projects/community-platform/lib/events.ts` (`EventSlugSchema`, `parseEventFrontmatter`, `listEventsFromDisk`).
- **Event template**: `community/events/_template/README.md` (frontmatter shape).
- **Existing event**: `community/events/2026-05-21-meetup-4/README.md` (real-world reference).
- **ADR-writer skill**: invoked at v0.5 spec-lock chat to draft ADR-0015 from this seed's §6.
- **Backlog entry**: `projects/community-platform/V0_5_BACKLOG.md` chat-29 admin event-creation UI section.
- **Memory**: `[[project_community_platform_v0_4_ship]]`, `[[feedback_ia_defer_future_placement]]`, `[[feedback_pr_vs_direct]]`.

---

## 14. Next-chat handoff (v0.5 spec-lock chat)

When the v0.5 brainstorm chat fires:

1. Read this seed + V0_5_BACKLOG.md + chat-22 brainstorm output (for full v0.5 scope context).
2. Lock O1–O12 via questionnaire or recommendations-defaults.
3. Fold into `projects/community-platform/spec.md` as §15 (or a v0.5 subsection structure to be decided then).
4. Draft ADR-0015 via `adr-writer` skill from §6 of this seed.
5. Run `superpowers:writing-plans` to produce `v0.5.0-plan.md` with tasks broken down across Day 1–4 phases.
6. Implementation chat runs `superpowers:subagent-driven-development` against the plan.

This seed is intentionally SCOPE-1 only — it doesn't pre-commit any v0.5+ scope outside `/admin/events/new`. Other v0.5 features (cmd-K + GBrain, Personas v2, Skills+Tools+Reps directory, Polish localization, dark mode) live in V0_5_BACKLOG.md and get their own brainstorm seeds when ready.

---

*Chat-31 brainstorm output. Authored 2026-05-20 by Anton + Claude via `superpowers:brainstorming`. Slots into a future v0.5 spec-lock chat (no implementation in chat-31 per the chat-30→chat-31 handoff's "v0.5+ scope creep" anti-pattern).*
