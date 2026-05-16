import { expect, test, type Page } from "@playwright/test";

interface LoginOpts {
  consented?: boolean;
}

async function loginAs(
  page: Page,
  handle: string,
  opts: LoginOpts = {},
): Promise<void> {
  // page.request shares cookies with page (same BrowserContext); the
  // standalone `request` fixture does NOT (per execution-plan §9.13).
  // For consent flow we need to opt out of the default consent cookie.
  const data: { handle: string; consented?: boolean } = { handle };
  if (opts.consented !== undefined) data.consented = opts.consented;
  const res = await page.request.post("/api/test-auth", { data });
  expect(res.ok()).toBe(true);
}

async function resetConsentStore(page: Page): Promise<void> {
  const res = await page.request.post("/api/test-reset-consent");
  expect(res.ok()).toBe(true);
}

async function markConsented(page: Page, slug: string): Promise<void> {
  const res = await page.request.post("/api/test-mark-consented", {
    data: { slug },
  });
  expect(res.ok()).toBe(true);
}

test.describe.configure({ mode: "serial" });

test.describe("consent flow", () => {
  test.beforeEach(async ({ page }) => {
    await resetConsentStore(page);
  });

  test("first-time roster member is redirected to /consent and sees the modal", async ({
    page,
  }) => {
    // Use `markspas` — his profile is genuinely absent from the
    // build-time content snapshot, so the chat-14 proxy hotfix (re-seed
    // cookie when member.profile is present) doesn't apply. anton1rsod's
    // profile WAS committed at SHA 29954f4 on 2026-05-03 (real consent
    // smoke), so the snapshot includes it and the proxy short-circuits
    // — that's the wrong precondition for this test's "first-time
    // member" intent.
    await loginAs(page, "markspas", { consented: false });
    await page.goto("/home");
    await expect(page).toHaveURL(/\/consent$/);
    await expect(
      page.getByRole("heading", { name: /opt in/i }),
    ).toBeVisible();
  });

  test("returning member with consent cookie reaches /home directly", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod", { consented: true });
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
  });

  test("cancel from /consent signs out and lands on /login", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod", { consented: false });
    await page.goto("/consent");
    await expect(
      page.getByRole("heading", { name: /opt in/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("accept records consent, redirects to /home, and persists on next /home visit", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod", { consented: false });
    await page.goto("/consent");
    await page.getByRole("button", { name: /accept/i }).click();
    await page.waitForURL(/\/home$/);
    // Reload /home: the cookie + mock-store record should keep the
    // member through the consent gate without bouncing back to /consent.
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
  });

  test("snapshot-stale recovery: consented user with no cookie lands on /home via /api/consent/recover (no modal, no loop)", async ({
    page,
  }) => {
    // Simulates the v0.2.1 chat-15 fix: profile exists in the repo (live
    // hasConsent → true) but the user's cookie was lost AND the build-time
    // content snapshot doesn't yet reflect the profile. Before the fix,
    // /consent's Server Component redirect("/home") couldn't set the
    // cookie, so /home → proxy → /consent looped indefinitely. After the
    // fix, /consent redirects to /api/consent/recover which sets the
    // cookie on its own response and 307s to /home.
    //
    // We use `markspas` / `mark-spasonov` because his profile is
    // genuinely absent from the build-time snapshot (per Phase 10 row in
    // STATE.md). Logging in as anton1rsod would short-circuit through
    // the chat-14 hotfix (member.profile in snapshot → re-seed cookie),
    // which exercises a different code path.
    await loginAs(page, "markspas", { consented: false });
    await markConsented(page, "mark-spasonov");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
    // No modal — recovery should bypass the consent UI entirely.
    await expect(
      page.getByRole("heading", { name: /opt in/i }),
    ).not.toBeVisible();
    // Cookie should now be set so a second /home visit short-circuits
    // without hitting /api/consent/recover.
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
  });
});
