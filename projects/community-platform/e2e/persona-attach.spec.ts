/**
 * v0.11.1 Phase 5.1 — Persona attach → display E2E.
 *
 * Flow: reset persona store → sign in as anton1rsod → /me/edit → fill textarea
 * → click "Attach persona" → see "Attached" confirmation → navigate to
 * /members/anton-safronov → see persona chips (industries + functional roles).
 *
 * E2E mode notes:
 *   • save-persona.ts forks to mockPersonaStore.write() when NEXT_PUBLIC_E2E_MODE=1
 *     and NODE_ENV !== "production" — the write is in-memory, no GitHub App call.
 *   • app/members/[slug]/page.tsx reads mockPersonaStore.get(slug) when
 *     !isProductionRuntime() && isE2EMode() — double-guarded, inert in prod.
 *   • /api/test-reset-persona resets the store between runs (guards on isE2EMode()).
 *
 * H142: validatePersonaFrontmatter checks persona_id === session slug ("anton-safronov")
 * — the test persona frontmatter must carry the matching persona_id.
 */

import { expect, test, type Page } from "@playwright/test";

const MEMBER_SLUG = "anton-safronov";
const MEMBER_HANDLE = "anton1rsod";

const TEST_PERSONA = `---
persona_id: anton-safronov
display_name: Anton Safronov
languages: [en]
schema_version: 1.0
---
# Anton Safronov

## Tags

### Industries
- b2b-saas — expert

### Functional roles
- product-manager — expert

## Background

E2E test persona.
`;

async function loginAs(page: Page, handle: string): Promise<void> {
  // page.request shares cookies with page (same BrowserContext); the standalone
  // `request` fixture does NOT. Always use page.request for E2E session forging.
  const res = await page.request.post("/api/test-auth", { data: { handle } });
  expect(res.ok()).toBe(true);
}

async function resetPersonaStore(page: Page): Promise<void> {
  const res = await page.request.post("/api/test-reset-persona");
  expect(res.ok()).toBe(true);
}

async function seedProfileStore(page: Page): Promise<void> {
  // /me/edit redirects to /consent when mockProfileStore has no entry.
  // Seed a minimal profile so the page renders the PersonaEditor.
  const res = await page.request.post("/api/test-reset-profile", {
    data: {
      seed: [{ slug: "anton-safronov", body: "E2E profile seed." }],
    },
  });
  expect(res.ok()).toBe(true);
}

const RAW_URL =
  "https://raw.githubusercontent.com/anton1rsod/personas/main/persona-anton-safronov.public.md";

/**
 * v0.12 Phase 5.7 — URL-attach E2E.
 *
 * E2E mode notes:
 *   • savePersona's source_url branch runs the REAL H151 URL guard, then forks
 *     to a fixture string (e2eFixturePersona) instead of fetching — no network.
 *   • The fixture carries `- e2e-url-attach — expert` under ### Industries and
 *     persona_id templated from the session slug, so H142 passes for
 *     anton-safronov and the member page renders the fixture tag.
 */
test.describe("5.7: Persona URL-attach (v0.12 H151/H154)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await resetPersonaStore(page);
    await seedProfileStore(page);
    await loginAs(page, MEMBER_HANDLE);
  });

  test("fetch & attach from a raw URL — fixture persona lands and renders", async ({ page }) => {
    await page.goto("/me/edit", { waitUntil: "networkidle" });

    const urlInput = page.getByLabel(/attach from a github raw/i);
    await expect(urlInput).toBeVisible({ timeout: 8000 });
    await urlInput.fill(RAW_URL);

    const fetchBtn = page.getByRole("button", { name: /fetch & attach/i });
    await expect(fetchBtn).toBeEnabled();
    await fetchBtn.click();

    await expect(
      page.getByText("Attached — your card rebuilds in ~60-90s after the next deploy."),
    ).toBeVisible({ timeout: 8000 });

    // The fixture written by the E2E fork must render on the member page.
    await page.goto(`/members/${MEMBER_SLUG}`, { waitUntil: "networkidle" });
    await expect(page.getByText(/e2e-url-attach/i)).toBeVisible({ timeout: 8000 });
  });

  test("H151: non-allowlisted lookalike host is rejected by the REAL guard (no fixture write)", async ({
    page,
  }) => {
    await page.goto("/me/edit", { waitUntil: "networkidle" });

    const urlInput = page.getByLabel(/attach from a github raw/i);
    await urlInput.fill("https://raw.githubusercontent.com.evil.com/x/persona.md");
    await page.getByRole("button", { name: /fetch & attach/i }).click();

    await expect(
      page.getByText(/only raw\.githubusercontent\.com or gist\.githubusercontent\.com/i),
    ).toBeVisible({ timeout: 8000 });
  });
});

test.describe("5.1: Persona attach → display", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await resetPersonaStore(page);
    await seedProfileStore(page);
    await loginAs(page, MEMBER_HANDLE);
  });

  test("attach persona on /me/edit — sees Attached confirmation", async ({
    page,
  }) => {
    await page.goto("/me/edit", { waitUntil: "networkidle" });

    // Fill the Persona markdown textarea
    const textarea = page.getByLabel(/persona markdown/i);
    await expect(textarea).toBeVisible({ timeout: 8000 });
    await textarea.fill(TEST_PERSONA);

    // Click "Attach persona"
    const attachBtn = page.getByRole("button", { name: /attach persona/i });
    await expect(attachBtn).toBeVisible({ timeout: 5000 });
    await attachBtn.click();

    // Expect the "Attached" confirmation text
    await expect(page.getByText(/attached/i)).toBeVisible({ timeout: 8000 });
  });

  test("attached persona chips appear on the member page", async ({ page }) => {
    // Step 1: attach the persona (same as the previous test — stores must be
    // pre-seeded so the member page can fork to the mock).
    await page.goto("/me/edit", { waitUntil: "networkidle" });
    const textarea = page.getByLabel(/persona markdown/i);
    await expect(textarea).toBeVisible({ timeout: 8000 });
    await textarea.fill(TEST_PERSONA);
    const attachBtn = page.getByRole("button", { name: /attach persona/i });
    await attachBtn.click();
    await expect(page.getByText(/attached/i)).toBeVisible({ timeout: 8000 });

    // Step 2: navigate to the member page and verify chips are rendered
    await page.goto(`/members/${MEMBER_SLUG}`, { waitUntil: "networkidle" });

    // Verify industry chip visible
    await expect(page.getByText(/b2b-saas/i)).toBeVisible({ timeout: 8000 });
    // Verify functional role chip visible
    await expect(page.getByText(/product-manager/i)).toBeVisible({ timeout: 8000 });
    // Verify the Languages ledger row (v0.12: dt "Languages" + dd "en" in the ExpertiseLedger)
    await expect(page.getByText("Languages", { exact: true })).toBeVisible({ timeout: 8000 });
    await expect(page.locator("dd").filter({ hasText: /^en$/ })).toBeVisible();
  });
});
