import { NextResponse, type NextRequest } from "next/server";
import { mockConsentStore } from "@/app/actions/_test-consent-store";

/**
 * Dev/test-only route: mark a slug as consented in the in-memory mock
 * store WITHOUT going through /consent or setting the cookie. Used by
 * the snapshot-stale recovery E2E to simulate "user has consented (file
 * exists in repo) but their cookie was lost AND the build-time snapshot
 * doesn't yet reflect the profile."
 *
 * Hard-gated to non-production environments AND to E2E mode, same as
 * /api/test-reset-consent.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  if (process.env.NEXT_PUBLIC_E2E_MODE !== "1") {
    return new NextResponse("E2E mode not enabled", { status: 404 });
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
    typeof (body as { slug?: unknown }).slug !== "string"
  ) {
    return new NextResponse("slug (string) required", { status: 400 });
  }
  const slug = (body as { slug: string }).slug;
  if (slug.length === 0) {
    return new NextResponse("slug required", { status: 400 });
  }

  mockConsentStore.add(slug);
  return NextResponse.json({ ok: true, slug });
}
