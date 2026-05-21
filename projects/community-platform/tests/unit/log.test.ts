import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { log } from "@/lib/log";

describe("log", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("happy path — warn", () => {
    it("emits `[tag] event` when no fields", () => {
      log.warn("create-event", "submitted");
      expect(warnSpy).toHaveBeenCalledWith("[create-event] submitted");
    });
    it("emits `[tag] event {...fields}` with stringified fields", () => {
      log.warn("create-event", "submitted", { slug: "demo-2026", admin: true });
      expect(warnSpy).toHaveBeenCalledWith(
        '[create-event] submitted {"slug":"demo-2026","admin":true}',
      );
    });
    it("treats empty fields object as no fields", () => {
      log.warn("create-event", "submitted", {});
      expect(warnSpy).toHaveBeenCalledWith("[create-event] submitted");
    });
  });

  describe("happy path — error", () => {
    it("routes to console.error", () => {
      log.error("create-event", "writeFile_failed", { reason: "rate-limit" });
      expect(errorSpy).toHaveBeenCalledWith(
        '[create-event] writeFile_failed {"reason":"rate-limit"}',
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe("H85: empty tag rejected at runtime", () => {
    it("warn throws on empty tag", () => {
      expect(() => log.warn("", "event")).toThrow("log tag must be non-empty");
    });
    it("error throws on empty tag", () => {
      expect(() => log.error("", "event")).toThrow("log tag must be non-empty");
    });
  });

  describe("O6: JSON-serialization contract", () => {
    it("accepts primitives in fields", () => {
      log.warn("t", "e", { s: "x", n: 42, b: true, nil: null });
      expect(warnSpy).toHaveBeenCalledWith(
        '[t] e {"s":"x","n":42,"b":true,"nil":null}',
      );
    });
    it("accepts arrays in fields", () => {
      log.warn("t", "e", { tags: ["a", "b"] });
      expect(warnSpy).toHaveBeenCalledWith('[t] e {"tags":["a","b"]}');
    });
  });
});
