import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", () => ({ isAdmin: vi.fn() }));
vi.mock("@/lib/env", () => ({ env: { INVITE_SECRET: "x".repeat(32), NEXTAUTH_URL: "https://platform.example.com" } }));

import { mintMeetingInvitation } from "@/app/actions/mint-meeting-invitation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { verifyToken } from "@/lib/invitations";

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("mintMeetingInvitation server action (H134)", () => {
  it("mints a meeting token + QR for an admin", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const fd = new FormData();
    fd.set("expiry_hours", "4");
    fd.set("max_uses", "30");
    const r = await mintMeetingInvitation(fd);
    expect(r.error).toBeUndefined();
    expect(r.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(r.jti).toMatch(/[0-9a-f-]{36}/);
    const token = new URL(r.url ?? "").searchParams.get("token") ?? "";
    const v = verifyToken(token, "x".repeat(32));
    expect(v?.kind).toBe("meeting");
    expect(v?.max_uses).toBe(30);
  });
  it("rejects a non-admin (H134)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "regular" } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const r = await mintMeetingInvitation(new FormData());
    expect(r.error).toMatch(/not authorized/i);
    expect(r.url).toBeUndefined();
  });
  it("clamps a too-long expiry and defaults max_uses", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const fd = new FormData();
    fd.set("expiry_hours", "999");
    const r = await mintMeetingInvitation(fd);
    const token = new URL(r.url ?? "").searchParams.get("token") ?? "";
    const v = verifyToken(token, "x".repeat(32));
    const ttl = (v?.exp ?? 0) - Math.floor(Date.now() / 1000);
    expect(ttl).toBeLessThanOrEqual(24 * 3600 + 5);
    expect(v?.max_uses).toBe(50); // MEETING_MAX_USES_DEFAULT
  });
});
