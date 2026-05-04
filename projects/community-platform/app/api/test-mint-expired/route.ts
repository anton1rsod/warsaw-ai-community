import { NextResponse } from "next/server";
import { mintToken } from "@/lib/invitations";
import { env } from "@/lib/env";

/**
 * Dev/test-only route: mint a token with exp=1 (1970, immediately expired).
 * Used by Playwright Scenario 3. Hard-gated to non-production + E2E mode.
 */
export async function POST(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }
  if (process.env.NEXT_PUBLIC_E2E_MODE !== "1") {
    return new NextResponse(null, { status: 404 });
  }
  const token = mintToken(
    {
      jti: "00000000-0000-4000-8000-000000000001",
      iss: "anton1rsod",
      exp: 1,
    },
    env.INVITE_SECRET,
  );
  return NextResponse.json({ token });
}
