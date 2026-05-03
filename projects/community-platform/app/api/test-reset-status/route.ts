import { NextResponse } from "next/server";
import {
  isE2EMode,
  mockStatusActions,
} from "@/app/actions/_test-status-store";

/**
 * Dev/test-only route: clear the in-memory status mock store. Called by
 * Playwright `test.beforeEach` so each test starts from a clean slate.
 *
 * Hard-gated to non-production environments AND to E2E mode. Production
 * builds — even if NODE_ENV slipped through — short-circuit on the
 * E2E-mode check because the store doesn't exist outside that flag.
 */
export async function POST(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!isE2EMode()) {
    return new NextResponse("E2E mode not enabled", { status: 404 });
  }
  mockStatusActions.reset();
  return NextResponse.json({ ok: true });
}
