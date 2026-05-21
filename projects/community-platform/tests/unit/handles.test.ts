import { describe, expect, it } from "vitest";
import { safeHandle } from "@/lib/handles";

describe("safeHandle", () => {
  describe("happy path", () => {
    it("returns a clean handle unchanged", () => {
      expect(safeHandle("anton1rsod")).toBe("anton1rsod");
    });
  });

  describe("H83: CRLF strip + length cap post-condition", () => {
    it("strips carriage returns", () => {
      expect(safeHandle("anton\r1rsod")).toBe("anton1rsod");
    });
    it("strips line feeds", () => {
      expect(safeHandle("anton\n1rsod")).toBe("anton1rsod");
    });
    it("strips both CR and LF", () => {
      expect(safeHandle("anton\r\n1rsod")).toBe("anton1rsod");
    });
    it("caps output at 39 chars (GitHub username max)", () => {
      const input = "a".repeat(50);
      const out = safeHandle(input);
      expect(out.length).toBe(39);
      expect(out).toBe("a".repeat(39));
    });
    it("does not pad inputs shorter than 39", () => {
      expect(safeHandle("short").length).toBe(5);
    });
  });

  describe("H84: idempotency on already-safe input", () => {
    it("applying twice equals applying once", () => {
      const once = safeHandle("anton1rsod");
      const twice = safeHandle(once);
      expect(twice).toBe(once);
    });
    it("idempotency holds at the length cap", () => {
      const capped = safeHandle("b".repeat(60));
      expect(safeHandle(capped)).toBe(capped);
    });
  });

  describe("O4: throws on empty-after-strip", () => {
    it("throws on empty input", () => {
      expect(() => safeHandle("")).toThrow("empty handle");
    });
    it("throws when only CRLF chars present", () => {
      expect(() => safeHandle("\r\n\r\n")).toThrow("empty handle");
    });
  });
});
