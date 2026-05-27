"use client";

import { useEffect, useState } from "react";
import { s } from "@/lib/i18n/strings";
import { Pill } from "@/app/components/Pill";

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
    <form action="/api/auth/signin/github" method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="callbackUrl" value="/home" />
      <Pill variant="going" type="submit" disabled={!csrfToken}>
        {s("auth.signInWithGitHub")}
      </Pill>
    </form>
  );
}
