import { describe, it, expect } from "vitest";
import { verifyWebhookSecret } from "../../src/telegram/verify";

describe("verifyWebhookSecret", () => {
  it("returns true when headers match the expected secret", () => {
    const headers = new Headers({ "x-telegram-bot-api-secret-token": "abc" });
    expect(verifyWebhookSecret(headers, "abc")).toBe(true);
  });

  it("returns false on mismatch", () => {
    const headers = new Headers({ "x-telegram-bot-api-secret-token": "zzz" });
    expect(verifyWebhookSecret(headers, "abc")).toBe(false);
  });

  it("returns false when header is absent", () => {
    const headers = new Headers();
    expect(verifyWebhookSecret(headers, "abc")).toBe(false);
  });

  it("constant-time compare: different lengths do not throw", () => {
    const headers = new Headers({ "x-telegram-bot-api-secret-token": "short" });
    expect(() => verifyWebhookSecret(headers, "much-longer-expected")).not.toThrow();
    expect(verifyWebhookSecret(headers, "much-longer-expected")).toBe(false);
  });
});
