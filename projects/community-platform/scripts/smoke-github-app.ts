/**
 * Smoke-tests the GitHub App credentials against the real GitHub API.
 *
 * Reads the repo root README.md as a known file. Prints first line + SHA on
 * success; exits 1 on failure (typically PEM CRLF / whitespace issues, missing
 * env vars, or installation not granted contents:read on this repo).
 *
 * Run: `pnpm tsx scripts/smoke-github-app.ts`
 *
 * Per execution-plan §6.2 risk mitigation: this is the gate before closing
 * Phase 4. Integration tests use MSW + a throwaway PEM that GitHub would
 * reject — this script is the only verification that real credentials wired
 * to a real installation actually work.
 */
import { createGitHubApp } from "@/lib/github-app";
import { env } from "@/lib/env";

async function main(): Promise<void> {
  const app = createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });

  const result = await app.readFile("README.md");
  if (!result) {
    console.error("[smoke] README.md not found at repo root.");
    process.exit(1);
  }
  // Print char count + SHA only (NOT the actual content). The SHA is a
  // content hash so it cannot leak secrets. Never print README content
  // because a future ops change could put a token / internal URL at the
  // top of the file and CI/log capture would surface it.
  if (result.content.length === 0) {
    console.error("[smoke] FAILED: README.md fetched but empty body.");
    process.exit(1);
  }
  console.log("[smoke] README.md chars:", result.content.length);
  console.log("[smoke] SHA:", result.sha);
  console.log("[smoke] OK");
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[smoke] FAILED:", message);
  if (err && typeof err === "object" && "kind" in err) {
    console.error("[smoke] kind:", (err as { kind: unknown }).kind);
  }
  process.exit(1);
});
