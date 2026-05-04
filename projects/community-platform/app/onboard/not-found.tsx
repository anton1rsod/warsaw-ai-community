/**
 * Custom 404 page for the /onboard route segment. Rendered by Next.js
 * whenever `notFound()` is called from app/onboard/page.tsx (e.g.
 * INVALID/EXPIRED/REVOKED/REPLAYED/ALREADY-MEMBER/NO-COOKIE).
 *
 * Mirrors the content of app/onboard/error/page.tsx so that all
 * invitation-redemption failure modes surface a single generic message
 * (spec §11.5 info-leak prevention: no enumeration of which check
 * failed).
 */
export default function OnboardNotFound(): React.JSX.Element {
  return (
    <main className="mx-auto max-w-prose p-6">
      <h1 className="text-2xl font-semibold">
        This invitation can&apos;t be completed.
      </h1>
      <p className="mt-4">
        Please reach out to a community organizer if you need a new invitation.
      </p>
    </main>
  );
}
