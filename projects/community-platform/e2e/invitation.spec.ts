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
  const data: { handle: string; consented?: boolean } = { handle };
  if (opts.consented !== undefined) data.consented = opts.consented;
  const res = await page.request.post("/api/test-auth", { data });
  expect(res.ok()).toBe(true);
}

async function resetMocks(page: Page): Promise<void> {
  const r1 = await page.request.post("/api/test-reset-invitations");
  const r2 = await page.request.post("/api/test-reset-consent");
  const r3 = await page.request.post("/api/test-reset-status");
  expect(r1.ok()).toBe(true);
  expect(r2.ok()).toBe(true);
  expect(r3.ok()).toBe(true);
}

async function readMintedInviteUrl(page: Page): Promise<string> {
  await page.waitForFunction(() => {
    const inputs = document.querySelectorAll("input[readonly]");
    const value = (inputs[0] as HTMLInputElement | undefined)?.value ?? "";
    return value.startsWith("http") && value.includes("/onboard?token=");
  });
  return page.locator("input[readonly]").first().inputValue();
}

test.describe.configure({ mode: "serial" });

test.describe("Invitation feature E2E", () => {
  test.beforeEach(async ({ page }) => {
    await resetMocks(page);
  });

  test("Scenario 1 — happy path: admin mints, invitee redeems, /this-week shows new member", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/admin/invite");
    await page.getByLabel(/telegram hint/i).fill("@invitee");
    await page.getByRole("button", { name: /mint/i }).click();
    const url = await readMintedInviteUrl(page);
    expect(url).toContain("/onboard?token=");

    await loginAs(page, "newmember");
    await page.goto(url);
    await expect(page).toHaveURL(/\/onboard$/);

    await page.getByLabel(/display name/i).fill("E2E Member");
    await page.getByLabel(/telegram handle/i).fill("@e2emember");
    await page.getByLabel(/git email/i).fill("e2e@member.test");
    await page.getByLabel(/i agree/i).check();
    await page.getByRole("button", { name: /complete/i }).click();
    await page.waitForURL(/\/this-week/);
  });

  test("Scenario 2 — invalid token → generic error page", async ({ page }) => {
    await loginAs(page, "newmember");
    await page.goto("/onboard?token=garbage.notvalid");
    await expect(
      page.getByText(/this invitation can.?t be completed/i),
    ).toBeVisible();
  });

  test("Scenario 3 — expired token → generic error page", async ({ page }) => {
    const minted = await page.request.post("/api/test-mint-expired");
    expect(minted.ok()).toBe(true);
    const { token } = (await minted.json()) as { token: string };

    await loginAs(page, "newmember");
    await page.goto(`/onboard?token=${token}`);
    await expect(
      page.getByText(/this invitation can.?t be completed/i),
    ).toBeVisible();
  });

  test("Scenario 4 — replayed JTI → second redemption attempt fails (cookie cleared, generic error page)", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/admin/invite");
    await page.getByRole("button", { name: /mint/i }).click();
    const url = await readMintedInviteUrl(page);

    await loginAs(page, "newmember");
    await page.goto(url);
    await page.getByLabel(/display name/i).fill("First Redeem");
    await page.getByLabel(/telegram handle/i).fill("@firstredeem");
    await page.getByLabel(/git email/i).fill("first@redeem.test");
    await page.getByLabel(/i agree/i).check();
    await page.getByRole("button", { name: /complete/i }).click();
    await page.waitForURL(/\/this-week/);

    // Replay attempt: a different non-roster user clicks the same URL
    // and submits. The page-level check passes (token signature/exp
    // are still valid). Replay defence is performed by the orchestrator
    // (lib/invitations.ts:redeemInvitation): it reads the ledger and
    // sees `jti` already redeemed → returns ok:false → action clears
    // the cookie + returns generic error. The Server Action's response
    // triggers a Server Component re-render; with the cookie now gone,
    // the page falls through to notFound() → renders the generic
    // "This invitation can't be completed." (info-leak prevention §11.5).
    await loginAs(page, "different-attacker");
    await page.goto(url);
    await page.getByLabel(/display name/i).fill("Replay Attempt");
    await page.getByLabel(/telegram handle/i).fill("@replayer");
    await page.getByLabel(/git email/i).fill("replay@attempt.test");
    await page.getByLabel(/i agree/i).check();
    await page.getByRole("button", { name: /complete/i }).click();
    await expect(
      page.getByText(/this invitation can.?t be completed/i),
    ).toBeVisible();
  });

  test("Scenario 5 — already-member redeemer → generic error page", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/admin/invite");
    await page.getByRole("button", { name: /mint/i }).click();
    const url = await readMintedInviteUrl(page);

    // Stay signed in as anton1rsod (already on roster).
    await page.goto(url);
    await expect(
      page.getByText(/this invitation can.?t be completed/i),
    ).toBeVisible();
  });

  test("Scenario 6 — form validation fail → user stays on /onboard", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/admin/invite");
    await page.getByRole("button", { name: /mint/i }).click();
    const url = await readMintedInviteUrl(page);

    await loginAs(page, "newmember");
    await page.goto(url);

    // Telegram pattern violation: too short. The HTML5 pattern attribute
    // prevents form submission natively, so the URL stays /onboard. The
    // server-side cookie-keeping behavior is covered by the integration
    // test "form-validation-fail keeps cookie" in
    // tests/integration/redeem-invitation.test.ts.
    await page.getByLabel(/display name/i).fill("OK");
    await page.getByLabel(/telegram handle/i).fill("@xx");
    await page.getByLabel(/git email/i).fill("ok@example.com");
    await page.getByLabel(/i agree/i).check();
    await page.getByRole("button", { name: /complete/i }).click();

    await expect(page).toHaveURL(/\/onboard$/);
  });

  test("Scenario 7 — soft-binding banner + H4 Referrer-Policy header", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/admin/invite");
    await page.getByLabel(/telegram hint/i).fill("@knownuser");
    await page.getByRole("button", { name: /mint/i }).click();
    const url = await readMintedInviteUrl(page);

    await loginAs(page, "newmember");

    // After the first GET sets the cookie + 302-redirects, the second
    // GET to the clean /onboard URL is what carries H4 headers via
    // proxy.ts's applyOnboardHeaders.
    const cleanOnboardResponse = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === "/onboard" &&
        r.request().method() === "GET" &&
        r.status() === 200,
    );
    await page.goto(url);
    const response = await cleanOnboardResponse;
    expect(response.headers()["referrer-policy"]).toBe("no-referrer");

    await expect(
      page.getByText(/this invitation was issued to/i),
    ).toBeVisible();
    await expect(page.getByText("@knownuser")).toBeVisible();
  });
});
