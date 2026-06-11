/**
 * Admin console index — /admin
 *
 * SECURITY NOTE (H161): `requireAdmin()` in lib/require-admin.ts is the
 * security boundary (OWASP A01:2025 / CVE-2025-29927). The "admin console"
 * link in the Header dropdown is UX-only and is NOT a control.
 */
import { requireAdmin } from "@/lib/require-admin";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Pill } from "@/app/components/Pill";
import { s } from "@/lib/i18n/strings";

export const dynamic = "force-dynamic";

export default async function AdminConsolePage(): Promise<React.JSX.Element> {
  await requireAdmin("/admin");

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{s("chrome.admin.console.kicker")}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("chrome.admin.console.heading")}
      </h1>
      <p className="mt-2 font-voice text-[11px] text-dust">
        {s("chrome.admin.console.description")}
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        <li>
          <Pill href="/admin/invite" variant="solid">
            {s("chrome.admin.console.inviteLabel")}
          </Pill>
        </li>
        <li>
          <Pill href="/admin/events/new" variant="solid">
            {s("chrome.admin.console.newEventLabel")}
          </Pill>
        </li>
        <li>
          <Pill href="/admin/health" variant="solid">
            {s("chrome.admin.console.healthLabel")}
          </Pill>
        </li>
      </ul>
    </main>
  );
}
