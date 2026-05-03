/**
 * Generic-error page for ALL invitation redemption failure modes
 * (INVALID, EXPIRED, REVOKED, REPLAYED, ALREADY-MEMBER, NO-COOKIE).
 *
 * Single message; no enumeration. Spec §11.5 info-leak prevention.
 *
 * HTTP status: 200 by default (Next App Router). Direct GETs land here
 * without disclosing whether the URL came from a verify failure or a
 * direct request — both render the same UI. The redemption flow uses
 * notFound() / redirect() in /onboard/page.tsx (Task 11.2.8), which
 * still routes here.
 */
export default function OnboardErrorPage(): React.JSX.Element {
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
