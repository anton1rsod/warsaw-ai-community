import { describe, it, expect } from "vitest";
import { createInMemoryPendingStore } from "../../src/pending/store";

describe("pending store (in-memory)", () => {
  it("enqueues and lists not-yet-flushable entries", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({
      id: "a",
      messagePath: "community/archive/2026-04/a.md",
      content: "x",
      commitMessage: "m",
      enqueuedAt: now
    });
    expect(s.listReady(new Date("2026-04-24T10:00:00Z"))).toHaveLength(0);
  });

  it("releases entries once 48h elapses", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({
      id: "a",
      messagePath: "community/archive/2026-04/a.md",
      content: "x",
      commitMessage: "m",
      enqueuedAt: now
    });
    const ready = s.listReady(new Date("2026-04-26T00:00:01Z"));
    expect(ready.map(e => e.id)).toEqual(["a"]);
  });

  it("cancel(id) removes an entry before flush", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({
      id: "a",
      messagePath: "community/archive/2026-04/a.md",
      content: "x",
      commitMessage: "m",
      enqueuedAt: now
    });
    s.cancel("a");
    expect(s.listReady(new Date("2026-04-30T00:00:00Z"))).toHaveLength(0);
  });

  it("remove(id) removes after flush so listReady no longer returns it", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({
      id: "a",
      messagePath: "community/archive/2026-04/a.md",
      content: "x",
      commitMessage: "m",
      enqueuedAt: now
    });
    const later = new Date("2026-04-26T00:00:01Z");
    const ready = s.listReady(later);
    for (const e of ready) s.remove(e.id);
    expect(s.listReady(later)).toHaveLength(0);
  });

  it("all() returns every entry including not-yet-ready ones", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({
      id: "a",
      messagePath: "community/archive/2026-04/a.md",
      content: "x",
      commitMessage: "m",
      enqueuedAt: now
    });
    s.enqueue({
      id: "b",
      messagePath: "community/archive/2026-04/b.md",
      content: "y",
      commitMessage: "m2",
      enqueuedAt: now
    });
    expect(s.all().map(e => e.id).sort()).toEqual(["a", "b"]);
  });
});
