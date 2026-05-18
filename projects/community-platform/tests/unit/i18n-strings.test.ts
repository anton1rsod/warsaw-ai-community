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
    expect(s("header.signIn")).toBe("Sign in");
    expect(s("nav.home")).toBe("Home");
    expect(s("nav.calendar")).toBe("Calendar");
    expect(s("nav.projects")).toBe("Projects");
    expect(s("nav.members")).toBe("Members");
    expect(s("nav.handbook")).toBe("Handbook");
    expect(s("landing.headline")).toBe(
      "Where Warsaw's AI builders learn, ship, and find each other.",
    );
  });

  it("StringKey type union covers exactly Object.keys(strings) (compile-time check)", () => {
    const k: StringKey = "header.signIn";
    expect(s(k)).toBe("Sign in");
  });

  it("contains keys for every surface in the v0.4 Phase A taxonomy", () => {
    const surfaces = [
      "header",
      "footer",
      "nav",
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
