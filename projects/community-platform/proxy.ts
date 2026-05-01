import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";

const PUBLIC_PATHS = new Set<string>(["/login", "/no-access"]);
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon"] as const;

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await auth();
  const handle = (session as { githubHandle?: string } | null)?.githubHandle;

  if (!handle) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(new URL(url.pathname, req.url));
  }

  const member = findMemberByHandle(handle);
  if (!member) {
    const url = req.nextUrl.clone();
    url.pathname = "/no-access";
    return NextResponse.redirect(new URL(url.pathname, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
