import { describe, expect, it } from "vitest";
import path from "node:path";
import {
  loadStarterPack,
  resolveStarterPackItems,
} from "@/lib/starter-pack";
import {
  listDecisionsFromSnapshot,
  listProjectDetails,
  listEventsFromSnapshot,
  listMembers,
} from "@/lib/content-snapshot";

/**
 * H113 — build-time guarantee: every starter-pack.md slug resolves to a
 * real artifact in the content snapshot. A failing test here means
 * either (a) starter-pack.md references a slug that doesn't exist, or
 * (b) an artifact got renamed/deleted without updating starter-pack.md.
 *
 * Adaptation from plan: plan referenced `listProjectsFromSnapshot` which
 * does not exist; the actual export is `listProjectDetails` (content-snapshot.ts line 73).
 * ProjectDetail has no `excerpt` field — using "" fallback per plan B.5 note.
 * Decision/Event also have no `excerpt` — using "" fallback.
 * MemberWithProfile uses `name` (not `title`) — mapped to `title` below.
 */
describe("H113 — community/starter-pack.md slug-resolution guard", () => {
  it("every committed slug resolves against the live content snapshot", async () => {
    const repoRoot = path.resolve(process.cwd(), "..", "..");
    const realPath = path.join(repoRoot, "community", "starter-pack.md");
    const pack = await loadStarterPack(realPath);

    const snapshot = {
      decisions: listDecisionsFromSnapshot().map((d) => ({
        slug: d.slug,
        title: d.title,
        excerpt: "",
      })),
      projects: listProjectDetails().map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: "",
      })),
      events: listEventsFromSnapshot().map((e) => ({
        slug: e.slug,
        title: e.title,
        excerpt: "",
      })),
      // Statuses are bot-managed; v0.10.0 starter pack should not reference
      // a specific week/handle directly — leave empty pool so any `status`
      // type entry surfaces as unresolved (caller should rotate to a real
      // status only via the §8 member-spotlight flip post-Day-14).
      statuses: [],
      members: listMembers().map((m) => ({
        slug: m.slug,
        title: m.name ?? m.slug,
        excerpt: "",
      })),
    };

    const resolved = resolveStarterPackItems(pack.items, snapshot);

    const unresolved = pack.items
      .map((item, idx) => ({ item, resolved: resolved[idx] }))
      .filter((row) => row.resolved === null);

    expect(unresolved).toEqual([]);
  });
});
