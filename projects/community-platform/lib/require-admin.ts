/**
 * require-admin.ts — shared admin-route authorization gate.
 *
 * SECURITY BOUNDARY (OWASP A01:2025 / CVE-2025-29927).
 *
 * This function is the authoritative server-side check for all admin routes.
 * The "admin console" link in the Header dropdown is UX-only; it provides
 * convenience but is NOT a security control. Callers MUST call requireAdmin()
 * unconditionally at the top of every admin Server Component and privileged
 * Server Action — never rely on the UI link being hidden.
 *
 * Contract:
 *   - Returns the authenticated session on success (caller is an admin).
 *   - Redirects to /login if no session (not signed in).
 *   - Logs the denial (H162) and redirects to /home if signed in but not admin.
 *
 * Usage:
 *   const session = await requireAdmin("/admin/invite");
 */

import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { log } from "@/lib/log";

export async function requireAdmin(routeLabel: string): Promise<Session> {
  const session = await auth();

  if (!session?.githubHandle) {
    redirect("/login");
  }

  if (!isAdmin(session.githubHandle)) {
    // H162: log denied access for OWASP A09 audit trail.
    // We do NOT log successful admin views (low value at single-admin scale).
    log.info("require-admin", "admin-access-denied", {
      route: routeLabel,
      handle: session.githubHandle,
    });
    redirect("/home");
  }

  return session;
}
