"use client";

import { useEffect, useState } from "react";

export function LoginForm(): React.JSX.Element {
  const [csrfToken, setCsrfToken] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/csrf")
      .then((r) => {
        if (!r.ok) throw new Error(`csrf endpoint ${r.status}`);
        return r.json() as Promise<unknown>;
      })
      .then((d: unknown) => {
        if (cancelled) return;
        const token = (d as { csrfToken?: unknown }).csrfToken;
        if (typeof token === "string" && token.length > 0) {
          setCsrfToken(token);
        }
      })
      .catch(() => {
        // CSRF endpoint unreachable or non-200 — leave token empty so the
        // submit button stays disabled rather than POSTing a bad token.
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
