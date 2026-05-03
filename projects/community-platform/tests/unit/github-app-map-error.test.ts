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

  it("401 → forbidden (token expiry mapped same as missing-scope)", () => {
    const e = Object.assign(new Error("unauthorized"), { status: 401 });
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

  it("strips authorization header from cause (Octokit RequestError shape)", () => {
    const e = Object.assign(new Error("forbidden"), {
      status: 403,
      request: {
        method: "PUT",
        url: "https://api.github.com/foo",
        headers: { authorization: "token ghs_secret", accept: "application/json" },
      },
    });
    const mapped = mapError(e);
    const cause = mapped.cause as {
      request?: { headers?: Record<string, unknown> };
    };
    expect(cause.request?.headers).not.toHaveProperty("authorization");
    expect(cause.request?.headers).toHaveProperty("accept", "application/json");
  });

  it("preserves cause when error has request but no headers (defensive sanitize path)", () => {
    const e = Object.assign(new Error("weird"), {
      status: 500,
      request: { method: "PUT", url: "https://api.github.com/foo" },
    });
    const mapped = mapError(e);
    expect(mapped.kind).toBe("unknown");
    // request object preserved as-is when no headers to strip
    expect((mapped.cause as { request?: unknown }).request).toEqual({
      method: "PUT",
      url: "https://api.github.com/foo",
    });
  });

  it("preserves cause when error has no request property (sanitize early return)", () => {
    const e = Object.assign(new Error("bare"), { status: 500 });
    const mapped = mapError(e);
    expect(mapped.kind).toBe("unknown");
    // Plain Error (no request prop) returned unchanged as cause.
    expect(mapped.cause).toBe(e);
  });
});
