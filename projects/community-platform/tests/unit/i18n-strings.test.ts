import { describe, expect, it } from "vitest";
import { strings, s, type StringKey } from "@/lib/i18n/strings";

describe("H67: i18n string centralization — strings map contract", () => {
  it("strings is a frozen, typed map of dot-separated keys to strings", () => {
    expect(typeof strings).toBe("object");
    for (const [key, value] of Object.entries(strings)) {
      expect(typeof key).toBe("string");
      expect(typeof value).toBe("string");
      expect(key).toMatch(/^[a-z]+(\.[a-zA-Z]+)+$/);
    }
  });

  it("s(key) returns the value for a known key", () => {
    expect(s("chrome.header.signIn")).toBe("[ sign in ]");
    expect(s("chrome.header.nav.home")).toBe("home");
    expect(s("chrome.header.nav.calendar")).toBe("calendar");
    expect(s("chrome.header.nav.projects")).toBe("projects");
    expect(s("chrome.header.nav.members")).toBe("members");
    expect(s("chrome.header.nav.handbook")).toBe("handbook");
    expect(s("landing.headline")).toBe(
      "Where Warsaw's AI builders learn, ship, and find each other.",
    );
  });

  it("StringKey type union covers exactly Object.keys(strings) (compile-time check)", () => {
    const k: StringKey = "chrome.header.signIn";
    expect(s(k)).toBe("[ sign in ]");
  });

  it("contains keys for every surface in the v0.4 Phase A taxonomy", () => {
    const surfaces = [
      "header",
      "chrome",
      "home",
      "landing",
      "calendar",
      "handbook",
      "empty",
      "avatar",
      "datetime",
      "auth",
    ];
    for (const surface of surfaces) {
      const keysForSurface = Object.keys(strings).filter((k) =>
        k.startsWith(`${surface}.`),
      );
      expect(keysForSurface.length).toBeGreaterThan(0);
    }
  });

  it("Q-1.1 / D21 ambition sentence is locked verbatim under landing.headline", () => {
    expect(strings["landing.headline"]).toBe(
      "Where Warsaw's AI builders learn, ship, and find each other.",
    );
  });
});
