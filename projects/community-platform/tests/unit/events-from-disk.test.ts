import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { listEventsFromDisk } from "@/lib/events";

describe("listEventsFromDisk (chat-29 fix — wire community/events into snapshot)", () => {
  let tmpRoot: string;
  let eventsDir: string;

  beforeEach(async () => {
    tmpRoot = await mkdtemp(path.join(tmpdir(), "events-from-disk-"));
    eventsDir = path.join(tmpRoot, "community", "events");
    await mkdir(eventsDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpRoot, { recursive: true, force: true });
  });

  async function seedEvent(folderName: string, body: string): Promise<void> {
    const folder = path.join(eventsDir, folderName);
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, "README.md"), body, "utf-8");
  }

  it("returns empty array when community/events does not exist", async () => {
    const emptyRoot = await mkdtemp(path.join(tmpdir(), "events-empty-"));
    try {
      const events = await listEventsFromDisk(emptyRoot);
      expect(events).toEqual([]);
    } finally {
      await rm(emptyRoot, { recursive: true, force: true });
    }
  });

  it("returns empty array when community/events is empty", async () => {
    const events = await listEventsFromDisk(tmpRoot);
    expect(events).toEqual([]);
  });

  it("reads a single event with minimal frontmatter (chat-29 baseline)", async () => {
    await seedEvent(
      "2026-05-21-meetup-4",
      `---
date: 2026-05-21
slug: "2026-05-21-meetup-4"
title: "AI Community | Meetup #4"
---

# AI Community | Meetup #4

Body content.
`,
    );
    const events = await listEventsFromDisk(tmpRoot);
    expect(events).toHaveLength(1);
    expect(events[0]?.slug).toBe("2026-05-21-meetup-4");
    expect(events[0]?.title).toBe("AI Community | Meetup #4");
    expect(events[0]?.date).toBe("2026-05-21");
    expect(events[0]?.status).toBe("scheduled");
  });

  it("maps snake_case frontmatter to camelCase Event fields (start_time → startTime, duration_minutes → durationMinutes)", async () => {
    await seedEvent(
      "2026-05-21-meetup-4",
      `---
date: 2026-05-21
slug: "2026-05-21-meetup-4"
title: "Meetup"
start_time: "19:00"
duration_minutes: 120
location: "Grzybowska 85a, Warsaw"
host: "anton1rsod"
---

# Meetup
`,
    );
    const events = await listEventsFromDisk(tmpRoot);
    const event = events[0];
    expect(event?.startTime).toBe("19:00");
    expect(event?.durationMinutes).toBe(120);
    expect(event?.location).toBe("Grzybowska 85a, Warsaw");
    expect(event?.host).toBe("anton1rsod");
  });

  it("skips folders starting with _ (template directory)", async () => {
    await seedEvent(
      "_template",
      `---
date: 2026-01-01
slug: "_template"
title: "Template"
---
`,
    );
    await seedEvent(
      "2026-05-21-meetup-4",
      `---
date: 2026-05-21
slug: "2026-05-21-meetup-4"
title: "Real event"
---
`,
    );
    const events = await listEventsFromDisk(tmpRoot);
    expect(events).toHaveLength(1);
    expect(events[0]?.slug).toBe("2026-05-21-meetup-4");
  });

  it("skips non-directory entries in community/events", async () => {
    await writeFile(path.join(eventsDir, "README.md"), "# Events index\n", "utf-8");
    await seedEvent(
      "2026-05-21-meetup-4",
      `---
date: 2026-05-21
slug: "2026-05-21-meetup-4"
title: "Event"
---
`,
    );
    const events = await listEventsFromDisk(tmpRoot);
    expect(events).toHaveLength(1);
  });

  it("sorts events by date ascending (earliest first)", async () => {
    await seedEvent(
      "2026-07-15-later-event",
      `---
date: 2026-07-15
slug: "2026-07-15-later-event"
title: "Later"
---
`,
    );
    await seedEvent(
      "2026-05-21-earlier-event",
      `---
date: 2026-05-21
slug: "2026-05-21-earlier-event"
title: "Earlier"
---
`,
    );
    await seedEvent(
      "2026-06-10-middle-event",
      `---
date: 2026-06-10
slug: "2026-06-10-middle-event"
title: "Middle"
---
`,
    );
    const events = await listEventsFromDisk(tmpRoot);
    expect(events.map((e) => e.slug)).toEqual([
      "2026-05-21-earlier-event",
      "2026-06-10-middle-event",
      "2026-07-15-later-event",
    ]);
  });

  it("throws when folder name does not match frontmatter slug (H44 propagation)", async () => {
    await seedEvent(
      "2026-05-21-meetup-4",
      `---
date: 2026-05-21
slug: "2026-05-21-different-slug"
title: "Mismatched"
---
`,
    );
    await expect(listEventsFromDisk(tmpRoot)).rejects.toThrow(
      /does not match frontmatter slug/,
    );
  });

  it("throws on missing required fields (Zod validation propagates)", async () => {
    await seedEvent(
      "2026-05-21-meetup-4",
      `---
date: 2026-05-21
slug: "2026-05-21-meetup-4"
---

# No title
`,
    );
    await expect(listEventsFromDisk(tmpRoot)).rejects.toThrow();
  });

  it("preserves status field (cancelled/completed)", async () => {
    await seedEvent(
      "2026-05-21-meetup-4",
      `---
date: 2026-05-21
slug: "2026-05-21-meetup-4"
title: "Cancelled meetup"
status: "cancelled"
---
`,
    );
    const events = await listEventsFromDisk(tmpRoot);
    expect(events[0]?.status).toBe("cancelled");
  });

  it("ignores README files inside subfolders other than the event folder README.md", async () => {
    const folder = path.join(eventsDir, "2026-05-21-meetup-4");
    await mkdir(path.join(folder, "artifacts"), { recursive: true });
    await writeFile(
      path.join(folder, "README.md"),
      `---
date: 2026-05-21
slug: "2026-05-21-meetup-4"
title: "Event"
---
`,
      "utf-8",
    );
    await writeFile(
      path.join(folder, "artifacts", "notes.md"),
      "# Sub-file should be ignored\n",
      "utf-8",
    );
    const events = await listEventsFromDisk(tmpRoot);
    expect(events).toHaveLength(1);
  });
});
