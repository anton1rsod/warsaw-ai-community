import { NextResponse, type NextRequest } from "next/server";
import { encode } from "next-auth/jwt";
import { env } from "@/lib/env";

const COOKIE_NAME = "authjs.session-token";

/**
 * Dev/test-only route: forge a NextAuth-compatible session cookie for any
 * GitHub handle. Used by Playwright E2E tests to deterministically simulate
 * authenticated states without going through real OAuth.
 *
 * **Hard-gated to non-production environments.** Returns 404 in production.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("invalid JSON body", { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { handle?: unknown }).handle !== "string"
  ) {
    return new NextResponse("handle (string) required", { status: 400 });
  }
  const handle = (body as { handle: string }).handle;
  if (handle.length === 0) {
    return new NextResponse("handle required", { status: 400 });
  }

  const token = await encode({
    token: { githubHandle: handle.toLowerCase() },
    secret: env.NEXTAUTH_SECRET,
    salt: COOKIE_NAME,
  });

  const res = NextResponse.json({ ok: true, handle: handle.toLowerCase() });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  return res;
}
