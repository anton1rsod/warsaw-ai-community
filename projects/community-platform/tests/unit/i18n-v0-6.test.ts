import { describe, it, expect } from "vitest";
import { s } from "@/lib/i18n/strings";

describe("v0.6 i18n keys (H88)", () => {
  describe("hero.anon.*", () => {
    it.each([
      "hero.anon.taglineLead",
      "hero.anon.taglineHighlight",
      "hero.anon.subtagline",
      "hero.anon.signInCta",
      "hero.anon.telegramCta",
    ])("resolves %s to a non-empty string", (key) => {
      const v = s(key as Parameters<typeof s>[0]);
      expect(v).toBeTypeOf("string");
      expect(v.length).toBeGreaterThan(0);
    });

    it("taglineLead is 'Warsaw AI'", () => {
      expect(s("hero.anon.taglineLead")).toBe("Warsaw AI");
    });

    it("taglineHighlight is 'public.'", () => {
      expect(s("hero.anon.taglineHighlight")).toBe("public.");
    });
  });

  describe("hero.home.*", () => {
    it.each([
      "hero.home.weekLabel",
      "hero.home.tonightLead",
      "hero.home.shipsLabelFmt",
      "hero.home.shipsEmpty",
    ])("resolves %s", (key) => {
      const v = s(key as Parameters<typeof s>[0]);
      expect(v).toBeTypeOf("string");
      expect(v.length).toBeGreaterThan(0);
    });
  });

  describe("events.index.*", () => {
    it.each([
      "events.index.title",
      "events.index.upcomingLabel",
      "events.index.pastLabel",
      "events.index.newEvent",
      "events.index.subscribeIcs",
    ])("resolves %s", (key) => {
      expect(s(key as Parameters<typeof s>[0])).toBeTypeOf("string");
    });
  });

  describe("events.detail.*", () => {
    it.each([
      "events.detail.monoLeadFmt",
      "events.detail.goingRosterFmt",
      "events.detail.interestedRosterFmt",
    ])("resolves %s", (key) => {
      expect(s(key as Parameters<typeof s>[0])).toBeTypeOf("string");
    });
  });

  describe("empty.* (warm copy)", () => {
    it.each([
      "empty.home.nextEvent",
      "empty.home.ships",
      "empty.events.upcoming",
      "empty.events.past",
      "empty.eventDetail.going",
      "empty.eventDetail.interested",
    ])("resolves %s", (key) => {
      const v = s(key as Parameters<typeof s>[0]);
      expect(v).toBeTypeOf("string");
      expect(v.length).toBeGreaterThan(0);
    });

    it("empty.home.ships matches the spec copy", () => {
      expect(s("empty.home.ships")).toBe(
        "Next ship lands when somebody commits.",
      );
    });

    it("empty.events.upcoming includes Telegram pointer (evergreen)", () => {
      expect(s("empty.events.upcoming")).toMatch(/Telegram/);
    });
  });

  describe("chrome.header.*", () => {
    it.each([
      "chrome.header.logo",
      "chrome.header.signIn",
      "chrome.header.nav.home",
      "chrome.header.nav.calendar",
      "chrome.header.nav.members",
      "chrome.header.nav.projects",
      "chrome.header.nav.handbook",
    ])("resolves %s", (key) => {
      expect(s(key as Parameters<typeof s>[0])).toBeTypeOf("string");
    });
  });

  describe("chrome.footer.*", () => {
    it.each([
      "chrome.footer.copyrightFmt",
      "chrome.footer.builtInPublic",
      "chrome.footer.about",
      "chrome.footer.telegram",
      "chrome.footer.github",
      "chrome.footer.license",
    ])("resolves %s", (key) => {
      expect(s(key as Parameters<typeof s>[0])).toBeTypeOf("string");
    });
  });
});
