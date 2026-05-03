import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", () => ({
  isAdmin: vi.fn(),
  findMemberByHandle: vi.fn(),
}));
vi.mock("@/lib/env", () => ({
  env: {
    INVITE_SECRET: "x".repeat(32),
    NEXTAUTH_URL: "https://platform.example.com",
  },
}));

import { mintInvitation } from "@/app/actions/mint-invitation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { verifyToken } from "@/lib/invitations";

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("mintInvitation server action", () => {
  it("returns a URL containing a verifiable token for an admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);

    const formData = new FormData();
    formData.set("hint_telegram", "@invitee");

    const result = await mintInvitation(formData);
    expect(result.url).toMatch(
      /^https:\/\/platform\.example\.com\/onboard\?token=[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
    );
    const url = new URL(result.url ?? "");
    const token = url.searchParams.get("token") ?? "";
    const verified = verifyToken(token, "x".repeat(32));
    expect(verified).not.toBeNull();
    expect(verified?.iss).toBe("anton1rsod");
    expect(verified?.hint_telegram).toBe("@invitee");
  });

  it("returns { error } for a non-admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "regular",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const result = await mintInvitation(new FormData());
    expect(result.url).toBeUndefined();
    expect(result.error).toMatch(/not authorized/i);
  });

  it("returns { error } for unauthenticated (collapsed with not-admin per security-reviewer M2)", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await mintInvitation(new FormData());
    expect(result.error).toMatch(/not authorized/i);
  });

  it("rejects invalid hint_telegram (Zod input validation)", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const formData = new FormData();
    formData.set("hint_telegram", "no-at-prefix");
    const result = await mintInvitation(formData);
    expect(result.error).toMatch(/invalid/i);
  });

  it("treats whitespace-only hint values as absent (emptyToUndef)", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const formData = new FormData();
    // Empty + whitespace strings exercise the second emptyToUndef branch
    // (`typeof v === "string" && v.trim() === ""` -> undefined). Without it
    // the empty string would fail Zod's hint_telegram regex.
    formData.set("hint_telegram", "");
    formData.set("hint_display_name", "   ");
    const result = await mintInvitation(formData);
    expect(result.error).toBeUndefined();
    const token = new URL(result.url ?? "").searchParams.get("token") ?? "";
    const verified = verifyToken(token, "x".repeat(32));
    expect(verified?.hint_telegram).toBeUndefined();
    expect(verified?.hint_display_name).toBeUndefined();
  });

  it("omits hint_telegram from token payload when absent", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const result = await mintInvitation(new FormData());
    const token = new URL(result.url ?? "").searchParams.get("token") ?? "";
    const verified = verifyToken(token, "x".repeat(32));
    expect(verified?.hint_telegram).toBeUndefined();
  });

  it("includes hint_display_name in token payload when supplied", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const formData = new FormData();
    formData.set("hint_display_name", "Jane Doe");
    const result = await mintInvitation(formData);
    const token = new URL(result.url ?? "").searchParams.get("token") ?? "";
    const verified = verifyToken(token, "x".repeat(32));
    expect(verified?.hint_display_name).toBe("Jane Doe");
    expect(verified?.hint_telegram).toBeUndefined();
  });
});
