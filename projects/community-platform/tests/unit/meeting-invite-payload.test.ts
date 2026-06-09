import { describe, it, expect } from "vitest";
import { mintToken, verifyToken, InvitePayloadSchema } from "@/lib/invitations";

const SECRET = "x".repeat(32);
const future = () => Math.floor(Date.now() / 1000) + 3600;

describe("H123: meeting-invite payload backward-compatibility", () => {
  it("verifies a legacy token with no kind (treated as single downstream)", () => {
    const token = mintToken({ jti: "11111111-2222-4333-8444-555555555555", iss: "anton1rsod", exp: future() }, SECRET);
    const v = verifyToken(token, SECRET);
    expect(v).not.toBeNull();
    expect(v?.kind).toBeUndefined();
  });

  it("round-trips a meeting token carrying kind + max_uses", () => {
    const token = mintToken({ jti: "22222222-2222-4333-8444-555555555555", iss: "anton1rsod", exp: future(), kind: "meeting", max_uses: 50 }, SECRET);
    const v = verifyToken(token, SECRET);
    expect(v?.kind).toBe("meeting");
    expect(v?.max_uses).toBe(50);
  });

  it("rejects an unknown kind value", () => {
    expect(InvitePayloadSchema.safeParse({ jti: "33333333-2222-4333-8444-555555555555", iss: "x", exp: future(), kind: "bulk" }).success).toBe(false);
  });
});
