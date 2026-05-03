import { NextResponse } from "next/server";
import { mockInvitationStore } from "@/app/actions/_test-invitation-store";

/**
 * Dev/test-only route: clear the in-memory invitation mock store. Mirror of
 * /api/test-reset-consent. Called by Playwright `test.beforeEach` so each
 * invitation E2E test starts from a "no one has redeemed" baseline.
 *
 * Hard-gated to non-production environments AND to E2E mode.
 */
export async function POST(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  if (process.env.NEXT_PUBLIC_E2E_MODE !== "1") {
    return new NextResponse("E2E mode not enabled", { status: 404 });
  }
  mockInvitationStore.reset();
  return NextResponse.json({ ok: true });
}
