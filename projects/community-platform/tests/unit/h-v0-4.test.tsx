import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

// H56/H57 describe blocks import @/app/page which transitively loads
// @/lib/auth and @/lib/env. Mock both here (at module scope, hoisted
// before dynamic imports) so the env-validation guard in lib/env.ts
// does not fire during unit test collection.
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "test",
    NEXTAUTH_URL: "http://localhost:3000",
    GITHUB_OAUTH_CLIENT_ID: "test",
    GITHUB_OAUTH_CLIENT_SECRET: "test",
    GITHUB_APP_ID: "test",
    GITHUB_APP_PRIVATE_KEY: "test",
    GITHUB_APP_INSTALLATION_ID: "test",
    GITHUB_REPO_OWNER: "test",
    GITHUB_REPO_NAME: "test",
    COMMUNITY_NAME: "Warsaw AI Community",
    COMMUNITY_SLUG: "warsaw-ai",
    INVITE_SECRET: "test",
  },
}));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
  listMeetingsFromSnapshot: vi.fn(() => []),
  listEventsFromSnapshot: vi.fn(() => []),
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(() => ({ get: vi.fn(() => null) })),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("H64: token variable contract (globals.css)", () => {
  const css = readFileSync(
    join(process.cwd(), "app", "globals.css"),
    "utf-8",
  );

  it("declares the canonical accent ramp at :root", () => {
    expect(css).toMatch(/--color-accent-50:\s*#fffbeb/);
    expect(css).toMatch(/--color-accent-100:\s*#fef3c7/);
    expect(css).toMatch(/--color-accent-500:\s*#f59e0b/);
    expect(css).toMatch(/--color-accent-600:\s*#d97706/);
    expect(css).toMatch(/--color-accent-700:\s*#b45309/);
    expect(css).toMatch(/--color-accent-900:\s*#78350f/);
  });

  it("declares the neutral ramp slot (foundation for v0.5+ dark mode)", () => {
    expect(css).toMatch(/--color-neutral-50:\s*#fafafa/);
    expect(css).toMatch(/--color-neutral-900:\s*#171717/);
  });

  it("uses `--color-<role>-<weight>` naming convention only", () => {
    const varDecls = Array.from(css.matchAll(/--color-([a-z]+)-(\d+):/g));
    expect(varDecls.length).toBeGreaterThan(0);
    for (const [, role, weight] of varDecls) {
      expect(role).toMatch(/^(accent|neutral)$/);
      expect(Number(weight)).toBeGreaterThanOrEqual(50);
      expect(Number(weight)).toBeLessThanOrEqual(900);
    }
  });

  it("includes the comment legend documenting the contract", () => {
    expect(css).toMatch(/--color-<role>-<weight>/);
  });
});

describe("H59: next.config.ts images.remotePatterns SSRF allowlist", () => {
  const config = readFileSync(
    join(process.cwd(), "next.config.ts"),
    "utf-8",
  );

  it("declares images.remotePatterns with avatars.githubusercontent.com ONLY", () => {
    expect(config).toMatch(/images:\s*\{/);
    expect(config).toMatch(/remotePatterns:\s*\[/);
    expect(config).toMatch(/hostname:\s*["']avatars\.githubusercontent\.com["']/);
    expect(config).toMatch(/protocol:\s*["']https["']/);
  });

  it("does NOT permit any other origin in remotePatterns", () => {
    // Crude but effective: count `hostname:` declarations in the file.
    // If Phase A adds a 2nd hostname, this test fails — forcing a deliberate
    // ADR / threat-model review for the new origin (per §14.7 + V0_5_BACKLOG).
    const hostnameCount = (config.match(/hostname:/g) || []).length;
    expect(hostnameCount).toBe(1);
  });
});

describe("H56: / anonymous render no session leak", () => {
  // Source-level assertion: AnonymousHero.tsx must NOT reference any
  // auth-session-derived UI tokens. This is a static guard equivalent to
  // the DOM check — the component is only ever mounted in the anonymous
  // branch of page.tsx (signedIn === false), so auth tokens must never
  // appear in its source.
  const heroSrc = readFileSync(
    join(process.cwd(), "app", "components", "AnonymousHero.tsx"),
    "utf-8",
  );

  it("AnonymousHero source does NOT reference signed-in UI tokens", () => {
    for (const token of ["Sign out", "Edit profile", "Your week", "signOut", "githubHandle"]) {
      expect(heroSrc).not.toContain(token);
    }
  });

  it("AnonymousHero does NOT import @/lib/auth (no auth dependency)", () => {
    expect(heroSrc).not.toMatch(/from ["']@\/lib\/auth["']/);
    expect(heroSrc).not.toMatch(/import.*auth.*from/);
  });
});

describe("H57: / signed-in redirect preserves safe from", () => {
  it("safe path (matches ^/[a-z0-9-_/]*$) is preserved", async () => {
    const { resolveSafeReturnTo } = await import("@/app/page");
    expect(resolveSafeReturnTo("/calendar")).toBe("/calendar");
    expect(resolveSafeReturnTo("/events/2026-05-21-sync")).toBe(
      "/events/2026-05-21-sync",
    );
    expect(resolveSafeReturnTo("/members/anton-safronov")).toBe(
      "/members/anton-safronov",
    );
  });

  it("unsafe input is dropped — falls back to /home", async () => {
    const { resolveSafeReturnTo } = await import("@/app/page");
    expect(resolveSafeReturnTo("https://evil.example")).toBe("/home");
    expect(resolveSafeReturnTo("//evil.example/path")).toBe("/home");
    expect(resolveSafeReturnTo("javascript:alert(1)")).toBe("/home");
    expect(resolveSafeReturnTo("/path?query=injected")).toBe("/home");
    expect(resolveSafeReturnTo("/UPPER")).toBe("/home");
    expect(resolveSafeReturnTo("../")).toBe("/home");
    expect(resolveSafeReturnTo(undefined)).toBe("/home");
    expect(resolveSafeReturnTo("")).toBe("/home");
  });
});

describe("H62: calendar filter URL preservation", () => {
  it("filter chips link to URL with ?filter=<value>", async () => {
    const { default: CalendarPage } = await import("@/app/calendar/page");
    const { render, screen } = await import("@testing-library/react");
    render(await CalendarPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("link", { name: "Events" }).getAttribute("href")).toBe(
      "/calendar?filter=events",
    );
    expect(screen.getByRole("link", { name: "Meetings" }).getAttribute("href")).toBe(
      "/calendar?filter=meetings",
    );
    expect(screen.getByRole("link", { name: "All" }).getAttribute("href")).toBe(
      "/calendar",
    );
  });
});

describe("H67: i18n string centralization — strict-list grep (second half)", () => {
  it("Phase A strict-list components contain no inline JSX text-node strings", async () => {
    const { scanForInlineStrings } = await import(
      "@/scripts/check-h67-inline-strings"
    );
    const result = scanForInlineStrings(process.cwd());
    if (!result.ok) {
      console.error("H67 hits:", JSON.stringify(result.hits, null, 2));
    }
    expect(result.ok).toBe(true);
  });
});
