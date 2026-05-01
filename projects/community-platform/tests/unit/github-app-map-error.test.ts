import { describe, expect, it } from "vitest";
import { GitHubAppError, mapError } from "@/lib/github-app";

describe("mapError", () => {
  it("404 with Error → not_found, preserves message", () => {
    const e = Object.assign(new Error("nope"), { status: 404 });
    const mapped = mapError(e);
    expect(mapped).toBeInstanceOf(GitHubAppError);
    expect(mapped.kind).toBe("not_found");
    expect(mapped.message).toBe("nope");
    expect(mapped.cause).toBe(e);
  });

  it("409 → sha_conflict", () => {
    const e = Object.assign(new Error("conflict"), { status: 409 });
    expect(mapError(e).kind).toBe("sha_conflict");
  });

  it("403 → forbidden", () => {
    const e = Object.assign(new Error("forbidden"), { status: 403 });
    expect(mapError(e).kind).toBe("forbidden");
  });

  it("500 (unmapped status) → unknown", () => {
    const e = Object.assign(new Error("boom"), { status: 500 });
    expect(mapError(e).kind).toBe("unknown");
  });

  it("Error without status → unknown, message preserved", () => {
    const mapped = mapError(new Error("bare"));
    expect(mapped.kind).toBe("unknown");
    expect(mapped.message).toBe("bare");
  });

  it("Error with non-numeric status → unknown", () => {
    const e = Object.assign(new Error("weird"), { status: "404" });
    expect(mapError(e).kind).toBe("unknown");
  });

  it("plain object with status 404 → not_found, default message", () => {
    const mapped = mapError({ status: 404 });
    expect(mapped.kind).toBe("not_found");
    expect(mapped.message).toBe("github app error");
  });

  it("string rejection → unknown, message is the string", () => {
    const mapped = mapError("string-not-an-Error");
    expect(mapped.kind).toBe("unknown");
    expect(mapped.message).toBe("string-not-an-Error");
  });

  it("undefined → unknown, default message", () => {
    expect(mapError(undefined).kind).toBe("unknown");
    expect(mapError(undefined).message).toBe("github app error");
  });

  it("null → unknown, default message", () => {
    expect(mapError(null).kind).toBe("unknown");
    expect(mapError(null).message).toBe("github app error");
  });
});
