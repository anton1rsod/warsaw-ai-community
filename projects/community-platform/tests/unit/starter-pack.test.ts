import { describe, expect, it } from "vitest";
import { StarterPackSchema, type StarterPackItem } from "@/lib/starter-pack";
import { loadStarterPack } from "@/lib/starter-pack";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

describe("StarterPackSchema (H114)", () => {
  it("accepts a valid items list of mixed artifact types", () => {
    const valid = {
      items: [
        { type: "decision", slug: "0016-telegram-echo-statuses" },
        { type: "project", slug: "gbrain" },
        { type: "event", slug: "2026-05-21-meetup-4" },
        { type: "status", slug: "2026-W22/anton1rsod" },
        { type: "member", slug: "anton-safronov" },
      ],
    };
    const result = StarterPackSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(5);
      const types = result.data.items.map((i: StarterPackItem) => i.type);
      expect(types).toEqual(["decision", "project", "event", "status", "member"]);
    }
  });

  it("rejects an unknown artifact type", () => {
    const invalid = {
      items: [{ type: "garbage", slug: "x" }],
    };
    const result = StarterPackSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a missing slug", () => {
    const invalid = {
      items: [{ type: "decision" }],
    };
    const result = StarterPackSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects fewer than 1 item", () => {
    const result = StarterPackSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 8 items (caps the curated set)", () => {
    const items = Array.from({ length: 9 }, () => ({
      type: "decision" as const,
      slug: "0001-oss-first-licensing",
    }));
    const result = StarterPackSchema.safeParse({ items });
    expect(result.success).toBe(false);
  });
});

describe("loadStarterPack", () => {
  it("loads a valid starter-pack.md file", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "starter-pack-test-"));
    const fpath = path.join(dir, "starter-pack.md");
    await fs.writeFile(
      fpath,
      [
        "---",
        "items:",
        "  - { type: decision, slug: 0016-telegram-echo-statuses }",
        "  - { type: project, slug: gbrain }",
        "---",
        "",
        "Initial seed 2026-05-28.",
        "",
      ].join("\n"),
    );

    const pack = await loadStarterPack(fpath);
    expect(pack.items).toHaveLength(2);
    expect(pack.items[0]).toEqual({ type: "decision", slug: "0016-telegram-echo-statuses" });
    expect(pack.items[1]).toEqual({ type: "project", slug: "gbrain" });
  });

  it("throws a descriptive error on invalid YAML", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "starter-pack-test-"));
    const fpath = path.join(dir, "starter-pack.md");
    await fs.writeFile(fpath, "---\nitems: [oops\n---\n");
    await expect(loadStarterPack(fpath)).rejects.toThrow(/starter-pack/i);
  });

  it("throws when items field is missing", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "starter-pack-test-"));
    const fpath = path.join(dir, "starter-pack.md");
    await fs.writeFile(fpath, "---\nfoo: bar\n---\n");
    await expect(loadStarterPack(fpath)).rejects.toThrow();
  });
});

import { resolveStarterPackItems } from "@/lib/starter-pack";

describe("resolveStarterPackItems", () => {
  it("resolves all 5 artifact types using the snapshot accessors", () => {
    const snapshot = {
      decisions: [
        { slug: "0016-telegram-echo-statuses", title: "ADR-0016 Telegram echo", excerpt: "Opt-in" },
      ],
      projects: [
        { slug: "gbrain", title: "GBrain", excerpt: "Telegram knowledge base" },
      ],
      events: [
        { slug: "2026-05-21-meetup-4", title: "Meetup #4", excerpt: "AI Community Meetup" },
      ],
      statuses: [
        { slug: "2026-W22/anton1rsod", title: "@anton1rsod — 2026-W22", excerpt: "Shipped v0.9.1.1" },
      ],
      members: [
        { slug: "anton-safronov", title: "Anton Safronov", excerpt: "Founder" },
      ],
    };
    const items: StarterPackItem[] = [
      { type: "decision", slug: "0016-telegram-echo-statuses" },
      { type: "project", slug: "gbrain" },
      { type: "event", slug: "2026-05-21-meetup-4" },
      { type: "status", slug: "2026-W22/anton1rsod" },
      { type: "member", slug: "anton-safronov" },
    ];

    const resolved = resolveStarterPackItems(items, snapshot);

    expect(resolved).toHaveLength(5);
    expect(resolved[0]).toMatchObject({
      type: "decision",
      slug: "0016-telegram-echo-statuses",
      kicker: "decision",
      title: "ADR-0016 Telegram echo",
      href: "/decisions/0016-telegram-echo-statuses",
    });
    expect(resolved[1]?.href).toBe("/projects/gbrain");
    expect(resolved[2]?.href).toBe("/events/2026-05-21-meetup-4");
    expect(resolved[3]?.href).toBe("/this-week"); // statuses link to /this-week (no per-status page in v0.10.0)
    expect(resolved[4]?.href).toBe("/members/anton-safronov");
  });

  it("returns null entries for unresolved slugs (H113 surfaces at build-time test, not at runtime)", () => {
    const snapshot = { decisions: [], projects: [], events: [], statuses: [], members: [] };
    const items: StarterPackItem[] = [{ type: "decision", slug: "nonexistent" }];

    const resolved = resolveStarterPackItems(items, snapshot);

    expect(resolved).toEqual([null]);
  });
});

describe("real starter-pack.md (smoke)", () => {
  it("loads + validates the committed community/starter-pack.md", async () => {
    const repoRoot = path.resolve(process.cwd(), "..", "..");
    const realPath = path.join(repoRoot, "community", "starter-pack.md");
    const pack = await loadStarterPack(realPath);
    expect(pack.items.length).toBeGreaterThanOrEqual(1);
    expect(pack.items.length).toBeLessThanOrEqual(8);
  });
});
