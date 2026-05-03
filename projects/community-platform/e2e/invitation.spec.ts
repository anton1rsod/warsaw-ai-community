import { test } from "@playwright/test";

test.describe("Invitation feature E2E", () => {
  test.beforeEach(async ({ request }) => {
    // Reset E2E mocks before each test for isolation.
    await request.post("http://localhost:3000/api/test-reset-invitations");
    await request.post("http://localhost:3000/api/test-reset-consent");
    await request.post("http://localhost:3000/api/test-reset-status");
  });

  // Scenarios populated in Tasks 11.3.2 + 11.3.3.
  // Empty test to confirm the file loads and beforeEach wires:
  test.skip("scaffold placeholder — populated in next tasks", () => {
    // Intentionally empty — replaced in 11.3.2 + 11.3.3.
  });
});
