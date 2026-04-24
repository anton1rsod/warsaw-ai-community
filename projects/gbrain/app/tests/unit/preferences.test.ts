import { describe, it, expect } from "vitest";
import { createInMemoryPreferences } from "../../src/consent/preferences";

describe("preferences (in-memory)", () => {
  it("returns default (not opted out) for new author", async () => {
    const store = createInMemoryPreferences();
    const p = await store.get(1);
    expect(p.optedOut).toBe(false);
    expect(p.authorId).toBe(1);
  });

  it("persists optOut() and surfaces via get()", async () => {
    const store = createInMemoryPreferences();
    await store.optOut(1);
    expect((await store.get(1)).optedOut).toBe(true);
  });

  it("optIn() reverses optOut()", async () => {
    const store = createInMemoryPreferences();
    await store.optOut(7);
    await store.optIn(7);
    expect((await store.get(7)).optedOut).toBe(false);
  });
});
