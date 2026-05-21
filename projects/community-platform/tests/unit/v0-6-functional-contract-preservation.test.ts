import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(rel: string): string {
  return readFileSync(resolve(__dirname, "../../", rel), "utf-8");
}

describe("H89: v0.6 visual refactor preserves functional contracts", () => {
  describe("EventRsvpButton (v0.4.7 hydration + v0.4.8 force-dynamic)", () => {
    const src = read("app/components/EventRsvpButton.tsx");
    it("preserves initialState prop + useEffect hydration fetch", () => {
      expect(src).toMatch(/initialState/);
      expect(src).toMatch(/profileSha/);
      expect(src).toMatch(/\/api\/event-rsvp-state\?slug=/);
    });
  });

  describe("/events/[slug] (v0.4.8 force-dynamic)", () => {
    const src = read("app/events/[slug]/page.tsx");
    it("export const dynamic = 'force-dynamic'", () => {
      expect(src).toMatch(/export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/);
    });
    it("calls loadViewerRsvp", () => {
      expect(src).toMatch(/loadViewerRsvp\(/);
    });
  });

  describe("EventForm (v0.5 admin event-creation)", () => {
    const src = read("app/components/EventForm.tsx");
    it("preserves controlled inputs + slug derivation client-side", () => {
      expect(src).toMatch(/deriveEventSlug/);
      expect(src).toMatch(/CreateEventResult/);
    });
  });

  describe("ProfileEditor (v0.2 SHA-gated save)", () => {
    const src = read("app/components/ProfileEditor.tsx");
    it("preserves SHA round-trip + REFRESH_NEEDED handling", () => {
      expect(src).toMatch(/sha/);
      expect(src).toMatch(/refresh_needed/i);
    });
  });

  describe("/events (v0.5.1 H86 force-dynamic)", () => {
    const src = read("app/events/page.tsx");
    it("export const dynamic = 'force-dynamic'", () => {
      expect(src).toMatch(/export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/);
    });
  });
});
