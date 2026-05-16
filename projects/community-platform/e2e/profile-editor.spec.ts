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

async function resetProfileStore(
  page: Page,
  seedBody?: string,
): Promise<void> {
  const data = seedBody
    ? { seed: [{ slug: "anton-safronov", body: seedBody }] }
    : {};
  const res = await page.request.post("/api/test-reset-profile", { data });
  expect(res.ok()).toBe(true);
}

async function resetConsentStore(page: Page): Promise<void> {
  const res = await page.request.post("/api/test-reset-consent");
  expect(res.ok()).toBe(true);
}

test.describe.configure({ mode: "serial" });

test.describe("Profile editor (v0.2)", () => {
  test.beforeEach(async ({ page }) => {
    await resetConsentStore(page);
  });

  test("Scenario 1: edit profile and reload sees the new body", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod");
    await resetProfileStore(page, "Original prose.");

    await page.goto("/me/edit");
    const textarea = page.getByRole("textbox", {
      name: /profile prose/i,
    });
    await expect(textarea).toBeVisible();
    await textarea.fill("Updated prose — v0.2 scenario 1.");
    await page.getByRole("button", { name: /^save$/i }).click();
    // ProfileEditor shows "Saved. Your profile is rebuilding…" on success
    await expect(page.getByText(/rebuilding/i)).toBeVisible({ timeout: 10000 });

    // Return to /me/edit and assert the textarea shows the persisted body
    // (read from the mock store). The /members/<slug> page is build-time
    // rendered, so the updated body won't appear there in E2E mode.
    await page.goto("/me/edit");
    await expect(
      page.getByRole("textbox", { name: /profile prose/i }),
    ).toHaveValue("Updated prose — v0.2 scenario 1.");
  });

  test("Scenario 2: concurrent edit → REFRESH_NEEDED message", async ({
    browser,
  }) => {
    // Two browser contexts both signed in as anton1rsod load /me/edit at the
    // same store SHA. Tab A saves first → store advances to a new SHA. Tab B
    // saves with its stale SHA → server compares, finds mismatch, returns
    // refresh_needed (no write attempted). UI surfaces "Someone else updated".
    //
    // Made possible by v0.2.1: ProfileEditor echoes file.sha as a hidden
    // form field, and saveProfile gates on that token instead of re-reading
    // the current SHA at save time.
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    await loginAs(pageA, "anton1rsod");
    await loginAs(pageB, "anton1rsod");
    await resetProfileStore(pageA, "Original.");

    await pageA.goto("/me/edit");
    await pageB.goto("/me/edit");

    await pageA
      .getByRole("textbox", { name: /profile prose/i })
      .fill("Page A edit.");
    await pageB
      .getByRole("textbox", { name: /profile prose/i })
      .fill("Page B edit.");

    await pageA.getByRole("button", { name: /^save$/i }).click();
    await expect(pageA.getByText(/rebuilding/i)).toBeVisible({
      timeout: 10000,
    });

    await pageB.getByRole("button", { name: /^save$/i }).click();
    await expect(pageB.getByText(/Someone else updated/i)).toBeVisible({
      timeout: 10000,
    });

    await ctxA.close();
    await ctxB.close();
  });

  test("Scenario 3: discard draft", async ({ page }) => {
    await loginAs(page, "anton1rsod");
    await resetProfileStore(page, "Original.");

    await page.goto("/me/edit");
    const textarea = page.getByRole("textbox", { name: /profile prose/i });
    await expect(textarea).toBeVisible();
    await textarea.fill("Draft body to discard.");

    // Navigate away and back — localStorage draft survives the navigation.
    await page.goto("/home");
    await page.goto("/me/edit");

    // ProfileEditor restores draft from localStorage and shows the banner.
    await expect(page.getByText(/Restored draft/i)).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: /profile prose/i }),
    ).toHaveValue("Draft body to discard.");

    // Click "Discard draft" — body returns to the server-side initial value.
    await page.getByRole("button", { name: /discard/i }).click();
    await expect(
      page.getByRole("textbox", { name: /profile prose/i }),
    ).toHaveValue("Original.");

    // Reload — localStorage draft has been cleared; no banner, body stays at
    // the server-side value.
    await page.reload();
    await expect(
      page.getByRole("textbox", { name: /profile prose/i }),
    ).toHaveValue("Original.");
    await expect(page.getByText(/Restored draft/i)).not.toBeVisible();
  });

  test("H21: GDPR delete after edit → /me/edit redirects to /consent", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod");
    await resetProfileStore(page, "Will be deleted.");

    // Visit the member profile page to access GdprPanel.
    await page.goto("/members/anton-safronov");

    // GdprPanel uses window.confirm — auto-accept it before clicking delete.
    page.on("dialog", (dialog) => void dialog.accept());
    await page.getByRole("button", { name: /delete my data/i }).click();

    // Wait for the delete to complete (the GdprPanel shows "Deleted." text).
    await expect(page.getByText(/Deleted\./i)).toBeVisible({ timeout: 10000 });

    // Navigating to /me/edit should redirect to /consent because the mock
    // profile store entry was removed (D4 — missing profile file).
    await page.goto("/me/edit");
    await expect(page).toHaveURL(/\/consent$/, { timeout: 10000 });
  });

  test("Scenario 5: project page top contributors", async ({ page }) => {
    // Snapshot-driven — no profile mock setup needed.
    await loginAs(page, "anton1rsod");
    await page.goto("/projects/community-platform");

    await expect(
      page.getByRole("heading", { name: /Top contributors/i }),
    ).toBeVisible();

    // At least one contributor @<handle> link is shown.
    await expect(page.getByRole("link", { name: /@/ }).first()).toBeVisible();
  });

  test("Scenario 6: GBrain link gating", async ({ page }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/projects/community-platform");

    // GBrain link presence is determined by whether GBRAIN_BASE_URL is set
    // at server start time. The playwright.config sets NEXT_PUBLIC_E2E_MODE=1
    // but does NOT set GBRAIN_BASE_URL, so the link should be ABSENT by
    // default in the standard E2E run.
    //
    // To exercise the "link visible" branch: start the dev server with
    //   GBRAIN_BASE_URL=https://gbrain.example.com pnpm dev
    // and verify that the link appears with target=_blank and
    //   rel containing both "noopener" and "noreferrer".
    //
    // This test covers the "unset → absent" contract. If GBRAIN_BASE_URL is
    // set in a CI environment, this assertion will correctly fail, signalling
    // that the inverse test ("link visible") should be run instead — or the
    // test can be parameterised per CI env.
    await expect(
      page.getByRole("link", { name: /ask gbrain/i }),
    ).toHaveCount(0);
  });
});
