import { NextResponse } from "next/server";
import { isE2EMode, mockPersonaStore } from "@/app/actions/_test-persona-store";

/**
 * Dev/test-only route: clear the in-memory persona mock store. Called by
 * Playwright `test.beforeEach` so each test starts from a clean slate.
 *
 * Hard-gated to non-production environments AND to E2E mode. Production
 * builds — even if NODE_ENV slipped through — short-circuit on the
 * E2E-mode check because the store doesn't exist outside that flag.
 */
export async function POST(): Promise<Response> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!isE2EMode()) {
    return new NextResponse("E2E mode not enabled", { status: 404 });
  }
  mockPersonaStore.reset();
  return NextResponse.json({ ok: true });
}
