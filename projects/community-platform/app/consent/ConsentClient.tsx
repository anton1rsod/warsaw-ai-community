"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { ConsentModal } from "@/app/components/ConsentModal";
import { acceptConsentAndSetCookie } from "@/app/actions/consent";

export function ConsentClient(): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onAccept = (): void => {
    startTransition(async () => {
      const result = await acceptConsentAndSetCookie();
      if (result.ok) {
        router.push("/home");
      } else {
        // Auth or roster drift — bounce to /login. The proxy will redirect
        // again to /no-access if they're authenticated-but-off-roster.
        router.push("/login");
      }
    });
  };

  const onCancel = (): void => {
    startTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <ConsentModal
        onAccept={onAccept}
        onCancel={onCancel}
        disabled={isPending}
      />
    </main>
  );
}
