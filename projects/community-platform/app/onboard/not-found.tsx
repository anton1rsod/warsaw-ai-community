import { MonoLabel } from "@/app/components/MonoLabel";

/**
 * Custom 404 page for the /onboard route segment. Rendered by Next.js
 * whenever `notFound()` is called from app/onboard/page.tsx (e.g.
 * INVALID/EXPIRED/REVOKED/REPLAYED/ALREADY-MEMBER/NO-COOKIE).
 *
 * Mirrors the content of app/onboard/error/page.tsx so that all
 * invitation-redemption failure modes surface a single generic message
 * (spec §11.5 info-leak prevention: no enumeration of which check
 * failed). The warm system tokens (MonoLabel, font-display, text-ink,
 * font-body, text-dust) must mirror that file too — the docstring
 * promise was content + visual.
 */
export default function OnboardNotFound(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto max-w-prose px-6 py-10">
      <MonoLabel>// onboard</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        This invitation can&apos;t be completed.
      </h1>
      <p className="mt-4 font-body text-dust">
        Please reach out to a community organizer if you need a new invitation.
      </p>
    </main>
  );
}
