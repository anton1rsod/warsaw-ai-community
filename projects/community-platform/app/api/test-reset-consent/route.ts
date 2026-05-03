import { NextResponse } from "next/server";
import { mockConsentStore } from "@/app/actions/_test-consent-store";

/**
 * Dev/test-only route: clear the in-memory consent mock store. Mirror of
 * /api/test-reset-status; called by Playwright `test.beforeEach` so each
 * consent E2E test starts from a "no one has consented" baseline.
 *
 * Hard-gated to non-production environments AND to E2E mode, same as the
 * status reset endpoint.
 */
export async function POST(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  if (process.env.NEXT_PUBLIC_E2E_MODE !== "1") {
    return new NextResponse("E2E mode not enabled", { status: 404 });
  }
  mockConsentStore.reset();
  return NextResponse.json({ ok: true });
}
