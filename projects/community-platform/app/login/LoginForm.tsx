"use client";

import { useEffect, useState } from "react";

export function LoginForm(): React.JSX.Element {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((d: { csrfToken: string }) => {
        if (!cancelled) setCsrfToken(d.csrfToken);
      })
      .catch(() => {
        // CSRF endpoint unreachable — leave token empty so the button stays disabled.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <form action="/api/auth/signin/github" method="POST" className="mt-6">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="callbackUrl" value="/home" />
      <button
        type="submit"
        disabled={!csrfToken}
        className="rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        Sign in with GitHub
      </button>
    </form>
  );
}
