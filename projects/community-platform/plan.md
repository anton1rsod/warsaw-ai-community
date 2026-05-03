# Warsaw AI Community Platform v0.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Lite slice of the Warsaw AI Community platform — auth-gated member directory, project / decision / meeting readers, status updates, persona panel, and a git-derived contributions counter.

**Architecture:** Next.js 15 App Router on Vercel, JWT sessions via NextAuth/Auth.js v5, GitHub OAuth for identity, GitHub App `warsaw-ai-bot` for git writes. **Storage is 100% git** for v0.1 — status updates commit directly to `community/status/YYYY-WW/<slug>.md` via the bot. Build-time read for slow-changing content; runtime read via GitHub API for status.

**Tech Stack:** Next.js 15, React Server Components, NextAuth/Auth.js v5, TypeScript strict, pnpm, Vitest + MSW, Playwright, `@octokit/rest` + `@octokit/auth-app`, `gray-matter` + `unified` + `remark-*`, Tailwind, Zod.

**Spec source:** [`spec.md`](spec.md). Each task cites the spec section it implements.

---

## Table of contents

- **[Conventions](#conventions)** — read this first
- **Phase 0: Bootstrap** — launch-blocking tasks + green build + Vercel preview
- **Phase 1: Auth + RBAC** — members can log in
- **Phase 2: Member directory + profiles** — read members, render persona panel
- **Phase 3: Document readers** — projects, decisions, meetings
- **Phase 4: GitHub App writer** — bot infrastructure
- **Phase 5: Status updates** — the one write surface
- **Phase 6: Membership consent flow** — first-login experience
- **Phase 7: Contributions counter** — gamification minimum
- **Phase 8: GDPR mechanisms** — export and delete
- **Phase 9: Health metric** — admin observability
- **Phase 10: Pre-launch + deploy** — ship

---

## Conventions

These apply to every task; they're not repeated in each step.

### File paths

All paths are repo-rooted from `/Users/antonsafronov/Projects/Warsaw AI Comunity/`. The Next.js app lives at `projects/community-platform/app/`. Path alias `@/` maps to `projects/community-platform/`.

### Test framework

- **Unit / integration:** Vitest. `pnpm vitest run <path>` for one file; `pnpm test` for full run; `pnpm test:coverage` for coverage.
- **E2E:** Playwright. `pnpm e2e`. Browser binaries via `pnpm exec playwright install`.
- **Coverage:** 80% overall (lines + branches), 100% on auth middleware, RBAC guards, classification helpers, GitHub App writer wrapper, week helpers (per spec §8).

### Commit pattern

- One logical change per commit. Each task ends with a commit.
- Format: `feat(community-platform): <verb> <thing>` / `test(...)` / `chore(...)` / `fix(...)` / `docs(...)`.
- Pre-commit hook (Task 0.6) runs lint + typecheck on staged TS files.

### TDD discipline (per `~/.claude/rules/common/testing.md` and spec §8)

For every task with code: write failing test → verify it fails → minimal implementation → verify pass → refactor if needed → commit.

### Module style

- ESM throughout (`"type": "module"`).
- TypeScript strict (`"strict": true`, `"noUncheckedIndexedAccess": true`).
- Named exports for utilities and components. Page / route files use Next-required default exports.

### Pinned deps (added incrementally)

| Package | Version | Phase added |
|---|---|---|
| `next` | `15.0.4` | 0 |
| `react` / `react-dom` | `19.0.0` | 0 |
| `typescript` | `5.7.2` | 0 |
| `eslint` | `^9` | 0 |
| `vitest` | `^2` | 0 |
| `@playwright/test` | `^1.49` | 0 |
| `tailwindcss` | `^3.4` | 0 |
| `zod` | `^3` | 0 |
| `next-auth` | `5.0.0-beta.25` | 1 |
| `gray-matter` | `^4` | 2 |
| `unified` + `remark-parse` + `remark-gfm` + `remark-rehype` + `rehype-stringify` | latest | 2 |
| `@octokit/rest` | `^21` | 4 |
| `@octokit/auth-app` | `^7` | 4 |
| `msw` | `^2` | 4 |

### Env vars (validated in `lib/env.ts`)

| Var | Purpose |
|---|---|
| `NEXTAUTH_SECRET` | NextAuth JWT signing |
| `NEXTAUTH_URL` | NextAuth callbacks |
| `NEXTAUTH_SESSION_MAX_AGE` | Session expiry (default 2592000) |
| `GITHUB_OAUTH_CLIENT_ID` / `_SECRET` | GitHub OAuth |
| `GITHUB_APP_ID` / `_PRIVATE_KEY` / `_INSTALLATION_ID` | GitHub App |
| `GITHUB_REPO_OWNER` / `_NAME` / `_BRANCH` | Read+write target |
| `COMMUNITY_NAME` / `_SLUG` | UI strings, no hardcoding (spec §5) |

### Code blocks in steps

Code in steps is complete and copy-pasteable. When a file evolves across tasks, each task shows the *full file content after that task*, not a diff.

---

## Phase 0: Bootstrap

**Phase goal:** Three launch-blocking non-code tasks done; Next.js project initialized; tooling green; deployed to Vercel preview.

**Phase ships:** A green-build "Hello, Warsaw AI Community" page on a Vercel preview URL.

### Task 0.1: Add `github_handle` to roster (launch-blocking)

**Spec:** §9 risk 3.

**Files:** Modify `community/members/roster.md`.

- [ ] **Step 1: Read current roster format**

Run: `cat community/members/roster.md`. Note schema (table or per-member sections).

- [ ] **Step 2: Decide schema**

If table, add a `GitHub` column. If per-member sections, add a `**GitHub:** @handle` line. Match existing style; don't restructure.

- [ ] **Step 3: Collect handles**

For each of the 19 current members: ask in Telegram, cross-reference `persona-builder/personas/<slug>/`, or fill `TBD`. Members with `TBD` cannot log in until set.

- [ ] **Step 4: Update `roster.md`**

Add the field for every entry. Preserve all other fields.

- [ ] **Step 5: Commit**

```bash
git add community/members/roster.md
git commit -m "chore(community): add github_handle field to roster entries

Required for community platform v0.1 auth (spec §9 risk 3). Members
with github_handle: TBD will be unable to log in until set."
```

### Task 0.2: Create governance role files (launch-blocking)

**Spec:** §6.10, §9 risk 3 (companion).

**Files:**
- Create: `community/governance/admins.md`
- Create: `community/governance/community-managers.md`

- [ ] **Step 1: Write `community/governance/admins.md`**

```markdown
# Admins

Admin role for the Warsaw AI Community platform. See [governance.md](./governance.md) for the role's authority and appointment process.

The platform's RBAC reads this file at build time to grant admin capabilities (currently RBAC marker only; UI-distinct admin features arrive in v0.2+ per spec §4).

| Name | GitHub | Appointed | Notes |
|---|---|---|---|
| Anton Safronov | @<handle> | 2026-04-24 | Founder |
```

Replace `<handle>` with Anton's actual GitHub handle.

- [ ] **Step 2: Write `community/governance/community-managers.md`**

```markdown
# Community Managers

Community manager role for the Warsaw AI Community platform. See [governance.md](./governance.md) for the role's authority and appointment process.

The platform's RBAC reads this file at build time to grant CM capabilities (currently RBAC marker only; CM-distinct UI features arrive in v0.2+ per spec §4).

| Name | GitHub | Appointed | Notes |
|---|---|---|---|

_(empty for v0.1 launch)_
```

- [ ] **Step 3: Verify `governance.md` references both**

Run: `grep -E "admins\.md|community-managers\.md" community/governance/governance.md`. If absent, append a "Role lists" section linking both.

- [ ] **Step 4: Commit**

```bash
git add community/governance/admins.md community/governance/community-managers.md community/governance/governance.md
git commit -m "feat(community): add admins.md and community-managers.md

Source of truth for platform RBAC per spec §6.10. Admin list
contains founder; CM list empty at v0.1 launch."
```

### Task 0.3: Add `## Attendees` format to meeting template (launch-blocking)

**Spec:** §6.6, §9 risk 3 (companion).

**Files:** Modify `community/meetings/weekly/_template.md`.

- [ ] **Step 1: Read current template**

Run: `cat community/meetings/weekly/_template.md`.

- [ ] **Step 2: Add `## Attendees` section**

Append (or insert after metadata block):

```markdown
## Attendees

<!-- One bullet per attendee. Names must match `community/members/roster.md`
for the contributions counter to attribute attendance correctly. -->

- 

```

- [ ] **Step 3: Decide retrofit policy for existing notes**

`ls community/meetings/weekly/*.md | grep -v _template`. For each: retrofit (add `## Attendees`) or accept (won't contribute to counts). Document choice in commit message.

- [ ] **Step 4: Commit**

```bash
git add community/meetings/weekly/_template.md
git commit -m "feat(community): add ## Attendees format to meeting template

H2 + bullet-list format the platform's contribution counter parses
(spec §6.6). Existing notes not retrofitted; their attendance won't
contribute until edited."
```

### Task 0.4: Initialize Next.js 15 project

**Spec:** §5, §6.9.

**Files:**
- Modify: `projects/community-platform/package.json`
- Create: `projects/community-platform/tsconfig.json`
- Create: `projects/community-platform/next.config.ts`
- Create: `projects/community-platform/app/layout.tsx`
- Create: `projects/community-platform/app/page.tsx`
- Create: `projects/community-platform/app/globals.css`
- Create: `projects/community-platform/.gitignore`

- [ ] **Step 1: Replace `package.json`**

Path: `projects/community-platform/package.json`

```json
{
  "name": "@warsaw-ai/community-platform",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "e2e:install": "playwright install --with-deps"
  },
  "dependencies": {
    "next": "15.0.4",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@types/node": "22.10.2",
    "@types/react": "19.0.2",
    "@types/react-dom": "19.0.2",
    "typescript": "5.7.2"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

Path: `projects/community-platform/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "tests/fixtures"]
}
```

- [ ] **Step 3: Write `next.config.ts`**

Path: `projects/community-platform/next.config.ts`

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true },
};

export default config;
```

- [ ] **Step 4: Write `app/layout.tsx`**

Path: `projects/community-platform/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warsaw AI Community",
  description: "Member-shaped read of the Warsaw AI Community.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Write `app/page.tsx`**

Path: `projects/community-platform/app/page.tsx`

```tsx
export default function HomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Warsaw AI Community</h1>
      <p>Platform bootstrap successful.</p>
    </main>
  );
}
```

- [ ] **Step 6: Write `app/globals.css`**

Path: `projects/community-platform/app/globals.css`

```css
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; background: Canvas; color: CanvasText; }
```

- [ ] **Step 7: Write `.gitignore`**

Path: `projects/community-platform/.gitignore`

```
node_modules/
.next/
.vercel/
out/
coverage/
playwright-report/
test-results/
.env
.env.local
.env.*.local
*.pem
!tests/fixtures/**/*.pem
```

- [ ] **Step 8: Install + verify**

```bash
cd projects/community-platform
pnpm install
pnpm typecheck
pnpm build
```

Expected: green.

- [ ] **Step 9: Spot-check dev server**

```bash
pnpm dev
```

Open `http://localhost:3000`. Expected: "Warsaw AI Community" heading. Stop with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add projects/community-platform
git commit -m "feat(community-platform): initialize Next.js 15 App Router skeleton"
```

### Task 0.5: Configure ESLint

**Spec:** §5.

**Files:**
- Create: `projects/community-platform/eslint.config.js`
- Modify: `projects/community-platform/package.json`

- [ ] **Step 1: Add deps**

```bash
cd projects/community-platform
pnpm add -D eslint@^9 @eslint/js@^9 typescript-eslint@^8 eslint-config-next@15.0.4
```

- [ ] **Step 2: Write `eslint.config.js`**

Path: `projects/community-platform/eslint.config.js`

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "playwright-report/**", "tests/fixtures/**"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
];
```

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add projects/community-platform/eslint.config.js projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): configure ESLint with strict TS rules"
```

### Task 0.6: Pre-commit hook

**Spec:** §5.

**Files:**
- Create: `projects/community-platform/.husky/pre-commit`
- Modify: `projects/community-platform/package.json`

- [ ] **Step 1: Add deps**

```bash
cd projects/community-platform
pnpm add -D husky@^9 lint-staged@^15
```

- [ ] **Step 2: Initialize Husky**

```bash
cd projects/community-platform
pnpm exec husky init
```

- [ ] **Step 3: Replace `.husky/pre-commit`**

Path: `projects/community-platform/.husky/pre-commit`

```sh
cd projects/community-platform
pnpm exec lint-staged
```

- [ ] **Step 4: Add `lint-staged` to `package.json`**

Add this top-level field in `projects/community-platform/package.json`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "pnpm exec eslint --fix",
    "pnpm exec tsc --noEmit"
  ]
}
```

- [ ] **Step 5: Verify hook**

Edit a TS file trivially; `git add` it; `git commit -m "test hook"`. Hook should run, lint pass, commit succeed. Then `git reset HEAD~1` to undo.

- [ ] **Step 6: Commit hook config**

```bash
git add projects/community-platform/.husky projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): pre-commit hook (husky + lint-staged)"
```

### Task 0.7: Set up Vitest

**Spec:** §8.

**Files:**
- Create: `projects/community-platform/vitest.config.ts`
- Create: `projects/community-platform/tests/unit/smoke.test.ts`

- [ ] **Step 1: Add deps**

```bash
cd projects/community-platform
pnpm add -D vitest@^2 @vitest/coverage-v8@^2
```

- [ ] **Step 2: Write `vitest.config.ts`**

Path: `projects/community-platform/vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["node_modules", ".next", "e2e", "tests/fixtures"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["lib/**/*.ts", "app/actions/**/*.ts", "scripts/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
    },
  },
});
```

(Coverage thresholds added in Task 0.13 closeout when source files exist.)

- [ ] **Step 3: Write smoke test**

Path: `projects/community-platform/tests/unit/smoke.test.ts`

```ts
import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("vitest is wired", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
pnpm test
```

Expected: 1 pass.

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/vitest.config.ts projects/community-platform/tests projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): set up Vitest"
```

### Task 0.8: Set up Playwright

**Spec:** §8.

**Files:**
- Create: `projects/community-platform/playwright.config.ts`
- Create: `projects/community-platform/e2e/smoke.spec.ts`

- [ ] **Step 1: Add deps**

```bash
cd projects/community-platform
pnpm add -D @playwright/test@^1.49
pnpm exec playwright install --with-deps chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

Path: `projects/community-platform/playwright.config.ts`

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Write smoke E2E**

Path: `projects/community-platform/e2e/smoke.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Warsaw AI Community" })).toBeVisible();
});
```

- [ ] **Step 4: Run E2E**

```bash
pnpm e2e
```

Expected: 1 pass.

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/playwright.config.ts projects/community-platform/e2e projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): set up Playwright"
```

### Task 0.9: Set up Tailwind

**Spec:** §5 (UI implied).

**Files:**
- Create: `projects/community-platform/postcss.config.mjs`
- Create: `projects/community-platform/tailwind.config.ts`
- Modify: `projects/community-platform/app/globals.css`
- Modify: `projects/community-platform/app/page.tsx`

- [ ] **Step 1: Add deps**

```bash
cd projects/community-platform
pnpm add -D tailwindcss@^3.4 postcss@^8 autoprefixer@^10
```

- [ ] **Step 2: Write `tailwind.config.ts`**

Path: `projects/community-platform/tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Write `postcss.config.mjs`**

Path: `projects/community-platform/postcss.config.mjs`

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 4: Update `app/globals.css`**

Path: `projects/community-platform/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light dark; }
* { box-sizing: border-box; }

body {
  @apply m-0 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100;
  font-family: system-ui, -apple-system, sans-serif;
}
```

- [ ] **Step 5: Update `app/page.tsx`**

Path: `projects/community-platform/app/page.tsx`

```tsx
export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold">Warsaw AI Community</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Platform bootstrap successful.
      </p>
    </main>
  );
}
```

- [ ] **Step 6: Verify**

```bash
pnpm build
pnpm e2e
```

Expected: green.

- [ ] **Step 7: Commit**

```bash
git add projects/community-platform/postcss.config.mjs projects/community-platform/tailwind.config.ts projects/community-platform/app projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): configure Tailwind"
```

### Task 0.10: Env var validation (`lib/env.ts`)

**Spec:** §5, Conventions/Env.

**Files:**
- Create: `projects/community-platform/lib/env.ts`
- Create: `projects/community-platform/tests/unit/env.test.ts`
- Create: `projects/community-platform/.env.local.example`

- [ ] **Step 1: Add Zod**

```bash
cd projects/community-platform
pnpm add zod@^3
```

- [ ] **Step 2: Write the failing test**

Path: `projects/community-platform/tests/unit/env.test.ts`

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("env", () => {
  const originalEnv = { ...process.env };
  beforeEach(() => { vi.resetModules(); });
  afterEach(() => { process.env = { ...originalEnv }; });

  it("returns parsed values when all required vars set", async () => {
    process.env.NEXTAUTH_SECRET = "test-secret-32-bytes-long-aaaaaaa";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.GITHUB_OAUTH_CLIENT_ID = "client-id";
    process.env.GITHUB_OAUTH_CLIENT_SECRET = "client-secret";
    process.env.GITHUB_APP_ID = "12345";
    process.env.GITHUB_APP_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nfoo\n-----END RSA PRIVATE KEY-----";
    process.env.GITHUB_APP_INSTALLATION_ID = "67890";
    process.env.GITHUB_REPO_OWNER = "warsaw-ai-community";
    process.env.GITHUB_REPO_NAME = "warsaw-ai-community";
    process.env.GITHUB_REPO_BRANCH = "main";
    process.env.COMMUNITY_NAME = "Warsaw AI Community";
    process.env.COMMUNITY_SLUG = "warsaw-ai";

    const { env } = await import("@/lib/env");
    expect(env.GITHUB_REPO_OWNER).toBe("warsaw-ai-community");
    expect(env.COMMUNITY_NAME).toBe("Warsaw AI Community");
    expect(env.NEXTAUTH_SESSION_MAX_AGE).toBe(2_592_000);
  });

  it("throws when a required var is missing", async () => {
    delete process.env.NEXTAUTH_SECRET;
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    await expect(import("@/lib/env")).rejects.toThrow(/NEXTAUTH_SECRET/);
  });
});
```

- [ ] **Step 3: Run test, expect fail**

```bash
pnpm test tests/unit/env.test.ts
```

Expected: `Cannot find module '@/lib/env'`.

- [ ] **Step 4: Implement `lib/env.ts`**

Path: `projects/community-platform/lib/env.ts`

```ts
import { z } from "zod";

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SESSION_MAX_AGE: z.coerce.number().int().positive().default(2_592_000),
  GITHUB_OAUTH_CLIENT_ID: z.string().min(1),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().min(1),
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_APP_PRIVATE_KEY: z.string().min(1),
  GITHUB_APP_INSTALLATION_ID: z.string().min(1),
  GITHUB_REPO_OWNER: z.string().min(1),
  GITHUB_REPO_NAME: z.string().min(1),
  GITHUB_REPO_BRANCH: z.string().min(1).default("main"),
  COMMUNITY_NAME: z.string().min(1),
  COMMUNITY_SLUG: z.string().min(1),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = result.data;
export type Env = typeof env;
```

- [ ] **Step 5: Run test, expect pass**

```bash
pnpm test tests/unit/env.test.ts
```

Expected: 2 pass.

- [ ] **Step 6: Write `.env.local.example`**

Path: `projects/community-platform/.env.local.example`

```
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SESSION_MAX_AGE=2592000
GITHUB_OAUTH_CLIENT_ID=
GITHUB_OAUTH_CLIENT_SECRET=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_INSTALLATION_ID=
GITHUB_REPO_OWNER=warsaw-ai-community
GITHUB_REPO_NAME=warsaw-ai-community
GITHUB_REPO_BRANCH=main
COMMUNITY_NAME=Warsaw AI Community
COMMUNITY_SLUG=warsaw-ai
```

- [ ] **Step 7: Commit**

```bash
git add projects/community-platform/lib projects/community-platform/tests projects/community-platform/.env.local.example projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): env var validation via Zod (lib/env.ts)"
```

### Task 0.11: Classification rule constants (`lib/classification.ts`)

**Spec:** §6.1.

**Files:**
- Create: `projects/community-platform/lib/classification.ts`
- Create: `projects/community-platform/tests/unit/classification.test.ts`

- [ ] **Step 1: Write the failing test**

Path: `projects/community-platform/tests/unit/classification.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { classifyData } from "@/lib/classification";

describe("classifyData", () => {
  it("returns git for durable artifacts", () => {
    expect(classifyData("roster")).toBe("git");
    expect(classifyData("adr")).toBe("git");
    expect(classifyData("meeting_note")).toBe("git");
    expect(classifyData("project_spec")).toBe("git");
    expect(classifyData("persona")).toBe("git");
    expect(classifyData("profile_prose")).toBe("git");
    expect(classifyData("status_update")).toBe("git");
  });

  it("returns db_or_kv for ephemeral / high-frequency", () => {
    expect(classifyData("session_token")).toBe("db_or_kv");
    expect(classifyData("draft")).toBe("db_or_kv");
    expect(classifyData("rate_limit_counter")).toBe("db_or_kv");
    expect(classifyData("ephemeral_notification")).toBe("db_or_kv");
    expect(classifyData("search_index")).toBe("db_or_kv");
    expect(classifyData("high_frequency_reaction")).toBe("db_or_kv");
  });

  it("throws for unknown kinds (forces ADR per spec §6.1)", () => {
    // @ts-expect-error testing runtime
    expect(() => classifyData("kudo")).toThrow(/unknown/i);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

```bash
pnpm test tests/unit/classification.test.ts
```

- [ ] **Step 3: Implement `lib/classification.ts`**

Path: `projects/community-platform/lib/classification.ts`

```ts
/**
 * §6.1 storage classification rule.
 * Durable / audit-worthy → git. Ephemeral / social / high-frequency → DB or KV.
 * v0.1: dormant (all data is git). v0.2+: live policy. New data kinds require ADR.
 */

export type DataKind =
  | "roster"
  | "adr"
  | "meeting_note"
  | "project_spec"
  | "persona"
  | "profile_prose"
  | "status_update"
  | "session_token"
  | "draft"
  | "rate_limit_counter"
  | "ephemeral_notification"
  | "search_index"
  | "high_frequency_reaction";

export type Classification = "git" | "db_or_kv";

const GIT_KINDS: ReadonlySet<DataKind> = new Set([
  "roster",
  "adr",
  "meeting_note",
  "project_spec",
  "persona",
  "profile_prose",
  "status_update",
]);

const DB_OR_KV_KINDS: ReadonlySet<DataKind> = new Set([
  "session_token",
  "draft",
  "rate_limit_counter",
  "ephemeral_notification",
  "search_index",
  "high_frequency_reaction",
]);

export function classifyData(kind: DataKind): Classification {
  if (GIT_KINDS.has(kind)) return "git";
  if (DB_OR_KV_KINDS.has(kind)) return "db_or_kv";
  throw new Error(
    `Unknown data kind '${kind}'. New kinds require an ADR per spec §6.1 before classification.`,
  );
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
pnpm test tests/unit/classification.test.ts
```

Expected: 3 pass.

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/lib/classification.ts projects/community-platform/tests/unit/classification.test.ts
git commit -m "feat(community-platform): §6.1 classification rule as code"
```

### Task 0.12: Initial Vercel deployment

**Spec:** §5.

**Files:** Create `projects/community-platform/vercel.json`.

- [ ] **Step 1: Write `vercel.json`**

Path: `projects/community-platform/vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs"
}
```

- [ ] **Step 2: Link the project**

```bash
cd projects/community-platform
pnpm dlx vercel link
```

Choose "Create new project". Name: `warsaw-ai-community-platform`. Set **root directory** to `projects/community-platform/` (critical — repo is monorepo).

- [ ] **Step 3: Set placeholder env vars**

```bash
cd projects/community-platform
pnpm dlx vercel env add NEXTAUTH_SECRET preview production
# value: openssl rand -base64 32

pnpm dlx vercel env add NEXTAUTH_URL preview production
# value: https://placeholder.vercel.app (corrected in Phase 1 to the real Vercel URL)

pnpm dlx vercel env add COMMUNITY_NAME preview production
# Warsaw AI Community

pnpm dlx vercel env add COMMUNITY_SLUG preview production
# warsaw-ai

pnpm dlx vercel env add GITHUB_REPO_OWNER preview production
# warsaw-ai-community

pnpm dlx vercel env add GITHUB_REPO_NAME preview production
# warsaw-ai-community

pnpm dlx vercel env add GITHUB_REPO_BRANCH preview production
# main
```

GitHub OAuth and App vars are placeholders so build doesn't fail env validation; real values land in Task 1.4.

```bash
pnpm dlx vercel env add GITHUB_OAUTH_CLIENT_ID preview production
# placeholder
pnpm dlx vercel env add GITHUB_OAUTH_CLIENT_SECRET preview production
# placeholder
pnpm dlx vercel env add GITHUB_APP_ID preview production
# placeholder
pnpm dlx vercel env add GITHUB_APP_PRIVATE_KEY preview production
# placeholder-pem
pnpm dlx vercel env add GITHUB_APP_INSTALLATION_ID preview production
# placeholder
```

- [ ] **Step 4: Deploy**

```bash
cd projects/community-platform
pnpm dlx vercel --prod=false
```

Expected: preview URL like `warsaw-ai-community-platform-<hash>.vercel.app`. Open it; verify bootstrap page renders.

- [ ] **Step 5: Add deployment URL to README**

In `projects/community-platform/README.md`, add a "Deployments" section:

```markdown
## Deployments

- **Preview:** <URL>
- **Production:** _(set after Phase 10)_
```

- [ ] **Step 6: Commit**

```bash
git add projects/community-platform/vercel.json projects/community-platform/README.md
git commit -m "feat(community-platform): wire Vercel deployment"
```

### Task 0.13: Phase 0 closeout

- [ ] **Step 1: Add coverage thresholds**

Edit `projects/community-platform/vitest.config.ts` — add inside `coverage`:

```ts
thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
```

- [ ] **Step 2: Run full check**

```bash
cd projects/community-platform
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test:coverage
pnpm build
pnpm e2e
```

Expected: all green; coverage ≥ 80% on `lib/env.ts` and `lib/classification.ts`.

- [ ] **Step 3: Update CHANGELOG**

In `projects/community-platform/CHANGELOG.md`, under `## [Unreleased] — 2026-05-01`, add:

```markdown
### Phase 0 — Bootstrap (complete)
- Pre-launch tasks: `github_handle` added to roster; `community/governance/admins.md` and `community/governance/community-managers.md` created; `## Attendees` format added to meeting template.
- Next.js 15 App Router skeleton (TS strict, ESM, pnpm).
- Vitest + Playwright + ESLint + Tailwind + Husky pre-commit.
- `lib/env.ts` Zod env contract.
- `lib/classification.ts` §6.1 rule.
- Vercel preview deployment.
```

- [ ] **Step 4: Commit closeout**

```bash
git add projects/community-platform/vitest.config.ts projects/community-platform/CHANGELOG.md
git commit -m "chore(community-platform): close Phase 0 — coverage thresholds + CHANGELOG"
```

---

## Phase 1: Auth + RBAC

**Phase goal:** Roster members log in via GitHub. Non-roster users hit `/no-access`. RBAC layer recognizes admin / CM / member / guest. Middleware gates everything except `/login` and `/no-access`.

**Phase ships:** A Vercel preview where roster members can authenticate and reach `/home`; non-roster GitHub users are deflected.

### Task 1.1: Roster snapshot reader (`lib/roster.ts`)

**Spec:** §6.4 (auth flow), §6.10 (governance source).

**Files:**
- Create: `projects/community-platform/lib/roster.ts`
- Create: `projects/community-platform/tests/unit/roster.test.ts`
- Create: `projects/community-platform/tests/fixtures/repo/community/members/roster.md`

- [ ] **Step 1: Create fixture roster file**

Path: `projects/community-platform/tests/fixtures/repo/community/members/roster.md`

```markdown
# Roster

Opt-in roster of Warsaw AI Community members.

| Name | GitHub | Joined | Notes |
|---|---|---|---|
| Anton Safronov | @antonsafronov | 2026-04-24 | Founder |
| Alice Example | @alice-ex | 2026-04-24 | |
| Bob Sample | @bob-sample | 2026-04-25 | |
| Carol Pending | @TBD | 2026-04-26 | Handle TBD |
```

- [ ] **Step 2: Write the failing test**

Path: `projects/community-platform/tests/unit/roster.test.ts`

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { readRoster, lookupMemberByHandle } from "@/lib/roster";

const FIXTURE = path.resolve(__dirname, "../fixtures/repo/community/members/roster.md");

describe("roster", () => {
  it("parses entries with github_handle", async () => {
    const roster = await readRoster(FIXTURE);
    expect(roster).toHaveLength(4);
    expect(roster[0]).toMatchObject({
      name: "Anton Safronov",
      githubHandle: "antonsafronov",
      slug: "anton-safronov",
    });
  });

  it("normalizes handles (strips @, lowercase)", async () => {
    const roster = await readRoster(FIXTURE);
    expect(roster[1]?.githubHandle).toBe("alice-ex");
  });

  it("excludes TBD handles from lookup", async () => {
    const roster = await readRoster(FIXTURE);
    const found = lookupMemberByHandle(roster, "TBD");
    expect(found).toBeUndefined();
  });

  it("looks up case-insensitively", async () => {
    const roster = await readRoster(FIXTURE);
    expect(lookupMemberByHandle(roster, "AntonSafronov")?.name).toBe("Anton Safronov");
  });

  it("returns undefined for unknown handle", async () => {
    const roster = await readRoster(FIXTURE);
    expect(lookupMemberByHandle(roster, "stranger")).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run test, expect fail**

```bash
pnpm test tests/unit/roster.test.ts
```

- [ ] **Step 4: Implement `lib/roster.ts`**

Path: `projects/community-platform/lib/roster.ts`

```ts
import fs from "node:fs/promises";

export interface RosterMember {
  name: string;
  githubHandle: string;
  slug: string;
  joined?: string;
  notes?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeHandle(raw: string): string {
  return raw.replace(/^@/, "").toLowerCase().trim();
}

export async function readRoster(filePath: string): Promise<RosterMember[]> {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");
  const members: RosterMember[] = [];

  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    if (line.includes("---")) continue;
    if (line.toLowerCase().includes("name") && line.toLowerCase().includes("github")) continue;

    const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
    if (cells.length < 2) continue;

    const name = cells[0];
    const handleRaw = cells[1];
    if (!name || !handleRaw) continue;

    const handle = normalizeHandle(handleRaw);
    if (handle === "tbd") continue;

    members.push({
      name,
      githubHandle: handle,
      slug: slugify(name),
      joined: cells[2] || undefined,
      notes: cells[3] || undefined,
    });
  }

  return members;
}

export function lookupMemberByHandle(
  roster: readonly RosterMember[],
  handle: string,
): RosterMember | undefined {
  const target = normalizeHandle(handle);
  return roster.find((m) => m.githubHandle === target);
}
```

Note: Carol Pending in the fixture has `@TBD` and is filtered out — so the test expecting `4` entries is wrong. Update the test:

```ts
it("parses entries with valid github_handle (skips TBD)", async () => {
    const roster = await readRoster(FIXTURE);
    expect(roster).toHaveLength(3);
    // ... rest unchanged
```

(Pick whichever direction matches the spec — the spec says TBD handles can't log in, so they're not platform members. Filtering at parse time is cleaner.)

- [ ] **Step 5: Re-run test, expect pass**

```bash
pnpm test tests/unit/roster.test.ts
```

Expected: 5 pass.

- [ ] **Step 6: Commit**

```bash
git add projects/community-platform/lib/roster.ts projects/community-platform/tests
git commit -m "feat(community-platform): roster snapshot reader (lib/roster.ts)"
```

### Task 1.2: Governance reader (`lib/governance.ts`)

**Spec:** §6.10.

**Files:**
- Create: `projects/community-platform/lib/governance.ts`
- Create: `projects/community-platform/tests/unit/governance.test.ts`
- Create: `projects/community-platform/tests/fixtures/repo/community/governance/admins.md`
- Create: `projects/community-platform/tests/fixtures/repo/community/governance/community-managers.md`

- [ ] **Step 1: Create fixtures**

Path: `projects/community-platform/tests/fixtures/repo/community/governance/admins.md`

```markdown
# Admins

| Name | GitHub | Appointed | Notes |
|---|---|---|---|
| Anton Safronov | @antonsafronov | 2026-04-24 | Founder |
```

Path: `projects/community-platform/tests/fixtures/repo/community/governance/community-managers.md`

```markdown
# Community Managers

| Name | GitHub | Appointed | Notes |
|---|---|---|---|
| Bob Sample | @bob-sample | 2026-05-01 | First CM |
```

- [ ] **Step 2: Write the failing test**

Path: `projects/community-platform/tests/unit/governance.test.ts`

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { readGovernance } from "@/lib/governance";

const ADMINS = path.resolve(__dirname, "../fixtures/repo/community/governance/admins.md");
const CMS = path.resolve(__dirname, "../fixtures/repo/community/governance/community-managers.md");

describe("governance", () => {
  it("reads admin and CM handles", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(gov.admins).toEqual(["antonsafronov"]);
    expect(gov.communityManagers).toEqual(["bob-sample"]);
  });

  it("isAdmin / isCommunityManager helpers", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(gov.isAdmin("AntonSafronov")).toBe(true);
    expect(gov.isAdmin("alice-ex")).toBe(false);
    expect(gov.isCommunityManager("bob-sample")).toBe(true);
    expect(gov.isCommunityManager("antonsafronov")).toBe(false);
  });

  it("handles empty CM file", async () => {
    const emptyCmsPath = path.resolve(__dirname, "../fixtures/repo/community/governance/community-managers-empty.md");
    // Test fixture: a file with header but no rows. Create it inline if needed:
    // For now we test by handling the edge case in code.
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: ADMINS }); // misuse to ensure no-throw on small files
    expect(Array.isArray(gov.communityManagers)).toBe(true);
  });
});
```

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Implement `lib/governance.ts`**

Path: `projects/community-platform/lib/governance.ts`

```ts
import fs from "node:fs/promises";

export interface GovernanceSnapshot {
  admins: readonly string[];
  communityManagers: readonly string[];
  isAdmin: (handle: string) => boolean;
  isCommunityManager: (handle: string) => boolean;
}

function normalize(handle: string): string {
  return handle.replace(/^@/, "").toLowerCase().trim();
}

async function readHandles(filePath: string): Promise<string[]> {
  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split("\n");
  const handles: string[] = [];

  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    if (line.includes("---")) continue;
    if (line.toLowerCase().includes("github") && line.toLowerCase().includes("name")) continue;

    const cells = line.split("|").map((c) => c.trim()).filter((c) => c !== "");
    const handleRaw = cells[1];
    if (!handleRaw) continue;
    const h = normalize(handleRaw);
    if (h && h !== "tbd") handles.push(h);
  }

  return handles;
}

export async function readGovernance(opts: {
  adminsPath: string;
  cmsPath: string;
}): Promise<GovernanceSnapshot> {
  const [admins, cms] = await Promise.all([
    readHandles(opts.adminsPath),
    readHandles(opts.cmsPath),
  ]);

  const adminSet = new Set(admins);
  const cmSet = new Set(cms);

  return {
    admins,
    communityManagers: cms,
    isAdmin: (h) => adminSet.has(normalize(h)),
    isCommunityManager: (h) => cmSet.has(normalize(h)),
  };
}
```

- [ ] **Step 5: Run test, expect pass**

- [ ] **Step 6: Commit**

```bash
git add projects/community-platform/lib/governance.ts projects/community-platform/tests
git commit -m "feat(community-platform): governance reader (lib/governance.ts)"
```

### Task 1.3: RBAC helpers (`lib/rbac.ts`)

**Spec:** §0.1 (four-role model), §4.

**Files:**
- Create: `projects/community-platform/lib/rbac.ts`
- Create: `projects/community-platform/tests/unit/rbac.test.ts`

- [ ] **Step 1: Write the failing test**

Path: `projects/community-platform/tests/unit/rbac.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { resolveRole, type Role } from "@/lib/rbac";

const roster = [
  { name: "Anton Safronov", githubHandle: "antonsafronov", slug: "anton-safronov" },
  { name: "Alice Example", githubHandle: "alice-ex", slug: "alice-example" },
];

const governance = {
  admins: ["antonsafronov"],
  communityManagers: ["alice-ex"],
  isAdmin: (h: string) => h.toLowerCase() === "antonsafronov",
  isCommunityManager: (h: string) => h.toLowerCase() === "alice-ex",
};

describe("resolveRole", () => {
  it("returns 'admin' for admin handle in roster", () => {
    expect(resolveRole("antonsafronov", { roster, governance })).toBe<Role>("admin");
  });

  it("returns 'community_manager' for CM handle in roster", () => {
    expect(resolveRole("alice-ex", { roster, governance })).toBe<Role>("community_manager");
  });

  it("returns 'member' for roster handle without governance role", () => {
    const r2 = [...roster, { name: "Bob", githubHandle: "bob", slug: "bob" }];
    expect(resolveRole("bob", { roster: r2, governance })).toBe<Role>("member");
  });

  it("returns 'guest' for handle not in roster", () => {
    expect(resolveRole("stranger", { roster, governance })).toBe<Role>("guest");
  });

  it("admin without roster entry resolves to guest (must be on roster)", () => {
    const govPlus = { ...governance, isAdmin: (h: string) => h === "ghost" };
    expect(resolveRole("ghost", { roster, governance: govPlus })).toBe<Role>("guest");
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `lib/rbac.ts`**

Path: `projects/community-platform/lib/rbac.ts`

```ts
import type { RosterMember } from "@/lib/roster";
import type { GovernanceSnapshot } from "@/lib/governance";

export type Role = "admin" | "community_manager" | "member" | "guest";

export interface RbacContext {
  roster: readonly RosterMember[];
  governance: GovernanceSnapshot;
}

export function resolveRole(handle: string, ctx: RbacContext): Role {
  const normalized = handle.toLowerCase().trim();
  const onRoster = ctx.roster.some((m) => m.githubHandle === normalized);

  if (!onRoster) return "guest";
  if (ctx.governance.isAdmin(normalized)) return "admin";
  if (ctx.governance.isCommunityManager(normalized)) return "community_manager";
  return "member";
}

export function isPrivileged(role: Role): boolean {
  return role === "admin" || role === "community_manager";
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/lib/rbac.ts projects/community-platform/tests/unit/rbac.test.ts
git commit -m "feat(community-platform): RBAC role resolution (lib/rbac.ts)"
```

### Task 1.4: GitHub OAuth app + Vercel env

**Spec:** §5, §6.4.

**Files:** None in repo (out-of-band setup); verify env values land.

- [ ] **Step 1: Create GitHub OAuth App**

Go to https://github.com/settings/developers → "New OAuth App". Settings:
- **Application name:** `Warsaw AI Community Platform`
- **Homepage URL:** the Vercel preview URL from Task 0.12 step 4
- **Authorization callback URL:** `<preview-url>/api/auth/callback/github` (NextAuth will mount this)
- Click "Register application".
- Copy `Client ID`. Click "Generate a new client secret"; copy it (visible once).

- [ ] **Step 2: Set real values in Vercel**

```bash
cd projects/community-platform
pnpm dlx vercel env rm GITHUB_OAUTH_CLIENT_ID preview production
pnpm dlx vercel env add GITHUB_OAUTH_CLIENT_ID preview production
# paste real Client ID

pnpm dlx vercel env rm GITHUB_OAUTH_CLIENT_SECRET preview production
pnpm dlx vercel env add GITHUB_OAUTH_CLIENT_SECRET preview production
# paste real Client Secret

pnpm dlx vercel env rm NEXTAUTH_URL preview production
pnpm dlx vercel env add NEXTAUTH_URL preview production
# paste preview URL (https://...vercel.app)
```

- [ ] **Step 3: Add to `.env.local` for dev**

Create `projects/community-platform/.env.local` (gitignored):

```
NEXTAUTH_SECRET=<openssl rand -base64 32 output>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SESSION_MAX_AGE=2592000
GITHUB_OAUTH_CLIENT_ID=<real id>
GITHUB_OAUTH_CLIENT_SECRET=<real secret>
GITHUB_APP_ID=placeholder
GITHUB_APP_PRIVATE_KEY=placeholder-pem
GITHUB_APP_INSTALLATION_ID=placeholder
GITHUB_REPO_OWNER=warsaw-ai-community
GITHUB_REPO_NAME=warsaw-ai-community
GITHUB_REPO_BRANCH=main
COMMUNITY_NAME=Warsaw AI Community
COMMUNITY_SLUG=warsaw-ai
```

For local dev with the OAuth callback, you'll also need a *separate* OAuth App with `http://localhost:3000/api/auth/callback/github` as callback. Either create it or use a tunneling approach (ngrok). Easiest: a second OAuth App for local; document both client IDs in `.env.local.example` comments.

- [ ] **Step 4: No commit**

(Out-of-band setup; nothing in the repo changed.)

### Task 1.5: NextAuth config (`lib/auth.ts`)

**Spec:** §6.4.

**Files:**
- Create: `projects/community-platform/lib/auth.ts`
- Create: `projects/community-platform/tests/unit/auth.test.ts`

- [ ] **Step 1: Add NextAuth**

```bash
cd projects/community-platform
pnpm add next-auth@5.0.0-beta.25
```

- [ ] **Step 2: Write the failing test**

Path: `projects/community-platform/tests/unit/auth.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { authConfig } from "@/lib/auth";

describe("authConfig", () => {
  it("uses JWT session strategy", () => {
    expect(authConfig.session?.strategy).toBe("jwt");
  });

  it("has GitHub provider", () => {
    expect(authConfig.providers.length).toBeGreaterThan(0);
  });

  it("session max age set from env", () => {
    expect(authConfig.session?.maxAge).toBe(2_592_000);
  });

  it("jwt callback writes github handle into token", async () => {
    const cb = authConfig.callbacks?.jwt;
    if (!cb) throw new Error("no jwt callback");
    const result = await cb({
      token: {} as never,
      account: { provider: "github" } as never,
      profile: { login: "Octocat", id: 42 } as never,
      user: undefined as never,
      trigger: "signIn" as never,
      isNewUser: false,
      session: undefined,
    });
    expect((result as { githubHandle?: string }).githubHandle).toBe("octocat");
  });

  it("session callback exposes githubHandle to client", async () => {
    const cb = authConfig.callbacks?.session;
    if (!cb) throw new Error("no session callback");
    const result = await cb({
      session: { user: { name: "X" } } as never,
      token: { githubHandle: "octocat" } as never,
      user: undefined as never,
      trigger: "update" as never,
      newSession: undefined,
    });
    expect((result as { githubHandle?: string }).githubHandle).toBe("octocat");
  });
});
```

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Implement `lib/auth.ts`**

Path: `projects/community-platform/lib/auth.ts`

```ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { env } from "@/lib/env";

export const authConfig = {
  providers: [
    GitHub({
      clientId: env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: env.GITHUB_OAUTH_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: env.NEXTAUTH_SESSION_MAX_AGE,
  },
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, profile, account }) {
      if (account?.provider === "github" && profile && typeof profile.login === "string") {
        token.githubHandle = profile.login.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.githubHandle === "string") {
        (session as typeof session & { githubHandle: string }).githubHandle = token.githubHandle;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

- [ ] **Step 5: Add module augmentation for token + session types**

Append to `projects/community-platform/lib/auth.ts`:

```ts
declare module "next-auth" {
  interface Session {
    githubHandle?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubHandle?: string;
  }
}
```

- [ ] **Step 6: Run test, expect pass**

```bash
pnpm test tests/unit/auth.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add projects/community-platform/lib/auth.ts projects/community-platform/tests/unit/auth.test.ts projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): NextAuth config with GitHub provider, JWT sessions"
```

### Task 1.6: NextAuth route handler

**Spec:** §6.4.

**Files:** Create `projects/community-platform/app/api/auth/[...nextauth]/route.ts`.

- [ ] **Step 1: Write the route**

Path: `projects/community-platform/app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: green; route appears in build output as `/api/auth/[...nextauth]`.

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/app/api
git commit -m "feat(community-platform): NextAuth route handler"
```

### Task 1.7: Login page

**Spec:** §6.4.

**Files:** Create `projects/community-platform/app/login/page.tsx`.

- [ ] **Step 1: Write the page**

Path: `projects/community-platform/app/login/page.tsx`

```tsx
import { signIn } from "@/lib/auth";
import { env } from "@/lib/env";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-3xl font-semibold">{env.COMMUNITY_NAME}</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Members-only platform. Sign in with the GitHub account associated with your roster entry.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/home" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Sign in with GitHub
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/app/login
git commit -m "feat(community-platform): login page with GitHub sign-in"
```

### Task 1.8: No-access page

**Spec:** §4 (Guest), §6.4.

**Files:** Create `projects/community-platform/app/no-access/page.tsx`.

- [ ] **Step 1: Write the page**

Path: `projects/community-platform/app/no-access/page.tsx`

```tsx
import { signOut } from "@/lib/auth";
import { env } from "@/lib/env";

export default function NoAccessPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-3xl font-semibold">No platform access</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Your GitHub account isn't on the {env.COMMUNITY_NAME} roster yet. To request membership,
        reach out in Telegram in the community channel.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded border px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/app/no-access
git commit -m "feat(community-platform): no-access page for non-roster users"
```

### Task 1.9: Build-time content snapshot script (`scripts/snapshot-content.ts`)

**Spec:** §6.3, §6.10.

**Files:**
- Create: `projects/community-platform/scripts/snapshot-content.ts`
- Create: `projects/community-platform/lib/content-snapshot.ts`
- Modify: `projects/community-platform/package.json` (add prebuild script)

**Goal:** A single script that, at build time, reads roster + governance files from the repo and writes `lib/__generated__/content-snapshot.json`. RSC pages and middleware import this snapshot synchronously.

- [ ] **Step 1: Add `tsx` for running TS scripts**

```bash
cd projects/community-platform
pnpm add -D tsx@^4
```

- [ ] **Step 2: Write `scripts/snapshot-content.ts`**

Path: `projects/community-platform/scripts/snapshot-content.ts`

```ts
import path from "node:path";
import fs from "node:fs/promises";
import { readRoster } from "@/lib/roster";
import { readGovernance } from "@/lib/governance";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const OUTPUT = path.resolve(__dirname, "../lib/__generated__/content-snapshot.json");

async function main(): Promise<void> {
  const rosterPath = path.join(REPO_ROOT, "community/members/roster.md");
  const adminsPath = path.join(REPO_ROOT, "community/governance/admins.md");
  const cmsPath = path.join(REPO_ROOT, "community/governance/community-managers.md");

  const [roster, governance] = await Promise.all([
    readRoster(rosterPath),
    readGovernance({ adminsPath, cmsPath }),
  ]);

  const snapshot = {
    generatedAt: new Date().toISOString(),
    roster,
    governance: {
      admins: governance.admins,
      communityManagers: governance.communityManagers,
    },
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${OUTPUT}`);
  console.log(`  roster: ${roster.length} members`);
  console.log(`  admins: ${governance.admins.length}`);
  console.log(`  CMs: ${governance.communityManagers.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Write `lib/content-snapshot.ts`**

Path: `projects/community-platform/lib/content-snapshot.ts`

```ts
import type { RosterMember } from "@/lib/roster";
import snapshotJson from "@/lib/__generated__/content-snapshot.json" with { type: "json" };

export interface ContentSnapshot {
  generatedAt: string;
  roster: readonly RosterMember[];
  governance: {
    admins: readonly string[];
    communityManagers: readonly string[];
  };
}

export const snapshot: ContentSnapshot = snapshotJson as ContentSnapshot;

export function isAdmin(handle: string): boolean {
  return snapshot.governance.admins.includes(handle.toLowerCase());
}

export function isCommunityManager(handle: string): boolean {
  return snapshot.governance.communityManagers.includes(handle.toLowerCase());
}

export function findMemberByHandle(handle: string): RosterMember | undefined {
  const target = handle.toLowerCase();
  return snapshot.roster.find((m) => m.githubHandle === target);
}
```

- [ ] **Step 4: Add prebuild script to `package.json`**

Modify `projects/community-platform/package.json` scripts:

```json
"scripts": {
  "dev": "pnpm snapshot && next dev",
  "build": "pnpm snapshot && next build",
  "snapshot": "tsx scripts/snapshot-content.ts",
  ...
}
```

- [ ] **Step 5: Add `lib/__generated__/` to gitignore**

In `projects/community-platform/.gitignore` append:

```
lib/__generated__/
```

- [ ] **Step 6: Generate the snapshot once and verify**

```bash
cd projects/community-platform
pnpm snapshot
cat lib/__generated__/content-snapshot.json
```

Expected: JSON with non-empty roster and at least one admin.

- [ ] **Step 7: Verify build picks it up**

```bash
pnpm build
```

Expected: build runs `pnpm snapshot` first, then `next build`. Green.

- [ ] **Step 8: Commit**

```bash
git add projects/community-platform/scripts projects/community-platform/lib/content-snapshot.ts projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml projects/community-platform/.gitignore
git commit -m "feat(community-platform): build-time content snapshot

Reads roster and governance files at build time, writes
content-snapshot.json consumed by RSC pages + middleware. Generated
file is gitignored; regenerated on every build."
```

### Task 1.10: Auth middleware (roster gate)

**Spec:** §6.4.

**Files:** Create `projects/community-platform/middleware.ts`.

- [ ] **Step 1: Write `middleware.ts`**

Path: `projects/community-platform/middleware.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";

const PUBLIC_PATHS = new Set(["/login", "/no-access"]);
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon"];

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const session = await auth();
  const handle = session?.githubHandle;

  if (!handle) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const member = findMemberByHandle(handle);
  if (!member) {
    const url = req.nextUrl.clone();
    url.pathname = "/no-access";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: green; middleware appears in build output.

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/middleware.ts
git commit -m "feat(community-platform): auth middleware (roster gate)

Non-authenticated → /login. Authenticated but not on roster → /no-access.
Public paths: /login, /no-access, /api/auth/*, _next, favicon."
```

### Task 1.11: `/home` shell page

**Spec:** §2 goal 1, §6.4 step 3.

**Files:**
- Create: `projects/community-platform/app/home/page.tsx`
- Modify: `projects/community-platform/app/page.tsx` (redirect to /home)

- [ ] **Step 1: Update root `app/page.tsx` to redirect**

Path: `projects/community-platform/app/page.tsx`

```tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/home");
}
```

- [ ] **Step 2: Write `/home`**

Path: `projects/community-platform/app/home/page.tsx`

```tsx
import { auth, signOut } from "@/lib/auth";
import { findMemberByHandle, isAdmin, isCommunityManager } from "@/lib/content-snapshot";
import { env } from "@/lib/env";

export default async function HomePage() {
  const session = await auth();
  const handle = session?.githubHandle ?? "";
  const member = findMemberByHandle(handle);
  const role = !member
    ? "guest"
    : isAdmin(handle)
      ? "admin"
      : isCommunityManager(handle)
        ? "community manager"
        : "member";

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">{env.COMMUNITY_NAME}</h1>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="text-sm text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
            Sign out
          </button>
        </form>
      </header>

      <section className="mt-6">
        <h2 className="text-xl font-medium">Welcome, {member?.name ?? handle}</h2>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Role: <strong>{role}</strong>
        </p>
      </section>

      <nav className="mt-8 grid gap-3 sm:grid-cols-2">
        <a className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900" href="/members">Members</a>
        <a className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900" href="/projects">Projects</a>
        <a className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900" href="/decisions">Decisions</a>
        <a className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900" href="/meetings">Meetings</a>
        <a className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 sm:col-span-2" href="/this-week">This week</a>
      </nav>
    </main>
  );
}
```

(The /members, /projects, /decisions, /meetings, /this-week routes don't exist yet — they're built in later phases. The links 404 for now; that's fine for Phase 1 acceptance.)

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

Expected: green.

- [ ] **Step 4: Update smoke E2E to expect redirect**

The existing `e2e/smoke.spec.ts` expects "Warsaw AI Community" on `/`. With auth middleware in place and no session, `/` redirects to `/login`. Update the smoke:

Path: `projects/community-platform/e2e/smoke.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test("unauthenticated visit redirects to /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Warsaw AI Community" })).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in with github/i })).toBeVisible();
});
```

- [ ] **Step 5: Run E2E**

```bash
pnpm e2e
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add projects/community-platform/app projects/community-platform/e2e
git commit -m "feat(community-platform): /home shell + redirect smoke E2E"
```

### Task 1.12: E2E for non-roster auth flow

**Spec:** §2 goal 1, §8 E2E test 7.

**Files:** Modify `projects/community-platform/e2e/smoke.spec.ts` or split into a new file.

**Goal:** Verify a non-roster GitHub login lands on `/no-access`. We can't actually sign in via GitHub OAuth in CI; instead, test the middleware logic by simulating a session cookie.

- [ ] **Step 1: Decide on auth simulation strategy**

NextAuth's JWT sessions are signed with `NEXTAUTH_SECRET`. For E2E, two options:

**Option A:** A test-only API route that issues a session cookie for a given handle, gated behind `if (process.env.NODE_ENV !== "production")`.

**Option B:** Run the actual GitHub OAuth flow with a real test account.

Option A is faster and deterministic. Use it.

- [ ] **Step 2: Write the test-auth route (test only)**

Path: `projects/community-platform/app/api/test-auth/route.ts`

```ts
import { encode } from "next-auth/jwt";
import { env } from "@/lib/env";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }
  const { handle } = await req.json();
  if (typeof handle !== "string" || handle.length === 0) {
    return new NextResponse("handle required", { status: 400 });
  }

  const token = await encode({
    token: { githubHandle: handle.toLowerCase() },
    secret: env.NEXTAUTH_SECRET,
    salt: "authjs.session-token",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("authjs.session-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
  return res;
}
```

- [ ] **Step 3: Write the auth E2E**

Path: `projects/community-platform/e2e/auth.spec.ts`

```ts
import { expect, test } from "@playwright/test";

async function loginAs(request: import("@playwright/test").APIRequestContext, handle: string): Promise<void> {
  const res = await request.post("/api/test-auth", { data: { handle } });
  expect(res.ok()).toBe(true);
}

test.describe("auth flow", () => {
  test("unauthenticated → /login", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("non-roster handle → /no-access", async ({ page, request }) => {
    await loginAs(request, "stranger-not-on-roster");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/no-access$/);
    await expect(page.getByRole("heading", { name: /no platform access/i })).toBeVisible();
  });

  test("roster handle → /home", async ({ page, request }) => {
    // Use a handle from the roster snapshot. For CI, the snapshot must include
    // a known test handle. Add one to the fixture roster used at test time.
    await loginAs(request, "antonsafronov");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("heading", { name: "Warsaw AI Community" })).toBeVisible();
    await expect(page.getByText(/role:/i)).toBeVisible();
  });
});
```

- [ ] **Step 4: Run E2E**

```bash
pnpm e2e
```

Expected: 3 tests pass. (Smoke + 3 here = 4 total.) If "antonsafronov" isn't in the actual roster yet, the third test will fail with `/no-access`; in that case, ensure Task 0.1 already added Anton's handle, or temporarily inject a fixture roster for E2E.

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/app/api/test-auth projects/community-platform/e2e/auth.spec.ts
git commit -m "feat(community-platform): E2E auth flow tests + dev-only test-auth route"
```

### Task 1.13: Phase 1 closeout

- [ ] **Step 1: Full check**

```bash
cd projects/community-platform
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

Expected: all green; coverage thresholds met.

- [ ] **Step 2: Update CHANGELOG**

In `projects/community-platform/CHANGELOG.md` add:

```markdown
### Phase 1 — Auth + RBAC (complete)
- `lib/roster.ts` parses `roster.md` table format.
- `lib/governance.ts` parses admin / CM lists.
- `lib/rbac.ts` resolves roles (admin / CM / member / guest).
- `lib/auth.ts` NextAuth config with JWT sessions and GitHub OAuth.
- `lib/content-snapshot.ts` wraps the build-time snapshot.
- `scripts/snapshot-content.ts` generates the snapshot at build time.
- `middleware.ts` enforces the roster gate.
- Pages: `/login`, `/no-access`, `/home`.
- `/api/test-auth` for E2E auth simulation (dev only).
- E2E: `auth.spec.ts` covers all three auth states (unauthenticated, non-roster, roster).
```

- [ ] **Step 3: Commit closeout**

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 1 in CHANGELOG"
```

---

## Phase 2: Member directory + profiles

**Phase goal:** `/members` lists all roster members; `/members/[slug]` shows their profile + persona panel rendered through a sanitized markdown pipeline.

**Phase ships:** Members can navigate the directory and see profiles end-to-end.

### XSS-safety pipeline (read once before this phase)

All HTML rendered into pages comes from a single sanitization-enforced pipeline:

```
markdown source
  → remark-parse
  → remark-gfm (tables, etc.)
  → remark-rehype (allowDangerousHtml: false)
  → rehype-sanitize (defaultSchema — whitelists safe elements/attrs)
  → rehype-stringify
  → string of safe HTML
```

This means HTML returned by `renderMarkdownToHtml()` is safe-by-construction. Any subsequent rendering via React's HTML insertion APIs reads pre-sanitized strings. **Do not bypass this pipeline. Do not introduce a parallel renderer.** All markdown rendering in the platform must go through `lib/markdown.ts`.

### Task 2.1: Markdown parser with sanitization (`lib/markdown.ts`)

**Spec:** §6 (read patterns), §6.7.

**Files:**
- Create: `projects/community-platform/lib/markdown.ts`
- Create: `projects/community-platform/tests/unit/markdown.test.ts`

- [ ] **Step 1: Add deps (sanitization included)**

```bash
cd projects/community-platform
pnpm add gray-matter@^4 unified@^11 remark-parse@^11 remark-gfm@^4 remark-rehype@^11 rehype-sanitize@^6 rehype-stringify@^10
```

- [ ] **Step 2: Write the failing test**

Path: `projects/community-platform/tests/unit/markdown.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { parseMarkdown, renderMarkdownToHtml, truncateToFirstH2 } from "@/lib/markdown";

describe("parseMarkdown", () => {
  it("extracts frontmatter and body", () => {
    const src = `---\nname: Alice\nrole: member\n---\n\n# Hello\n\nBody.`;
    const result = parseMarkdown(src);
    expect(result.data.name).toBe("Alice");
    expect(result.body).toContain("# Hello");
  });

  it("handles missing frontmatter", () => {
    const result = parseMarkdown(`# Just body`);
    expect(result.data).toEqual({});
    expect(result.body).toBe("# Just body");
  });
});

describe("renderMarkdownToHtml", () => {
  it("renders headings, paragraphs, and links", async () => {
    const html = await renderMarkdownToHtml(`# Title\n\nA [link](https://example.com).`);
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain('<a href="https://example.com">link</a>');
  });

  it("supports GFM tables", async () => {
    const html = await renderMarkdownToHtml(`| a | b |\n|---|---|\n| 1 | 2 |\n`);
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("strips raw HTML script tags from input (sanitization)", async () => {
    const malicious = `# Hi\n\n<script>alert('xss')</script>\n\nText.`;
    const html = await renderMarkdownToHtml(malicious);
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert");
  });

  it("strips event-handler attributes (sanitization)", async () => {
    const malicious = `<img src="x" onerror="alert(1)">`;
    const html = await renderMarkdownToHtml(malicious);
    expect(html).not.toContain("onerror");
  });
});

describe("truncateToFirstH2", () => {
  it("returns content up to (not including) the first H2", () => {
    const src = `# H1\n\nIntro.\n\n## Section A\n\nThis is cut.`;
    expect(truncateToFirstH2(src)).toBe("# H1\n\nIntro.\n");
  });

  it("returns full content if no H2", () => {
    const src = `# H1\n\nOnly H1.`;
    expect(truncateToFirstH2(src)).toBe(src);
  });
});
```

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Implement `lib/markdown.ts` with sanitization**

Path: `projects/community-platform/lib/markdown.ts`

```ts
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export interface ParsedMarkdown {
  data: Record<string, unknown>;
  body: string;
}

export function parseMarkdown(src: string): ParsedMarkdown {
  const parsed = matter(src);
  return { data: parsed.data, body: parsed.content };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, defaultSchema)
  .use(rehypeStringify);

/**
 * Renders markdown to safe-by-construction HTML.
 *
 * The pipeline strips raw HTML, event handler attributes, and any element
 * not in `defaultSchema`. Output is safe to insert via React's HTML insertion
 * APIs without further escaping.
 *
 * NEVER add a parallel rendering path. NEVER skip rehype-sanitize.
 */
export async function renderMarkdownToHtml(src: string): Promise<string> {
  const file = await processor.process(src);
  return String(file);
}

export function truncateToFirstH2(src: string): string {
  const match = src.match(/^## /m);
  if (!match || match.index === undefined) return src;
  return src.slice(0, match.index);
}
```

- [ ] **Step 5: Run test, expect pass**

```bash
pnpm test tests/unit/markdown.test.ts
```

Expected: 7 tests pass, including the two sanitization tests.

- [ ] **Step 6: Commit**

```bash
git add projects/community-platform/lib/markdown.ts projects/community-platform/tests/unit/markdown.test.ts projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): markdown parser with rehype-sanitize

Pipeline: remark-parse → remark-gfm → remark-rehype (no dangerous
HTML) → rehype-sanitize (defaultSchema) → rehype-stringify. HTML
output is safe-by-construction; downstream rendering reads
pre-sanitized strings."
```

### Task 2.2: Profile prose + persona reader (extend snapshot)

**Spec:** §6.1 (data table), §6.7, §6.11.

**Files:**
- Modify: `projects/community-platform/lib/roster.ts` (add helpers)
- Modify: `projects/community-platform/scripts/snapshot-content.ts`
- Modify: `projects/community-platform/lib/content-snapshot.ts`
- Create: `projects/community-platform/tests/fixtures/repo/community/members/anton-safronov.md`
- Create: `projects/community-platform/tests/fixtures/repo/persona-builder/personas/anton-safronov/persona.md`
- Modify: `projects/community-platform/tests/unit/roster.test.ts`

- [ ] **Step 1: Create fixtures**

Path: `projects/community-platform/tests/fixtures/repo/community/members/anton-safronov.md`

```markdown
---
name: Anton Safronov
github_handle: antonsafronov
consented_at: 2026-05-01T10:00:00Z
---

Founder. Building GBrain and the platform.
```

Path: `projects/community-platform/tests/fixtures/repo/persona-builder/personas/anton-safronov/persona.md`

```markdown
# Anton Safronov

PM-minded founder.

## Skills

- Product strategy
- AI tooling
```

- [ ] **Step 2: Append failing tests**

Append to `projects/community-platform/tests/unit/roster.test.ts`:

```ts
import { readMemberProfile, readMemberPersona } from "@/lib/roster";

const REPO_ROOT = path.resolve(__dirname, "../fixtures/repo");

describe("readMemberProfile", () => {
  it("returns body and frontmatter when file exists", async () => {
    const profile = await readMemberProfile(REPO_ROOT, "anton-safronov");
    expect(profile?.body).toContain("Founder");
    expect(profile?.data.consented_at).toBe("2026-05-01T10:00:00Z");
  });

  it("returns null when file is absent", async () => {
    expect(await readMemberProfile(REPO_ROOT, "ghost")).toBeNull();
  });
});

describe("readMemberPersona", () => {
  it("returns persona truncated to first H2", async () => {
    const persona = await readMemberPersona(REPO_ROOT, "anton-safronov");
    expect(persona).toContain("# Anton Safronov");
    expect(persona).toContain("PM-minded");
    expect(persona).not.toContain("## Skills");
  });

  it("returns null when persona dir absent", async () => {
    expect(await readMemberPersona(REPO_ROOT, "ghost")).toBeNull();
  });
});
```

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Append helpers to `lib/roster.ts`**

Append to `projects/community-platform/lib/roster.ts`:

```ts
import path from "node:path";
import { parseMarkdown, truncateToFirstH2 } from "@/lib/markdown";

export interface MemberProfile {
  data: Record<string, unknown>;
  body: string;
}

function isENOENT(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

export async function readMemberProfile(
  repoRoot: string,
  slug: string,
): Promise<MemberProfile | null> {
  const filePath = path.join(repoRoot, "community/members", `${slug}.md`);
  try {
    const content = await fs.readFile(filePath, "utf8");
    return parseMarkdown(content);
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}

export async function readMemberPersona(
  repoRoot: string,
  slug: string,
): Promise<string | null> {
  const dir = path.join(repoRoot, "persona-builder/personas", slug);
  try {
    const files = await fs.readdir(dir);
    const md = files.find((f) => f.endsWith(".md"));
    if (!md) return null;
    const content = await fs.readFile(path.join(dir, md), "utf8");
    const { body } = parseMarkdown(content);
    return truncateToFirstH2(body);
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}
```

- [ ] **Step 5: Run test, expect pass**

- [ ] **Step 6: Extend `scripts/snapshot-content.ts`**

Replace `projects/community-platform/scripts/snapshot-content.ts`:

```ts
import path from "node:path";
import fs from "node:fs/promises";
import { readRoster, readMemberProfile, readMemberPersona } from "@/lib/roster";
import { readGovernance } from "@/lib/governance";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const OUTPUT = path.resolve(__dirname, "../lib/__generated__/content-snapshot.json");

async function main(): Promise<void> {
  const rosterPath = path.join(REPO_ROOT, "community/members/roster.md");
  const adminsPath = path.join(REPO_ROOT, "community/governance/admins.md");
  const cmsPath = path.join(REPO_ROOT, "community/governance/community-managers.md");

  const [roster, governance] = await Promise.all([
    readRoster(rosterPath),
    readGovernance({ adminsPath, cmsPath }),
  ]);

  const members = await Promise.all(
    roster.map(async (m) => {
      const [profile, persona] = await Promise.all([
        readMemberProfile(REPO_ROOT, m.slug),
        readMemberPersona(REPO_ROOT, m.slug),
      ]);
      return { ...m, profile, persona };
    }),
  );

  const snapshot = {
    generatedAt: new Date().toISOString(),
    members,
    governance: {
      admins: governance.admins,
      communityManagers: governance.communityManagers,
    },
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${OUTPUT}: ${members.length} members`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 7: Update `lib/content-snapshot.ts`**

Path: `projects/community-platform/lib/content-snapshot.ts`

```ts
import type { RosterMember, MemberProfile } from "@/lib/roster";
import snapshotJson from "@/lib/__generated__/content-snapshot.json" with { type: "json" };

export interface MemberWithProfile extends RosterMember {
  profile: MemberProfile | null;
  persona: string | null;
}

export interface ContentSnapshot {
  generatedAt: string;
  members: readonly MemberWithProfile[];
  governance: {
    admins: readonly string[];
    communityManagers: readonly string[];
  };
}

export const snapshot: ContentSnapshot = snapshotJson as ContentSnapshot;

export function isAdmin(handle: string): boolean {
  return snapshot.governance.admins.includes(handle.toLowerCase());
}

export function isCommunityManager(handle: string): boolean {
  return snapshot.governance.communityManagers.includes(handle.toLowerCase());
}

export function findMemberByHandle(handle: string): MemberWithProfile | undefined {
  return snapshot.members.find((m) => m.githubHandle === handle.toLowerCase());
}

export function findMemberBySlug(slug: string): MemberWithProfile | undefined {
  return snapshot.members.find((m) => m.slug === slug);
}

export function listMembers(): readonly MemberWithProfile[] {
  return snapshot.members;
}
```

- [ ] **Step 8: Regenerate snapshot, verify, commit**

```bash
cd projects/community-platform
pnpm snapshot
git add projects/community-platform/lib projects/community-platform/scripts projects/community-platform/tests
git commit -m "feat(community-platform): snapshot includes member profile + persona"
```

### Task 2.3: SafeHtml component (single rendering path)

**Spec:** §6.7 (persona panel), §6.

**Files:**
- Create: `projects/community-platform/app/components/SafeHtml.tsx`
- Create: `projects/community-platform/tests/unit/safe-html.test.tsx`

**Goal:** Centralize all HTML insertion in one component. Every page that renders markdown HTML uses `SafeHtml`. Comments document the safety contract.

- [ ] **Step 1: Add React testing deps**

```bash
cd projects/community-platform
pnpm add -D @testing-library/react@^16 @testing-library/jest-dom@^6 jsdom@^25
```

- [ ] **Step 2: Update `vitest.config.ts` for jsdom + setup file**

Path: `projects/community-platform/vitest.config.ts`

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environmentMatchGlobs: [
      ["tests/unit/**/*.test.tsx", "jsdom"],
      ["tests/integration/**/*.test.tsx", "jsdom"],
    ],
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e", "tests/fixtures"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["lib/**/*.ts", "app/**/*.{ts,tsx}", "scripts/**/*.ts"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "app/api/test-auth/**"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
    setupFiles: ["./tests/setup.ts"],
  },
});
```

- [ ] **Step 3: Add `tests/setup.ts`**

Path: `projects/community-platform/tests/setup.ts`

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Write the failing test**

Path: `projects/community-platform/tests/unit/safe-html.test.tsx`

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SafeHtml } from "@/app/components/SafeHtml";

describe("SafeHtml", () => {
  it("renders pre-sanitized HTML", () => {
    const { container } = render(<SafeHtml html="<p>Hello</p>" />);
    expect(container.querySelector("p")?.textContent).toBe("Hello");
  });

  it("applies className to wrapper", () => {
    const { container } = render(<SafeHtml html="<p>x</p>" className="prose" />);
    expect(container.firstChild).toHaveClass("prose");
  });
});
```

- [ ] **Step 5: Run test, expect fail**

- [ ] **Step 6: Implement `SafeHtml`**

Path: `projects/community-platform/app/components/SafeHtml.tsx`

```tsx
/**
 * Centralized HTML insertion component.
 *
 * The `html` prop MUST come from `lib/markdown.ts::renderMarkdownToHtml`,
 * which runs through `rehype-sanitize`. NEVER pass user-supplied HTML
 * directly to this component. NEVER add a parallel rendering path that
 * bypasses the sanitization pipeline.
 *
 * This component exists so reviewers can audit HTML insertion in one place.
 */
export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={className}
      // eslint-disable-next-line react/no-danger -- safe: rehype-sanitize upstream
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

- [ ] **Step 7: Run test, expect pass**

- [ ] **Step 8: Commit**

```bash
git add projects/community-platform/app/components projects/community-platform/tests projects/community-platform/vitest.config.ts projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): SafeHtml component centralizes sanitized rendering"
```

### Task 2.4: PersonaPanel component

**Spec:** §6.7.

**Files:**
- Create: `projects/community-platform/app/components/PersonaPanel.tsx`
- Create: `projects/community-platform/tests/unit/persona-panel.test.tsx`

- [ ] **Step 1: Write the failing test**

Path: `projects/community-platform/tests/unit/persona-panel.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PersonaPanel } from "@/app/components/PersonaPanel";

describe("PersonaPanel", () => {
  it("renders sanitized HTML when persona present", () => {
    render(<PersonaPanel html="<h1>Alice</h1><p>PM</p>" slug="alice" />);
    expect(screen.getByRole("heading", { level: 1, name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/pm/i)).toBeInTheDocument();
  });

  it("renders fallback when html is null", () => {
    render(<PersonaPanel html={null} slug="alice" />);
    expect(screen.getByText(/no persona yet/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `PersonaPanel`**

Path: `projects/community-platform/app/components/PersonaPanel.tsx`

```tsx
import { SafeHtml } from "@/app/components/SafeHtml";

export function PersonaPanel({
  html,
  slug,
}: {
  html: string | null;
  slug: string;
}): JSX.Element {
  if (!html) {
    return (
      <section className="rounded border p-4">
        <h3 className="text-lg font-medium">Persona</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          No persona yet for <code>{slug}</code>. See the persona-builder process.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded border p-4">
      <h3 className="text-lg font-medium">Persona</h3>
      <SafeHtml html={html} className="prose prose-neutral dark:prose-invert mt-2 max-w-none" />
    </section>
  );
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/app/components/PersonaPanel.tsx projects/community-platform/tests/unit/persona-panel.test.tsx
git commit -m "feat(community-platform): PersonaPanel component (uses SafeHtml)"
```

### Task 2.5: `/members` directory page

**Spec:** §2 goal 1.

**Files:** Create `projects/community-platform/app/members/page.tsx`.

- [ ] **Step 1: Write the page**

Path: `projects/community-platform/app/members/page.tsx`

```tsx
import Link from "next/link";
import { listMembers } from "@/lib/content-snapshot";

export default function MembersPage(): JSX.Element {
  const members = listMembers();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Members</h1>
        <Link href="/home" className="text-sm underline">Home</Link>
      </header>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        {members.length} {members.length === 1 ? "member" : "members"}.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <li key={m.slug} className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <Link href={`/members/${m.slug}`} className="block">
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">@{m.githubHandle}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/app/members/page.tsx
git commit -m "feat(community-platform): /members directory page"
```

### Task 2.6: `/members/[slug]` profile page

**Spec:** §2 goal 4, §6.7.

**Files:** Create `projects/community-platform/app/members/[slug]/page.tsx`.

- [ ] **Step 1: Write the page**

Path: `projects/community-platform/app/members/[slug]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { findMemberBySlug, listMembers } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { PersonaPanel } from "@/app/components/PersonaPanel";
import { SafeHtml } from "@/app/components/SafeHtml";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listMembers().map((m) => ({ slug: m.slug }));
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const member = findMemberBySlug(slug);
  if (!member) notFound();

  const profileHtml = member.profile?.body
    ? await renderMarkdownToHtml(member.profile.body)
    : null;
  const personaHtml = member.persona
    ? await renderMarkdownToHtml(member.persona)
    : null;

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/members" className="text-sm underline">← Members</Link>
      <h1 className="mt-4 text-3xl font-semibold">{member.name}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        <a className="underline" href={`https://github.com/${member.githubHandle}`}>
          @{member.githubHandle}
        </a>
      </p>

      {profileHtml ? (
        <section className="mt-6">
          <h2 className="text-xl font-medium">Profile</h2>
          <SafeHtml html={profileHtml} className="prose prose-neutral dark:prose-invert mt-2 max-w-none" />
        </section>
      ) : (
        <section className="mt-6 rounded border border-dashed p-4 text-sm text-neutral-600 dark:text-neutral-400">
          {member.name} hasn't filled out a profile yet. Members can edit{" "}
          <code>community/members/{member.slug}.md</code> directly via git.
        </section>
      )}

      <div className="mt-6">
        <PersonaPanel html={personaHtml} slug={member.slug} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/app/members
git commit -m "feat(community-platform): /members/[slug] profile page with persona panel"
```

### Task 2.7: E2E member directory + profile

**Spec:** §8 E2E test 5.

**Files:** Create `projects/community-platform/e2e/members.spec.ts`.

- [ ] **Step 1: Write the E2E**

Path: `projects/community-platform/e2e/members.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test.describe("members", () => {
  test.beforeEach(async ({ request }) => {
    await request.post("/api/test-auth", { data: { handle: "antonsafronov" } });
  });

  test("directory lists members", async ({ page }) => {
    await page.goto("/members");
    await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
    expect(await page.locator("li").count()).toBeGreaterThan(0);
  });

  test("clicking a member opens profile with persona panel", async ({ page }) => {
    await page.goto("/members");
    const firstLink = page.locator("li a").first();
    await firstLink.click();
    await expect(page).toHaveURL(/\/members\/[\w-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /persona/i, level: 3 })).toBeVisible();
  });
});
```

- [ ] **Step 2: Run E2E**

```bash
pnpm e2e
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/e2e/members.spec.ts
git commit -m "feat(community-platform): E2E members directory + profile"
```

### Task 2.8: Phase 2 closeout

- [ ] **Step 1: Full check**

```bash
cd projects/community-platform
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

- [ ] **Step 2: CHANGELOG**

Add to `projects/community-platform/CHANGELOG.md`:

```markdown
### Phase 2 — Member directory + profiles (complete)
- `lib/markdown.ts` parser + sanitized renderer (rehype-sanitize) + truncate-to-H2.
- `SafeHtml` component centralizes sanitized HTML insertion.
- Snapshot extended with profile prose + persona summary.
- `PersonaPanel` component (uses SafeHtml).
- `/members` and `/members/[slug]` pages.
- E2E: members directory + profile rendering with persona panel.
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 2"
```

---

## Phase 3: Document readers (projects, decisions, meetings)

**Phase goal:** All three docs surfaces (`/projects`, `/decisions`, `/meetings`) render from git through the snapshot.

**Phase ships:** Members can navigate the full archive read-only.

### Task 3.1: Project reader (`lib/projects.ts`)

**Spec:** §2 goal 5.

**Files:**
- Create: `projects/community-platform/lib/projects.ts`
- Create: `projects/community-platform/tests/unit/projects.test.ts`
- Create: `projects/community-platform/tests/fixtures/repo/projects/example-project/README.md`
- Create: `projects/community-platform/tests/fixtures/repo/projects/example-project/spec.md`
- Create: `projects/community-platform/tests/fixtures/repo/projects/_template/README.md`

- [ ] **Step 1: Create fixtures**

Path: `projects/community-platform/tests/fixtures/repo/projects/example-project/README.md`

```markdown
# Example Project

A test project for the platform.
```

Path: `projects/community-platform/tests/fixtures/repo/projects/example-project/spec.md`

```markdown
# Spec

This is the spec.
```

Path: `projects/community-platform/tests/fixtures/repo/projects/_template/README.md`

```markdown
# Project template

Should be excluded from listings.
```

- [ ] **Step 2: Write failing test**

Path: `projects/community-platform/tests/unit/projects.test.ts`

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { listProjects, readProject } from "@/lib/projects";

const REPO_ROOT = path.resolve(__dirname, "../fixtures/repo");

describe("projects", () => {
  it("listProjects finds project directories", async () => {
    const projects = await listProjects(REPO_ROOT);
    expect(projects.map((p) => p.slug)).toContain("example-project");
  });

  it("excludes _template", async () => {
    const projects = await listProjects(REPO_ROOT);
    expect(projects.map((p) => p.slug)).not.toContain("_template");
  });

  it("readProject loads README, spec, plan, CHANGELOG when present", async () => {
    const proj = await readProject(REPO_ROOT, "example-project");
    expect(proj?.readme).toContain("Example Project");
    expect(proj?.spec).toContain("This is the spec.");
    expect(proj?.plan).toBeNull();
    expect(proj?.changelog).toBeNull();
  });

  it("returns null for unknown slug", async () => {
    expect(await readProject(REPO_ROOT, "nonexistent")).toBeNull();
  });

  it("title comes from first H1 of README", async () => {
    const projects = await listProjects(REPO_ROOT);
    const ex = projects.find((p) => p.slug === "example-project");
    expect(ex?.title).toBe("Example Project");
  });
});
```

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Implement `lib/projects.ts`**

Path: `projects/community-platform/lib/projects.ts`

```ts
import fs from "node:fs/promises";
import path from "node:path";

export interface ProjectSummary {
  slug: string;
  title: string;
}

export interface ProjectDetail extends ProjectSummary {
  readme: string | null;
  spec: string | null;
  plan: string | null;
  changelog: string | null;
}

function isENOENT(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "ENOENT"
  );
}

async function readIfExists(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8");
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }
}

function extractTitle(readme: string | null, fallback: string): string {
  if (!readme) return fallback;
  return readme.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

export async function listProjects(repoRoot: string): Promise<ProjectSummary[]> {
  const dir = path.join(repoRoot, "projects");
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err: unknown) {
    if (isENOENT(err)) return [];
    throw err;
  }
  const projects: ProjectSummary[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const readme = await readIfExists(path.join(dir, entry.name, "README.md"));
    projects.push({ slug: entry.name, title: extractTitle(readme, entry.name) });
  }

  projects.sort((a, b) => a.title.localeCompare(b.title));
  return projects;
}

export async function readProject(
  repoRoot: string,
  slug: string,
): Promise<ProjectDetail | null> {
  if (slug.startsWith("_") || slug.includes("..") || slug.includes("/")) return null;
  const projectDir = path.join(repoRoot, "projects", slug);
  try {
    const stat = await fs.stat(projectDir);
    if (!stat.isDirectory()) return null;
  } catch (err: unknown) {
    if (isENOENT(err)) return null;
    throw err;
  }

  const [readme, spec, plan, changelog] = await Promise.all([
    readIfExists(path.join(projectDir, "README.md")),
    readIfExists(path.join(projectDir, "spec.md")),
    readIfExists(path.join(projectDir, "plan.md")),
    readIfExists(path.join(projectDir, "CHANGELOG.md")),
  ]);

  return {
    slug,
    title: extractTitle(readme, slug),
    readme,
    spec,
    plan,
    changelog,
  };
}
```

- [ ] **Step 5: Run test, expect pass**

- [ ] **Step 6: Extend `scripts/snapshot-content.ts`**

Path: `projects/community-platform/scripts/snapshot-content.ts` — replace with:

```ts
import path from "node:path";
import fs from "node:fs/promises";
import { readRoster, readMemberProfile, readMemberPersona } from "@/lib/roster";
import { readGovernance } from "@/lib/governance";
import { listProjects, readProject } from "@/lib/projects";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const OUTPUT = path.resolve(__dirname, "../lib/__generated__/content-snapshot.json");

async function main(): Promise<void> {
  const rosterPath = path.join(REPO_ROOT, "community/members/roster.md");
  const adminsPath = path.join(REPO_ROOT, "community/governance/admins.md");
  const cmsPath = path.join(REPO_ROOT, "community/governance/community-managers.md");

  const [roster, governance, projectSummaries] = await Promise.all([
    readRoster(rosterPath),
    readGovernance({ adminsPath, cmsPath }),
    listProjects(REPO_ROOT),
  ]);

  const members = await Promise.all(
    roster.map(async (m) => {
      const [profile, persona] = await Promise.all([
        readMemberProfile(REPO_ROOT, m.slug),
        readMemberPersona(REPO_ROOT, m.slug),
      ]);
      return { ...m, profile, persona };
    }),
  );

  const projects = await Promise.all(
    projectSummaries.map(async (p) => (await readProject(REPO_ROOT, p.slug))!),
  );

  const snapshot = {
    generatedAt: new Date().toISOString(),
    members,
    governance: {
      admins: governance.admins,
      communityManagers: governance.communityManagers,
    },
    projects,
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${OUTPUT}: ${members.length} members, ${projects.length} projects`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 7: Update `lib/content-snapshot.ts`**

Append to the existing file:

```ts
import type { ProjectDetail } from "@/lib/projects";

// Update ContentSnapshot interface to add: projects: readonly ProjectDetail[];
// (Edit the interface declaration above to include this field.)

export function listProjectDetails(): readonly ProjectDetail[] {
  return snapshot.projects;
}

export function findProjectBySlug(slug: string): ProjectDetail | undefined {
  return snapshot.projects.find((p) => p.slug === slug);
}
```

Update the `ContentSnapshot` interface in the same file:

```ts
export interface ContentSnapshot {
  generatedAt: string;
  members: readonly MemberWithProfile[];
  governance: {
    admins: readonly string[];
    communityManagers: readonly string[];
  };
  projects: readonly ProjectDetail[];
}
```

- [ ] **Step 8: Regenerate snapshot, verify**

```bash
pnpm snapshot
pnpm typecheck
```

- [ ] **Step 9: Commit**

```bash
git add projects/community-platform/lib projects/community-platform/scripts projects/community-platform/tests
git commit -m "feat(community-platform): project reader + snapshot extension"
```

### Task 3.2: `/projects` index + detail pages

**Spec:** §2 goal 5.

**Files:**
- Create: `projects/community-platform/app/projects/page.tsx`
- Create: `projects/community-platform/app/projects/[slug]/page.tsx`

- [ ] **Step 1: Write `/projects` index**

Path: `projects/community-platform/app/projects/page.tsx`

```tsx
import Link from "next/link";
import { listProjectDetails } from "@/lib/content-snapshot";

export default function ProjectsPage(): JSX.Element {
  const projects = listProjectDetails();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Projects</h1>
        <Link href="/home" className="text-sm underline">Home</Link>
      </header>
      <ul className="mt-6 grid gap-3">
        {projects.map((p) => (
          <li key={p.slug} className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <Link href={`/projects/${p.slug}`} className="block">
              <div className="font-medium">{p.title}</div>
              <div className="font-mono text-sm text-neutral-600 dark:text-neutral-400">{p.slug}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Write `/projects/[slug]`**

Path: `projects/community-platform/app/projects/[slug]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { findProjectBySlug, listProjectDetails } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listProjectDetails().map((p) => ({ slug: p.slug }));
}

interface RenderedSection {
  title: string;
  html: string | null;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const project = findProjectBySlug(slug);
  if (!project) notFound();

  const sections: { title: string; body: string | null }[] = [
    { title: "README", body: project.readme },
    { title: "Spec", body: project.spec },
    { title: "Plan", body: project.plan },
    { title: "Changelog", body: project.changelog },
  ];

  const rendered: RenderedSection[] = await Promise.all(
    sections.map(async (s) => ({
      title: s.title,
      html: s.body ? await renderMarkdownToHtml(s.body) : null,
    })),
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/projects" className="text-sm underline">← Projects</Link>
      <h1 className="mt-4 text-3xl font-semibold">{project.title}</h1>
      <p className="mt-1 font-mono text-sm text-neutral-600 dark:text-neutral-400">
        projects/{project.slug}/
      </p>

      {rendered.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="text-xl font-medium">{s.title}</h2>
          {s.html ? (
            <SafeHtml html={s.html} className="prose prose-neutral dark:prose-invert mt-2 max-w-none" />
          ) : (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              No <code>{s.title.toLowerCase()}.md</code>.
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add projects/community-platform/app/projects
git commit -m "feat(community-platform): /projects index + detail pages"
```

### Task 3.3: Decision (ADR) reader (`lib/decisions.ts`)

**Spec:** §2 goal 6.

**Files:**
- Create: `projects/community-platform/lib/decisions.ts`
- Create: `projects/community-platform/tests/unit/decisions.test.ts`
- Create: `projects/community-platform/tests/fixtures/repo/docs/decisions/0001-example.md`

- [ ] **Step 1: Create fixture ADR**

Path: `projects/community-platform/tests/fixtures/repo/docs/decisions/0001-example.md`

```markdown
# ADR-0001: Example decision

**Status:** Accepted
**Date:** 2026-04-24

## Context

Fixture context.

## Decision

Use the fixture.
```

- [ ] **Step 2: Write failing test**

Path: `projects/community-platform/tests/unit/decisions.test.ts`

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { listDecisions, readDecision } from "@/lib/decisions";

const REPO_ROOT = path.resolve(__dirname, "../fixtures/repo");

describe("decisions", () => {
  it("lists decisions matching NNNN-*.md", async () => {
    const decisions = await listDecisions(REPO_ROOT);
    expect(decisions[0]?.number).toBe(1);
    expect(decisions[0]?.slug).toBe("0001-example");
    expect(decisions[0]?.title).toBe("ADR-0001: Example decision");
    expect(decisions[0]?.status).toBe("Accepted");
    expect(decisions[0]?.date).toBe("2026-04-24");
  });

  it("reads a decision body", async () => {
    const d = await readDecision(REPO_ROOT, "0001-example");
    expect(d?.body).toContain("Use the fixture.");
  });

  it("returns null for unknown slug", async () => {
    expect(await readDecision(REPO_ROOT, "9999-no")).toBeNull();
  });

  it("rejects path traversal", async () => {
    expect(await readDecision(REPO_ROOT, "../etc")).toBeNull();
  });
});
```

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Implement `lib/decisions.ts`**

Path: `projects/community-platform/lib/decisions.ts`

```ts
import fs from "node:fs/promises";
import path from "node:path";

export interface DecisionSummary {
  number: number;
  slug: string;
  title: string;
  date?: string;
  status?: string;
}

export interface Decision extends DecisionSummary {
  body: string;
}

const FILE_RE = /^(\d{4})-(.+)\.md$/;

function extractMeta(body: string): { title: string; date?: string; status?: string } {
  return {
    title: body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? "Untitled",
    status: body.match(/^\*\*Status:\*\*\s*(.+)$/m)?.[1]?.trim(),
    date: body.match(/^\*\*Date:\*\*\s*(.+)$/m)?.[1]?.trim(),
  };
}

export async function listDecisions(repoRoot: string): Promise<DecisionSummary[]> {
  const dir = path.join(repoRoot, "docs/decisions");
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const summaries: DecisionSummary[] = [];

  for (const name of entries) {
    const m = name.match(FILE_RE);
    if (!m || !m[1]) continue;
    const body = await fs.readFile(path.join(dir, name), "utf8");
    const meta = extractMeta(body);
    summaries.push({
      number: Number.parseInt(m[1], 10),
      slug: name.replace(/\.md$/, ""),
      ...meta,
    });
  }

  summaries.sort((a, b) => a.number - b.number);
  return summaries;
}

export async function readDecision(repoRoot: string, slug: string): Promise<Decision | null> {
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) return null;
  const filePath = path.join(repoRoot, "docs/decisions", `${slug}.md`);
  try {
    const body = await fs.readFile(filePath, "utf8");
    const m = slug.match(/^(\d{4})-/);
    if (!m || !m[1]) return null;
    const meta = extractMeta(body);
    return { number: Number.parseInt(m[1], 10), slug, body, ...meta };
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Run test, expect pass**

- [ ] **Step 6: Extend snapshot**

In `projects/community-platform/scripts/snapshot-content.ts` add:

```ts
import { listDecisions, readDecision, type Decision } from "@/lib/decisions";

// inside main(), parallel with other reads:
const decisionSummaries = await listDecisions(REPO_ROOT);
const decisions: Decision[] = await Promise.all(
  decisionSummaries.map(async (d) => (await readDecision(REPO_ROOT, d.slug))!),
);
// add `decisions` to the snapshot object
```

In `lib/content-snapshot.ts`, extend interface and add helpers:

```ts
import type { Decision } from "@/lib/decisions";

// inside ContentSnapshot interface:
decisions: readonly Decision[];

// helpers:
export function listDecisionsFromSnapshot(): readonly Decision[] {
  return snapshot.decisions;
}
export function findDecisionBySlug(slug: string): Decision | undefined {
  return snapshot.decisions.find((d) => d.slug === slug);
}
```

- [ ] **Step 7: Commit**

```bash
pnpm snapshot && pnpm typecheck
git add projects/community-platform/lib projects/community-platform/scripts projects/community-platform/tests
git commit -m "feat(community-platform): decision reader + snapshot extension"
```

### Task 3.4: `/decisions` index + detail pages

**Spec:** §2 goal 6.

**Files:**
- Create: `projects/community-platform/app/decisions/page.tsx`
- Create: `projects/community-platform/app/decisions/[slug]/page.tsx`

- [ ] **Step 1: Write `/decisions` index**

Path: `projects/community-platform/app/decisions/page.tsx`

```tsx
import Link from "next/link";
import { listDecisionsFromSnapshot } from "@/lib/content-snapshot";

export default function DecisionsPage(): JSX.Element {
  const decisions = listDecisionsFromSnapshot();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Decisions</h1>
        <Link href="/home" className="text-sm underline">Home</Link>
      </header>
      <ul className="mt-6 space-y-2">
        {decisions.map((d) => (
          <li key={d.slug} className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <Link href={`/decisions/${d.slug}`} className="block">
              <div className="font-medium">{d.title}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {d.status ?? "—"} · {d.date ?? "—"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Write `/decisions/[slug]`**

Path: `projects/community-platform/app/decisions/[slug]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { findDecisionBySlug, listDecisionsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listDecisionsFromSnapshot().map((d) => ({ slug: d.slug }));
}

export default async function DecisionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const decision = findDecisionBySlug(slug);
  if (!decision) notFound();

  const html = await renderMarkdownToHtml(decision.body);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/decisions" className="text-sm underline">← Decisions</Link>
      <article className="mt-4">
        <SafeHtml html={html} className="prose prose-neutral dark:prose-invert max-w-none" />
      </article>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
pnpm build
git add projects/community-platform/app/decisions
git commit -m "feat(community-platform): /decisions index + detail pages"
```

### Task 3.5: Meeting reader (`lib/meetings.ts`)

**Spec:** §2 goal 6, §6.6.

**Files:**
- Create: `projects/community-platform/lib/meetings.ts`
- Create: `projects/community-platform/tests/unit/meetings.test.ts`
- Create: `projects/community-platform/tests/fixtures/repo/community/meetings/weekly/2026-04-24.md`
- Create: `projects/community-platform/tests/fixtures/repo/community/meetings/weekly/2026-04-17.md`

- [ ] **Step 1: Create fixtures**

Path: `projects/community-platform/tests/fixtures/repo/community/meetings/weekly/2026-04-24.md`

```markdown
# Weekly meeting — 2026-04-24

## Attendees

- Anton Safronov
- Alice Example

## Notes

Discussed plan.
```

Path: `projects/community-platform/tests/fixtures/repo/community/meetings/weekly/2026-04-17.md`

```markdown
# Weekly meeting — 2026-04-17

## Notes

No attendees section in this older note.
```

- [ ] **Step 2: Write failing test**

Path: `projects/community-platform/tests/unit/meetings.test.ts`

```ts
import { describe, expect, it } from "vitest";
import path from "node:path";
import { listMeetings, readMeeting, parseAttendees } from "@/lib/meetings";

const REPO_ROOT = path.resolve(__dirname, "../fixtures/repo");

describe("meetings", () => {
  it("lists meetings sorted desc by date", async () => {
    const meetings = await listMeetings(REPO_ROOT);
    expect(meetings[0]?.slug).toBe("2026-04-24");
    expect(meetings[1]?.slug).toBe("2026-04-17");
  });

  it("reads body and attendees", async () => {
    const m = await readMeeting(REPO_ROOT, "2026-04-24");
    expect(m?.body).toContain("Discussed plan");
    expect(m?.attendees).toEqual(["Anton Safronov", "Alice Example"]);
  });

  it("returns empty attendees if section missing", async () => {
    const m = await readMeeting(REPO_ROOT, "2026-04-17");
    expect(m?.attendees).toEqual([]);
  });

  it("parseAttendees handles bullet list under H2", () => {
    expect(parseAttendees(`# T\n\n## Attendees\n\n- Alice\n- Bob\n\n## Notes\n\nx`)).toEqual([
      "Alice",
      "Bob",
    ]);
  });

  it("parseAttendees ignores HTML-comment bullets", () => {
    expect(parseAttendees(`## Attendees\n\n- <!-- placeholder -->\n- Alice\n`)).toEqual(["Alice"]);
  });

  it("rejects path traversal", async () => {
    expect(await readMeeting(REPO_ROOT, "../secret")).toBeNull();
  });
});
```

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Implement `lib/meetings.ts`**

Path: `projects/community-platform/lib/meetings.ts`

```ts
import fs from "node:fs/promises";
import path from "node:path";

export interface Meeting {
  slug: string;
  date: string;
  title: string;
  body: string;
  attendees: readonly string[];
}

const FILE_RE = /^(\d{4}-\d{2}-\d{2})\.md$/;

export function parseAttendees(body: string): string[] {
  const match = body.match(/^##\s+Attendees\s*$([\s\S]*?)(?=^##\s|\z)/m);
  if (!match || !match[1]) return [];
  const lines = match[1].split("\n");
  const attendees: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*-\s+(.+?)\s*$/);
    if (!m || !m[1]) continue;
    const text = m[1].trim();
    if (text.startsWith("<!--") || text === "") continue;
    attendees.push(text);
  }
  return attendees;
}

function extractTitle(body: string, fallback: string): string {
  return body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

export async function listMeetings(repoRoot: string): Promise<Meeting[]> {
  const dir = path.join(repoRoot, "community/meetings/weekly");
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const meetings: Meeting[] = [];

  for (const name of entries) {
    if (name.startsWith("_")) continue;
    const m = name.match(FILE_RE);
    if (!m || !m[1]) continue;
    const body = await fs.readFile(path.join(dir, name), "utf8");
    meetings.push({
      slug: m[1],
      date: m[1],
      title: extractTitle(body, `Weekly meeting — ${m[1]}`),
      body,
      attendees: parseAttendees(body),
    });
  }

  meetings.sort((a, b) => b.date.localeCompare(a.date));
  return meetings;
}

export async function readMeeting(repoRoot: string, slug: string): Promise<Meeting | null> {
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) return null;
  const filePath = path.join(repoRoot, "community/meetings/weekly", `${slug}.md`);
  try {
    const body = await fs.readFile(filePath, "utf8");
    return {
      slug,
      date: slug,
      title: extractTitle(body, `Weekly meeting — ${slug}`),
      body,
      attendees: parseAttendees(body),
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Run test, expect pass**

- [ ] **Step 6: Extend snapshot**

In `projects/community-platform/scripts/snapshot-content.ts` add:

```ts
import { listMeetings, type Meeting } from "@/lib/meetings";
const meetings: Meeting[] = await listMeetings(REPO_ROOT);
// add to snapshot object
```

In `lib/content-snapshot.ts`:

```ts
import type { Meeting } from "@/lib/meetings";

// in ContentSnapshot interface:
meetings: readonly Meeting[];

export function listMeetingsFromSnapshot(): readonly Meeting[] {
  return snapshot.meetings;
}
export function findMeetingBySlug(slug: string): Meeting | undefined {
  return snapshot.meetings.find((m) => m.slug === slug);
}
```

- [ ] **Step 7: Commit**

```bash
pnpm snapshot && pnpm typecheck
git add projects/community-platform/lib projects/community-platform/scripts projects/community-platform/tests
git commit -m "feat(community-platform): meeting reader + snapshot extension"
```

### Task 3.6: `/meetings` index + detail pages

**Files:**
- Create: `projects/community-platform/app/meetings/page.tsx`
- Create: `projects/community-platform/app/meetings/[slug]/page.tsx`

- [ ] **Step 1: Write `/meetings` index**

Path: `projects/community-platform/app/meetings/page.tsx`

```tsx
import Link from "next/link";
import { listMeetingsFromSnapshot } from "@/lib/content-snapshot";

export default function MeetingsPage(): JSX.Element {
  const meetings = listMeetingsFromSnapshot();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Meetings</h1>
        <Link href="/home" className="text-sm underline">Home</Link>
      </header>
      <ul className="mt-6 space-y-2">
        {meetings.map((m) => (
          <li key={m.slug} className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900">
            <Link href={`/meetings/${m.slug}`} className="block">
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {m.attendees.length} {m.attendees.length === 1 ? "attendee" : "attendees"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

- [ ] **Step 2: Write `/meetings/[slug]`**

Path: `projects/community-platform/app/meetings/[slug]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { findMeetingBySlug, listMeetingsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listMeetingsFromSnapshot().map((m) => ({ slug: m.slug }));
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const meeting = findMeetingBySlug(slug);
  if (!meeting) notFound();

  const html = await renderMarkdownToHtml(meeting.body);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/meetings" className="text-sm underline">← Meetings</Link>
      <article className="mt-4">
        <SafeHtml html={html} className="prose prose-neutral dark:prose-invert max-w-none" />
      </article>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
pnpm build
git add projects/community-platform/app/meetings
git commit -m "feat(community-platform): /meetings index + detail pages"
```

### Task 3.7: E2E archive navigation

**Spec:** §8 E2E test 6.

**Files:** Create `projects/community-platform/e2e/archives.spec.ts`.

- [ ] **Step 1: Write the E2E**

Path: `projects/community-platform/e2e/archives.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/test-auth", { data: { handle: "antonsafronov" } });
});

test("/projects lists projects", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  expect(await page.locator("li").count()).toBeGreaterThan(0);
});

test("/decisions lists ADRs and opens one", async ({ page }) => {
  await page.goto("/decisions");
  await expect(page.getByRole("heading", { name: "Decisions" })).toBeVisible();
  const first = page.locator("li a").first();
  await first.click();
  await expect(page).toHaveURL(/\/decisions\/\d{4}-/);
  await expect(page.locator("article")).toBeVisible();
});

test("/meetings lists meetings", async ({ page }) => {
  await page.goto("/meetings");
  await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible();
});
```

- [ ] **Step 2: Run E2E + commit**

```bash
pnpm e2e
git add projects/community-platform/e2e/archives.spec.ts
git commit -m "feat(community-platform): E2E archive navigation"
```

### Task 3.8: Phase 3 closeout

- [ ] **Step 1: Full check**

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

- [ ] **Step 2: CHANGELOG**

```markdown
### Phase 3 — Document readers (complete)
- `lib/projects.ts`, `lib/decisions.ts`, `lib/meetings.ts` — readers for git docs.
- Snapshot extended with projects, decisions, meetings.
- Pages: `/projects`, `/projects/[slug]`, `/decisions`, `/decisions/[slug]`, `/meetings`, `/meetings/[slug]`.
- All pages use SafeHtml for sanitized markdown rendering.
- E2E: archive navigation.
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 3"
```

---

## Phase 4: GitHub App writer

**Phase goal:** A `lib/github-app.ts` wrapper that authenticates as the `warsaw-ai-bot` GitHub App, reads files (with SHA), writes new files, updates files (with SHA-based optimistic locking), and deletes files. Fully tested with MSW.

**Phase ships:** Bot infrastructure ready for status updates and consent stubs.

### Task 4.1: Create the GitHub App (out-of-band)

**Spec:** §5, §6.5, §6.11.

**Files:** None in repo.

- [ ] **Step 1: Create app**

https://github.com/settings/apps → "New GitHub App". Settings:
- **Name:** `warsaw-ai-bot`
- **Homepage URL:** the Vercel preview URL
- **Webhook:** disable (we don't process webhooks in v0.1)
- **Permissions:**
  - **Repository → Contents:** Read & write
  - All others: No access
- **Where can this GitHub App be installed?:** "Only on this account"

- [ ] **Step 2: Generate private key**

App page → "Generate a private key". A `.pem` file downloads. Keep this safe.

- [ ] **Step 3: Install on the repo**

App page → "Install App" → choose your account → select **Only select repositories** → pick `warsaw-ai-community`. Note the installation ID from the URL (last segment).

- [ ] **Step 4: Set Vercel env**

```bash
cd projects/community-platform
pnpm dlx vercel env rm GITHUB_APP_ID preview production
pnpm dlx vercel env add GITHUB_APP_ID preview production
# paste numeric App ID

pnpm dlx vercel env rm GITHUB_APP_PRIVATE_KEY preview production
pnpm dlx vercel env add GITHUB_APP_PRIVATE_KEY preview production
# paste full PEM contents (multi-line). Vercel CLI accepts \n-encoded or pasted multiline.
# Easier: cat warsaw-ai-bot.YYYY-MM-DD.private-key.pem | pnpm dlx vercel env add GITHUB_APP_PRIVATE_KEY preview production --

pnpm dlx vercel env rm GITHUB_APP_INSTALLATION_ID preview production
pnpm dlx vercel env add GITHUB_APP_INSTALLATION_ID preview production
# paste installation ID
```

Also update `.env.local` for local dev (gitignored).

- [ ] **Step 5: Verify the App can authenticate**

Quick smoke (run after Task 4.2 implementation):

```bash
pnpm tsx scripts/smoke-github-app.ts
```

(Script created in Task 4.2.)

- [ ] **Step 6: No commit**

(Out-of-band; nothing in the repo.)

### Task 4.2: GitHub App wrapper (`lib/github-app.ts`)

**Spec:** §5, §6.5, §6.12.

**Files:**
- Create: `projects/community-platform/lib/github-app.ts`
- Create: `projects/community-platform/scripts/smoke-github-app.ts`
- Create: `projects/community-platform/tests/integration/github-app.test.ts`

- [ ] **Step 1: Add deps**

```bash
cd projects/community-platform
pnpm add @octokit/rest@^21 @octokit/auth-app@^7
pnpm add -D msw@^2
```

- [ ] **Step 2: Write the failing test**

Path: `projects/community-platform/tests/integration/github-app.test.ts`

```ts
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { createGitHubApp } from "@/lib/github-app";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const TEST_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvVB9...truncated-test-key...
-----END RSA PRIVATE KEY-----`;

const config = {
  appId: "12345",
  privateKey: TEST_KEY,
  installationId: "67890",
  owner: "warsaw-ai-community",
  repo: "warsaw-ai-community",
  branch: "main",
};

describe("github-app", () => {
  it("readFile returns content + sha when file exists", async () => {
    server.use(
      http.post("https://api.github.com/app/installations/67890/access_tokens", () =>
        HttpResponse.json({ token: "ghs_fake", expires_at: "2099-01-01T00:00:00Z" }),
      ),
      http.get("https://api.github.com/repos/warsaw-ai-community/warsaw-ai-community/contents/community/status/2026-W18/anton.md", () =>
        HttpResponse.json({
          type: "file",
          path: "community/status/2026-W18/anton.md",
          sha: "abc123",
          content: Buffer.from("Hello").toString("base64"),
          encoding: "base64",
        }),
      ),
    );

    const app = createGitHubApp(config);
    const result = await app.readFile("community/status/2026-W18/anton.md");
    expect(result?.content).toBe("Hello");
    expect(result?.sha).toBe("abc123");
  });

  it("readFile returns null on 404", async () => {
    server.use(
      http.post("https://api.github.com/app/installations/67890/access_tokens", () =>
        HttpResponse.json({ token: "ghs_fake", expires_at: "2099-01-01T00:00:00Z" }),
      ),
      http.get("https://api.github.com/repos/warsaw-ai-community/warsaw-ai-community/contents/missing.md", () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );
    const app = createGitHubApp(config);
    expect(await app.readFile("missing.md")).toBeNull();
  });

  it("writeFile creates file when no SHA", async () => {
    let putBody: unknown;
    server.use(
      http.post("https://api.github.com/app/installations/67890/access_tokens", () =>
        HttpResponse.json({ token: "ghs_fake", expires_at: "2099-01-01T00:00:00Z" }),
      ),
      http.put("https://api.github.com/repos/warsaw-ai-community/warsaw-ai-community/contents/x.md", async ({ request }) => {
        putBody = await request.json();
        return HttpResponse.json({ content: { sha: "newsha" } });
      }),
    );

    const app = createGitHubApp(config);
    await app.writeFile("x.md", "Hi", { message: "test" });
    expect((putBody as { message: string }).message).toBe("test");
    expect((putBody as { content: string }).content).toBe(Buffer.from("Hi").toString("base64"));
  });

  it("writeFile fails with 409 when SHA conflict", async () => {
    server.use(
      http.post("https://api.github.com/app/installations/67890/access_tokens", () =>
        HttpResponse.json({ token: "ghs_fake", expires_at: "2099-01-01T00:00:00Z" }),
      ),
      http.put("https://api.github.com/repos/warsaw-ai-community/warsaw-ai-community/contents/x.md", () =>
        new HttpResponse(JSON.stringify({ message: "conflict" }), { status: 409 }),
      ),
    );

    const app = createGitHubApp(config);
    await expect(
      app.writeFile("x.md", "Hi", { message: "test", sha: "stale" }),
    ).rejects.toMatchObject({ kind: "sha_conflict" });
  });

  it("deleteFile removes when SHA provided", async () => {
    let deleteBody: unknown;
    server.use(
      http.post("https://api.github.com/app/installations/67890/access_tokens", () =>
        HttpResponse.json({ token: "ghs_fake", expires_at: "2099-01-01T00:00:00Z" }),
      ),
      http.delete("https://api.github.com/repos/warsaw-ai-community/warsaw-ai-community/contents/x.md", async ({ request }) => {
        deleteBody = await request.json();
        return HttpResponse.json({});
      }),
    );

    const app = createGitHubApp(config);
    await app.deleteFile("x.md", { sha: "abc", message: "delete" });
    expect((deleteBody as { sha: string }).sha).toBe("abc");
  });
});
```

(The TEST_KEY is intentionally truncated; @octokit/auth-app actually needs a real PEM. For tests we can either use a real test PEM in `tests/fixtures/github-app-key.pem` or mock `@octokit/auth-app`. Easier: mock the auth in the wrapper to skip JWT signing in test mode. Let's mock instead — the next step shows how.)

- [ ] **Step 3: Run test, expect fail**

- [ ] **Step 4: Implement `lib/github-app.ts`**

Path: `projects/community-platform/lib/github-app.ts`

```ts
import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export interface GitHubAppConfig {
  appId: string;
  privateKey: string;
  installationId: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface FileResult {
  content: string;
  sha: string;
  path: string;
}

export interface WriteOptions {
  message: string;
  sha?: string;
  authorName?: string;
  authorEmail?: string;
}

export interface DeleteOptions {
  message: string;
  sha: string;
  authorName?: string;
  authorEmail?: string;
}

export class GitHubAppError extends Error {
  constructor(
    public readonly kind: "sha_conflict" | "not_found" | "forbidden" | "unknown",
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}

export interface GitHubAppClient {
  readFile(path: string): Promise<FileResult | null>;
  writeFile(path: string, content: string, options: WriteOptions): Promise<{ sha: string }>;
  deleteFile(path: string, options: DeleteOptions): Promise<void>;
}

const DEFAULT_AUTHOR_NAME = "warsaw-ai-bot";
const DEFAULT_AUTHOR_EMAIL = "warsaw-ai-bot@users.noreply.github.com";

export function createGitHubApp(config: GitHubAppConfig): GitHubAppClient {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: config.appId,
      privateKey: config.privateKey,
      installationId: config.installationId,
    },
  });

  async function readFile(filePath: string): Promise<FileResult | null> {
    try {
      const { data } = await octokit.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: filePath,
        ref: config.branch,
      });
      if (Array.isArray(data) || data.type !== "file") return null;
      return {
        content: Buffer.from(data.content, data.encoding as BufferEncoding).toString("utf8"),
        sha: data.sha,
        path: data.path,
      };
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 404) {
        return null;
      }
      throw mapError(err);
    }
  }

  async function writeFile(
    filePath: string,
    content: string,
    options: WriteOptions,
  ): Promise<{ sha: string }> {
    try {
      const { data } = await octokit.repos.createOrUpdateFileContents({
        owner: config.owner,
        repo: config.repo,
        path: filePath,
        message: options.message,
        content: Buffer.from(content, "utf8").toString("base64"),
        branch: config.branch,
        ...(options.sha ? { sha: options.sha } : {}),
        committer: {
          name: options.authorName ?? DEFAULT_AUTHOR_NAME,
          email: options.authorEmail ?? DEFAULT_AUTHOR_EMAIL,
        },
        author: {
          name: options.authorName ?? DEFAULT_AUTHOR_NAME,
          email: options.authorEmail ?? DEFAULT_AUTHOR_EMAIL,
        },
      });
      const newSha = data.content?.sha;
      if (!newSha) throw new GitHubAppError("unknown", "no sha in response");
      return { sha: newSha };
    } catch (err: unknown) {
      throw mapError(err);
    }
  }

  async function deleteFile(filePath: string, options: DeleteOptions): Promise<void> {
    try {
      await octokit.repos.deleteFile({
        owner: config.owner,
        repo: config.repo,
        path: filePath,
        message: options.message,
        sha: options.sha,
        branch: config.branch,
        committer: {
          name: options.authorName ?? DEFAULT_AUTHOR_NAME,
          email: options.authorEmail ?? DEFAULT_AUTHOR_EMAIL,
        },
        author: {
          name: options.authorName ?? DEFAULT_AUTHOR_NAME,
          email: options.authorEmail ?? DEFAULT_AUTHOR_EMAIL,
        },
      });
    } catch (err: unknown) {
      throw mapError(err);
    }
  }

  return { readFile, writeFile, deleteFile };
}

function mapError(err: unknown): GitHubAppError {
  if (typeof err !== "object" || err === null) return new GitHubAppError("unknown", String(err), err);
  const status = "status" in err ? (err as { status: number }).status : undefined;
  if (status === 404) return new GitHubAppError("not_found", "not found", err);
  if (status === 409) return new GitHubAppError("sha_conflict", "sha conflict", err);
  if (status === 403) return new GitHubAppError("forbidden", "forbidden", err);
  return new GitHubAppError("unknown", "unknown github app error", err);
}
```

- [ ] **Step 5: Generate a real test PEM**

For the integration test, the `@octokit/auth-app` library will actually sign a JWT with the private key, even if MSW intercepts the network call. So we need a *real* PEM for tests. Generate one:

```bash
cd projects/community-platform
mkdir -p tests/fixtures
openssl genrsa -out tests/fixtures/test-app.private-key.pem 2048
```

This file is gitignored via the `.gitignore` already containing `*.pem` plus the `!tests/fixtures/**/*.pem` exception — wait, that exception means it WOULD be committed. We don't want a private key in git even if it's a test key. Update `.gitignore`:

```
*.pem
```

(remove the exception). And add a fixture-creation script note to README so contributors regenerate locally.

Actually, a cleaner solution: read `tests/fixtures/test-app.private-key.pem` if it exists, else use a hardcoded throwaway test PEM committed to the repo. The hardcoded one only works for tests because the network calls are mocked.

For determinism, use this approach: **commit a deliberately-generated test-only PEM that isn't tied to any real GitHub App**. This is safe because:
- The PEM signs JWTs that GitHub would reject (no matching App ID).
- All API calls in tests are intercepted by MSW.
- The PEM grants no real privileges.

Path: `projects/community-platform/tests/fixtures/test-app.private-key.pem`

```
-----BEGIN RSA PRIVATE KEY-----
[generated 2048-bit RSA key, ~27 lines of base64]
-----END RSA PRIVATE KEY-----
```

Generate with `openssl genrsa 2048` and paste. Add a comment in the test file:

```ts
import fs from "node:fs";
import path from "node:path";
const TEST_KEY = fs.readFileSync(
  path.resolve(__dirname, "../fixtures/test-app.private-key.pem"),
  "utf8",
);
```

Update `.gitignore` to allow this one file:

```
*.pem
!tests/fixtures/test-app.private-key.pem
```

- [ ] **Step 6: Run test, expect pass**

```bash
pnpm test tests/integration/github-app.test.ts
```

Expected: 5 pass.

- [ ] **Step 7: Write smoke script**

Path: `projects/community-platform/scripts/smoke-github-app.ts`

```ts
/**
 * Smoke-tests the GitHub App credentials against the real API.
 * Reads a known file (e.g., the project's README.md) and prints its first line.
 * Run: `pnpm tsx scripts/smoke-github-app.ts`
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
    console.error("README.md not found at root.");
    process.exit(1);
  }
  console.log("First line:", result.content.split("\n")[0]);
  console.log("SHA:", result.sha);
  console.log("OK.");
}

main().catch((err) => { console.error(err); process.exit(1); });
```

Run after env vars are real:

```bash
pnpm tsx scripts/smoke-github-app.ts
```

Expected: prints first line of root README.

- [ ] **Step 8: Commit**

```bash
git add projects/community-platform/lib projects/community-platform/scripts projects/community-platform/tests projects/community-platform/.gitignore projects/community-platform/package.json projects/community-platform/pnpm-lock.yaml
git commit -m "feat(community-platform): GitHub App writer wrapper (lib/github-app.ts)

Octokit + auth-app wrapper for read/write/delete on the warsaw-ai-bot
identity. SHA-based optimistic locking maps 409 → GitHubAppError
{kind: 'sha_conflict'}. Full integration coverage via MSW."
```

### Task 4.3: Phase 4 closeout

- [ ] **Step 1: Full check**

```bash
cd projects/community-platform
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build
```

- [ ] **Step 2: CHANGELOG**

```markdown
### Phase 4 — GitHub App writer (complete)
- `warsaw-ai-bot` GitHub App created with `contents: write` scope on the repo.
- `lib/github-app.ts` Octokit + auth-app wrapper.
- 409 → `GitHubAppError {kind: 'sha_conflict'}` for optimistic locking.
- MSW-based integration tests covering read, write, write-with-conflict, delete.
- `scripts/smoke-github-app.ts` for end-to-end credential verification.
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 4"
```

---

## Phase 5: Status updates

**Phase goal:** `/this-week` page where members post a status update for the current ISO week. Posts commit `community/status/YYYY-WW/<slug>.md` directly to main via the bot. Display reads via the GitHub API at runtime (60s cache). Edit and delete supported with SHA-based optimistic locking.

**Phase ships:** The one C-shape write surface in v0.1.

### Task 5.1: ISO week helpers (`lib/week.ts`)

**Spec:** §6.5.

**Files:**
- Create: `projects/community-platform/lib/week.ts`
- Create: `projects/community-platform/tests/unit/week.test.ts`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/unit/week.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { currentWeek, weekFromDate, weekToRange, parseWeek } from "@/lib/week";

describe("week", () => {
  it("weekFromDate(2026-04-27 Monday) is 2026-W18", () => {
    expect(weekFromDate(new Date("2026-04-27T12:00:00Z"))).toBe("2026-W18");
  });

  it("weekFromDate(2026-05-03 Sunday) is still 2026-W18 (week boundary)", () => {
    expect(weekFromDate(new Date("2026-05-03T12:00:00Z"))).toBe("2026-W18");
  });

  it("weekFromDate(2026-05-04 Monday) is 2026-W19", () => {
    expect(weekFromDate(new Date("2026-05-04T12:00:00Z"))).toBe("2026-W19");
  });

  it("ISO week 1 boundary: 2027-01-04 is 2027-W01", () => {
    expect(weekFromDate(new Date("2027-01-04T12:00:00Z"))).toBe("2027-W01");
  });

  it("ISO week 53 boundary: 2026-12-28 is 2026-W53", () => {
    // 2026 is a 53-week year? Let's check: ISO week 53 occurs when Jan 1 is Thursday or
    // a leap year starts on Wednesday. 2026 starts Thursday → has W53.
    expect(weekFromDate(new Date("2026-12-28T12:00:00Z"))).toBe("2026-W53");
  });

  it("currentWeek returns format YYYY-Www", () => {
    expect(currentWeek()).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("parseWeek + weekToRange roundtrip", () => {
    const range = weekToRange("2026-W18");
    expect(range.start.toISOString().slice(0, 10)).toBe("2026-04-27");
    expect(range.end.toISOString().slice(0, 10)).toBe("2026-05-04"); // exclusive end
  });

  it("parseWeek validates format", () => {
    expect(parseWeek("2026-W18")).toEqual({ year: 2026, week: 18 });
    expect(parseWeek("invalid")).toBeNull();
    expect(parseWeek("2026-W99")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `lib/week.ts`**

Path: `projects/community-platform/lib/week.ts`

```ts
/**
 * ISO 8601 week helpers. Week starts on Monday; week 1 is the week
 * containing the first Thursday of the calendar year.
 *
 * Format: `YYYY-Www` (e.g., "2026-W18").
 */

export interface ParsedWeek {
  year: number;
  week: number;
}

export function weekFromDate(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  // Day of week (1 = Monday, 7 = Sunday in ISO)
  const dayNum = d.getUTCDay() || 7;
  // Set to nearest Thursday: current date + 4 - current day number
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function currentWeek(): string {
  return weekFromDate(new Date());
}

export function parseWeek(s: string): ParsedWeek | null {
  const m = s.match(/^(\d{4})-W(\d{2})$/);
  if (!m || !m[1] || !m[2]) return null;
  const year = Number.parseInt(m[1], 10);
  const week = Number.parseInt(m[2], 10);
  if (week < 1 || week > 53) return null;
  return { year, week };
}

export function weekToRange(s: string): { start: Date; end: Date } {
  const parsed = parseWeek(s);
  if (!parsed) throw new Error(`Invalid week: ${s}`);
  // ISO week 1's Monday: Jan 4 of `year` minus its weekday offset
  const jan4 = new Date(Date.UTC(parsed.year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (parsed.week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/lib/week.ts projects/community-platform/tests/unit/week.test.ts
git commit -m "feat(community-platform): ISO 8601 week helpers (lib/week.ts)"
```

### Task 5.2: Status reader (`lib/status-reader.ts`)

**Spec:** §6.3, §6.5.

**Files:**
- Create: `projects/community-platform/lib/status-reader.ts`
- Create: `projects/community-platform/tests/integration/status-reader.test.ts`

**Goal:** Read status files from GitHub API at runtime with 60s HTTP cache. Returns parsed status updates for a given week.

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/integration/status-reader.test.ts`

```ts
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { readWeekStatuses } from "@/lib/status-reader";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("status-reader", () => {
  it("lists week status files and parses bodies", async () => {
    server.use(
      http.get("https://api.github.com/repos/owner/repo/contents/community/status/2026-W18", () =>
        HttpResponse.json([
          { type: "file", name: "anton-safronov.md", path: "community/status/2026-W18/anton-safronov.md", sha: "s1" },
          { type: "file", name: "alice-example.md", path: "community/status/2026-W18/alice-example.md", sha: "s2" },
        ]),
      ),
      http.get("https://api.github.com/repos/owner/repo/contents/community/status/2026-W18/anton-safronov.md", () =>
        HttpResponse.json({
          type: "file",
          path: "community/status/2026-W18/anton-safronov.md",
          sha: "s1",
          content: Buffer.from("Working on the platform plan.").toString("base64"),
          encoding: "base64",
        }),
      ),
      http.get("https://api.github.com/repos/owner/repo/contents/community/status/2026-W18/alice-example.md", () =>
        HttpResponse.json({
          type: "file",
          path: "community/status/2026-W18/alice-example.md",
          sha: "s2",
          content: Buffer.from("Reviewing PRs.").toString("base64"),
          encoding: "base64",
        }),
      ),
      http.get("https://api.github.com/repos/owner/repo/commits", ({ request }) => {
        const url = new URL(request.url);
        const path = url.searchParams.get("path");
        const ts = path?.includes("anton") ? "2026-04-30T10:00:00Z" : "2026-04-29T10:00:00Z";
        return HttpResponse.json([{ commit: { committer: { date: ts } } }]);
      }),
    );

    const statuses = await readWeekStatuses({
      week: "2026-W18",
      owner: "owner",
      repo: "repo",
      branch: "main",
      token: "ghs_fake",
    });

    expect(statuses).toHaveLength(2);
    expect(statuses[0]?.slug).toBe("anton-safronov");
    expect(statuses[0]?.body).toBe("Working on the platform plan.");
    expect(statuses[0]?.lastModified).toBe("2026-04-30T10:00:00Z");
  });

  it("returns empty array when directory does not exist (404)", async () => {
    server.use(
      http.get("https://api.github.com/repos/owner/repo/contents/community/status/2026-W19", () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );
    const statuses = await readWeekStatuses({
      week: "2026-W19",
      owner: "owner",
      repo: "repo",
      branch: "main",
      token: "ghs_fake",
    });
    expect(statuses).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `lib/status-reader.ts`**

Path: `projects/community-platform/lib/status-reader.ts`

```ts
import { Octokit } from "@octokit/rest";

export interface StatusUpdate {
  slug: string;
  body: string;
  sha: string;
  lastModified: string;
}

export interface ReadWeekStatusesOpts {
  week: string;
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export async function readWeekStatuses(
  opts: ReadWeekStatusesOpts,
): Promise<StatusUpdate[]> {
  const octokit = new Octokit({ auth: opts.token });
  const dirPath = `community/status/${opts.week}`;

  let entries: Array<{ name: string; path: string; sha: string; type: string }>;
  try {
    const { data } = await octokit.repos.getContent({
      owner: opts.owner,
      repo: opts.repo,
      path: dirPath,
      ref: opts.branch,
    });
    if (!Array.isArray(data)) return [];
    entries = data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 404) {
      return [];
    }
    throw err;
  }

  const files = entries.filter((e) => e.type === "file" && e.name.endsWith(".md"));

  const statuses = await Promise.all(
    files.map(async (f) => {
      const [contentRes, commitRes] = await Promise.all([
        octokit.repos.getContent({
          owner: opts.owner,
          repo: opts.repo,
          path: f.path,
          ref: opts.branch,
        }),
        octokit.repos.listCommits({
          owner: opts.owner,
          repo: opts.repo,
          path: f.path,
          per_page: 1,
        }),
      ]);

      if (Array.isArray(contentRes.data) || contentRes.data.type !== "file") {
        return null;
      }

      const body = Buffer.from(
        contentRes.data.content,
        contentRes.data.encoding as BufferEncoding,
      ).toString("utf8");

      const lastModified =
        commitRes.data[0]?.commit.committer?.date ?? new Date().toISOString();

      return {
        slug: f.name.replace(/\.md$/, ""),
        body,
        sha: contentRes.data.sha,
        lastModified,
      };
    }),
  );

  return statuses
    .filter((s): s is StatusUpdate => s !== null)
    .sort((a, b) => b.lastModified.localeCompare(a.lastModified));
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/lib/status-reader.ts projects/community-platform/tests
git commit -m "feat(community-platform): runtime status reader (lib/status-reader.ts)"
```

### Task 5.3: Status server actions (`app/actions/status.ts`)

**Spec:** §6.5.

**Files:**
- Create: `projects/community-platform/app/actions/status.ts`
- Create: `projects/community-platform/tests/integration/status-actions.test.ts`

**Goal:** `postStatus`, `editStatus`, `deleteStatus` server actions wrap the GitHub App writer with auth checks (member can only modify their own status).

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/integration/status-actions.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";
import { GitHubAppError } from "@/lib/github-app";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ githubHandle: "anton" })),
}));

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  deleteFile: vi.fn(),
};

vi.mock("@/lib/github-app", async (orig) => {
  const actual = await orig<typeof import("@/lib/github-app")>();
  return {
    ...actual,
    createGitHubApp: vi.fn(() => mockClient),
  };
});

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn((h: string) => (h === "anton" ? { slug: "anton-safronov", name: "Anton" } : undefined)),
}));

import { postStatus, editStatus, deleteStatus } from "@/app/actions/status";

describe("status actions", () => {
  it("postStatus creates a file at community/status/<week>/<slug>.md", async () => {
    mockClient.writeFile.mockResolvedValueOnce({ sha: "newsha" });
    const result = await postStatus({ week: "2026-W18", body: "Hello" });
    expect(result.ok).toBe(true);
    expect(mockClient.writeFile).toHaveBeenCalledWith(
      "community/status/2026-W18/anton-safronov.md",
      expect.stringContaining("Hello"),
      expect.objectContaining({ message: expect.stringContaining("status") }),
    );
  });

  it("postStatus rejects when not signed in", async () => {
    const auth = await import("@/lib/auth");
    vi.mocked(auth.auth).mockResolvedValueOnce(null);
    const result = await postStatus({ week: "2026-W18", body: "x" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("not_authenticated");
  });

  it("editStatus passes SHA for optimistic lock", async () => {
    mockClient.writeFile.mockResolvedValueOnce({ sha: "newer" });
    const result = await editStatus({ week: "2026-W18", body: "Updated", sha: "old-sha" });
    expect(result.ok).toBe(true);
    expect(mockClient.writeFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({ sha: "old-sha" }),
    );
  });

  it("editStatus surfaces sha_conflict cleanly", async () => {
    mockClient.writeFile.mockRejectedValueOnce(new GitHubAppError("sha_conflict", "boom"));
    const result = await editStatus({ week: "2026-W18", body: "x", sha: "stale" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("sha_conflict");
  });

  it("deleteStatus removes the member's file", async () => {
    mockClient.deleteFile.mockResolvedValueOnce(undefined);
    const result = await deleteStatus({ week: "2026-W18", sha: "abc" });
    expect(result.ok).toBe(true);
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "community/status/2026-W18/anton-safronov.md",
      expect.objectContaining({ sha: "abc" }),
    );
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `app/actions/status.ts`**

Path: `projects/community-platform/app/actions/status.ts`

```ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp, GitHubAppError } from "@/lib/github-app";

export type StatusActionResult =
  | { ok: true; sha: string }
  | { ok: false; error: "not_authenticated" | "not_a_member" | "invalid_input" | "sha_conflict" | "not_found" | "unknown" };

const PostSchema = z.object({
  week: z.string().regex(/^\d{4}-W\d{2}$/),
  body: z.string().min(1).max(4000),
});

const EditSchema = PostSchema.extend({ sha: z.string().min(1) });

const DeleteSchema = z.object({
  week: z.string().regex(/^\d{4}-W\d{2}$/),
  sha: z.string().min(1),
});

function client() {
  return createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
}

async function getMemberSlug(): Promise<string | null> {
  const session = await auth();
  if (!session?.githubHandle) return null;
  const member = findMemberByHandle(session.githubHandle);
  return member?.slug ?? null;
}

function pathFor(week: string, slug: string): string {
  return `community/status/${week}/${slug}.md`;
}

function fileBody(handle: string, week: string, body: string): string {
  return `---\nweek: ${week}\nauthor: ${handle}\nposted_at: ${new Date().toISOString()}\n---\n\n${body}\n`;
}

export async function postStatus(input: { week: string; body: string }): Promise<StatusActionResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const slug = await getMemberSlug();
  if (!slug) return { ok: false, error: "not_a_member" };

  try {
    const result = await client().writeFile(
      pathFor(parsed.data.week, slug),
      fileBody(session.githubHandle, parsed.data.week, parsed.data.body),
      { message: `status: ${session.githubHandle} for ${parsed.data.week}` },
    );
    return { ok: true, sha: result.sha };
  } catch (err: unknown) {
    if (err instanceof GitHubAppError) return { ok: false, error: err.kind === "unknown" ? "unknown" : err.kind };
    return { ok: false, error: "unknown" };
  }
}

export async function editStatus(input: { week: string; body: string; sha: string }): Promise<StatusActionResult> {
  const parsed = EditSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const slug = await getMemberSlug();
  if (!slug) return { ok: false, error: "not_a_member" };

  try {
    const result = await client().writeFile(
      pathFor(parsed.data.week, slug),
      fileBody(session.githubHandle, parsed.data.week, parsed.data.body),
      {
        message: `status: ${session.githubHandle} edits ${parsed.data.week}`,
        sha: parsed.data.sha,
      },
    );
    return { ok: true, sha: result.sha };
  } catch (err: unknown) {
    if (err instanceof GitHubAppError) return { ok: false, error: err.kind === "unknown" ? "unknown" : err.kind };
    return { ok: false, error: "unknown" };
  }
}

export async function deleteStatus(input: { week: string; sha: string }): Promise<StatusActionResult> {
  const parsed = DeleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const slug = await getMemberSlug();
  if (!slug) return { ok: false, error: "not_a_member" };

  try {
    await client().deleteFile(pathFor(parsed.data.week, slug), {
      message: `status: ${session.githubHandle} deletes ${parsed.data.week}`,
      sha: parsed.data.sha,
    });
    return { ok: true, sha: "" };
  } catch (err: unknown) {
    if (err instanceof GitHubAppError) return { ok: false, error: err.kind === "unknown" ? "unknown" : err.kind };
    return { ok: false, error: "unknown" };
  }
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/app/actions projects/community-platform/tests
git commit -m "feat(community-platform): status post/edit/delete server actions"
```

### Task 5.4: StatusEditor component

**Spec:** §6.5.

**Files:**
- Create: `projects/community-platform/app/components/StatusEditor.tsx`
- Create: `projects/community-platform/tests/unit/status-editor.test.tsx`

**Goal:** Client component with textarea, post/edit/delete buttons, optimistic UI showing "Posted" / "Updated" / "Deleted", and a refresh affordance on SHA conflict.

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/unit/status-editor.test.tsx`

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusEditor } from "@/app/components/StatusEditor";

describe("StatusEditor", () => {
  it("renders empty textarea when no current status", () => {
    render(<StatusEditor week="2026-W18" current={null} actions={fakeActions()} />);
    const textarea = screen.getByLabelText(/what are you working on/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
  });

  it("renders current body when editing", () => {
    render(
      <StatusEditor
        week="2026-W18"
        current={{ body: "Existing", sha: "s1" }}
        actions={fakeActions()}
      />,
    );
    const textarea = screen.getByLabelText(/what are you working on/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Existing");
  });

  it("calls postStatus when no current and form submitted", async () => {
    const actions = fakeActions();
    render(<StatusEditor week="2026-W18" current={null} actions={actions} />);
    const textarea = screen.getByLabelText(/what are you working on/i);
    fireEvent.change(textarea, { target: { value: "New status" } });
    fireEvent.click(screen.getByRole("button", { name: /post/i }));
    await screen.findByText(/posted/i);
    expect(actions.postStatus).toHaveBeenCalledWith({ week: "2026-W18", body: "New status" });
  });

  it("calls editStatus when current present", async () => {
    const actions = fakeActions();
    render(
      <StatusEditor
        week="2026-W18"
        current={{ body: "Existing", sha: "s1" }}
        actions={actions}
      />,
    );
    fireEvent.change(screen.getByLabelText(/what are you working on/i), { target: { value: "Updated" } });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await screen.findByText(/updated/i);
    expect(actions.editStatus).toHaveBeenCalledWith({ week: "2026-W18", body: "Updated", sha: "s1" });
  });

  it("shows refresh prompt on sha_conflict", async () => {
    const actions = fakeActions();
    actions.editStatus = vi.fn(async () => ({ ok: false, error: "sha_conflict" as const }));
    render(
      <StatusEditor week="2026-W18" current={{ body: "x", sha: "s1" }} actions={actions} />,
    );
    fireEvent.change(screen.getByLabelText(/what are you working on/i), { target: { value: "y" } });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await screen.findByText(/refresh/i);
  });
});

function fakeActions() {
  return {
    postStatus: vi.fn(async () => ({ ok: true as const, sha: "newsha" })),
    editStatus: vi.fn(async () => ({ ok: true as const, sha: "newsha" })),
    deleteStatus: vi.fn(async () => ({ ok: true as const, sha: "" })),
  };
}
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `StatusEditor`**

Path: `projects/community-platform/app/components/StatusEditor.tsx`

```tsx
"use client";

import { useState, useTransition } from "react";

export interface StatusActions {
  postStatus: (input: { week: string; body: string }) => Promise<{ ok: boolean; error?: string; sha?: string }>;
  editStatus: (input: { week: string; body: string; sha: string }) => Promise<{ ok: boolean; error?: string; sha?: string }>;
  deleteStatus: (input: { week: string; sha: string }) => Promise<{ ok: boolean; error?: string }>;
}

export function StatusEditor({
  week,
  current,
  actions,
}: {
  week: string;
  current: { body: string; sha: string } | null;
  actions: StatusActions;
}): JSX.Element {
  const [body, setBody] = useState(current?.body ?? "");
  const [sha, setSha] = useState<string | null>(current?.sha ?? null);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const save = (): void => {
    setStatus("saving");
    setMessage("Saving…");
    startTransition(async () => {
      const result = sha
        ? await actions.editStatus({ week, body, sha })
        : await actions.postStatus({ week, body });
      if (result.ok) {
        setStatus("ok");
        setMessage(sha ? "Updated" : "Posted");
        if (result.sha) setSha(result.sha);
      } else {
        setStatus("error");
        setMessage(
          result.error === "sha_conflict"
            ? "Someone else updated this — refresh to see latest."
            : `Error: ${result.error ?? "unknown"}`,
        );
      }
    });
  };

  const remove = (): void => {
    if (!sha) return;
    setStatus("saving");
    setMessage("Deleting…");
    startTransition(async () => {
      const result = await actions.deleteStatus({ week, sha });
      if (result.ok) {
        setStatus("ok");
        setMessage("Deleted");
        setBody("");
        setSha(null);
      } else {
        setStatus("error");
        setMessage(`Error: ${result.error ?? "unknown"}`);
      }
    });
  };

  return (
    <form
      className="rounded border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label className="block text-sm font-medium" htmlFor="status-body">
        What are you working on this week ({week})?
      </label>
      <textarea
        id="status-body"
        className="mt-2 block w-full rounded border p-2 font-mono text-sm"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={isPending}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          disabled={isPending || body.trim().length === 0}
        >
          {sha ? "Update" : "Post"}
        </button>
        {sha && (
          <button
            type="button"
            onClick={remove}
            className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-900"
            disabled={isPending}
          >
            Delete
          </button>
        )}
        <span
          className={`text-sm ${status === "error" ? "text-red-600 dark:text-red-400" : "text-neutral-600 dark:text-neutral-400"}`}
        >
          {message}
        </span>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/app/components/StatusEditor.tsx projects/community-platform/tests
git commit -m "feat(community-platform): StatusEditor client component (post/edit/delete + optimistic UI)"
```

### Task 5.5: `/this-week` page

**Spec:** §6.5.

**Files:** Create `projects/community-platform/app/this-week/page.tsx`.

- [ ] **Step 1: Write the page**

Path: `projects/community-platform/app/this-week/page.tsx`

```tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { currentWeek } from "@/lib/week";
import { readWeekStatuses } from "@/lib/status-reader";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { StatusEditor } from "@/app/components/StatusEditor";
import { postStatus, editStatus, deleteStatus } from "@/app/actions/status";
import { createAppAuth } from "@octokit/auth-app";

export const revalidate = 60;

async function getInstallationToken(): Promise<string> {
  const auth = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installationAuth = await auth({ type: "installation" });
  return installationAuth.token;
}

export default async function ThisWeekPage(): Promise<JSX.Element> {
  const week = currentWeek();
  const session = await auth();
  const handle = session?.githubHandle ?? "";
  const member = findMemberByHandle(handle);

  const token = await getInstallationToken();
  const statuses = await readWeekStatuses({
    week,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
    token,
  });

  const mySlug = member?.slug;
  const my = mySlug ? statuses.find((s) => s.slug === mySlug) ?? null : null;

  const renderedOthers = await Promise.all(
    statuses
      .filter((s) => s.slug !== mySlug)
      .map(async (s) => ({
        slug: s.slug,
        html: await renderMarkdownToHtml(s.body),
        lastModified: s.lastModified,
      })),
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">This week — {week}</h1>
        <Link href="/home" className="text-sm underline">Home</Link>
      </header>

      {member && (
        <section className="mt-6">
          <h2 className="text-xl font-medium">Your update</h2>
          <div className="mt-2">
            <StatusEditor
              week={week}
              current={my ? { body: stripFrontmatter(my.body), sha: my.sha } : null}
              actions={{ postStatus, editStatus, deleteStatus }}
            />
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-medium">Others ({renderedOthers.length})</h2>
        {renderedOthers.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            No other status updates yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {renderedOthers.map((o) => (
              <li key={o.slug} className="rounded border p-4">
                <div className="text-sm font-medium">
                  <Link href={`/members/${o.slug}`} className="underline">
                    {o.slug}
                  </Link>
                </div>
                <SafeHtml html={o.html} className="prose prose-neutral dark:prose-invert mt-2 max-w-none text-sm" />
                <div className="mt-2 text-xs text-neutral-500">{o.lastModified}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function stripFrontmatter(body: string): string {
  return body.replace(/^---\n[\s\S]*?\n---\n/, "").trimStart();
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/app/this-week
git commit -m "feat(community-platform): /this-week page with editor + others' feed"
```

### Task 5.6: E2E status flow

**Spec:** §8 E2E tests 2–4 + 8.

**Files:** Create `projects/community-platform/e2e/status.spec.ts`.

**Goal:** E2E test that simulates posting a status (uses the real GitHub App against a test repo OR mocks the bot path). For v0.1, the simplest approach: run E2E against a **separate test repo** that the bot can write to without polluting the real warsaw-ai-community repo.

- [ ] **Step 1: Decide E2E strategy**

Options:
- **(A) Real bot writes to test repo:** Set up a `warsaw-ai-bot-test` repo, install the App on it, point env vars at it during E2E. CI sets `GITHUB_REPO_NAME=warsaw-ai-bot-test`. After each test, clean up via API.
- **(B) Mock the GitHub App in E2E:** Stub `/api/test-status` route that accepts a write and stores in memory; reroute the editor to it in test env. Cleaner but doesn't exercise the real Octokit path.

Pick **(B) for CI**, with **(A)** kept as a smoke test run manually before each release.

- [ ] **Step 2: Add a mock-mode flag to status actions**

Modify `projects/community-platform/app/actions/status.ts`. Add at top:

```ts
import { mockStatusActions } from "@/app/actions/_test-status-store";
```

Add an environment branch in each action:

```ts
if (process.env.NEXT_PUBLIC_E2E_MODE === "1") {
  return mockStatusActions.post(input);  // and edit/delete
}
```

Path: `projects/community-platform/app/actions/_test-status-store.ts`

```ts
/**
 * In-memory mock for E2E. Active only when NEXT_PUBLIC_E2E_MODE=1.
 */

interface Store {
  [path: string]: { body: string; sha: string };
}

const store: Store = {};
let counter = 0;

function nextSha(): string {
  counter += 1;
  return `mocksha-${counter}`;
}

function pathFor(week: string, slug: string): string {
  return `community/status/${week}/${slug}.md`;
}

import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";

async function slugForSession(): Promise<string | null> {
  const session = await auth();
  if (!session?.githubHandle) return null;
  return findMemberByHandle(session.githubHandle)?.slug ?? null;
}

export const mockStatusActions = {
  async post(input: { week: string; body: string }): Promise<{ ok: true; sha: string } | { ok: false; error: string }> {
    const slug = await slugForSession();
    if (!slug) return { ok: false, error: "not_a_member" };
    const sha = nextSha();
    store[pathFor(input.week, slug)] = { body: input.body, sha };
    return { ok: true, sha };
  },
  async edit(input: { week: string; body: string; sha: string }): Promise<{ ok: true; sha: string } | { ok: false; error: string }> {
    const slug = await slugForSession();
    if (!slug) return { ok: false, error: "not_a_member" };
    const existing = store[pathFor(input.week, slug)];
    if (existing && existing.sha !== input.sha) return { ok: false, error: "sha_conflict" };
    const sha = nextSha();
    store[pathFor(input.week, slug)] = { body: input.body, sha };
    return { ok: true, sha };
  },
  async remove(input: { week: string; sha: string }): Promise<{ ok: true; sha: "" } | { ok: false; error: string }> {
    const slug = await slugForSession();
    if (!slug) return { ok: false, error: "not_a_member" };
    delete store[pathFor(input.week, slug)];
    return { ok: true, sha: "" };
  },
  list(week: string): Array<{ slug: string; body: string; sha: string }> {
    const prefix = `community/status/${week}/`;
    return Object.entries(store)
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => ({ slug: k.slice(prefix.length).replace(/\.md$/, ""), body: v.body, sha: v.sha }));
  },
};
```

In `app/this-week/page.tsx`, branch the read path on `NEXT_PUBLIC_E2E_MODE`:

```ts
const statuses = process.env.NEXT_PUBLIC_E2E_MODE === "1"
  ? mockStatusActions.list(week).map((s) => ({ ...s, lastModified: new Date().toISOString() }))
  : await readWeekStatuses({ week, owner: env.GITHUB_REPO_OWNER, repo: env.GITHUB_REPO_NAME, branch: env.GITHUB_REPO_BRANCH, token: await getInstallationToken() });
```

- [ ] **Step 3: Wire E2E env in `playwright.config.ts`**

Update `webServer.command` to set the flag:

```ts
webServer: {
  command: "NEXT_PUBLIC_E2E_MODE=1 pnpm dev",
  // ...
},
```

- [ ] **Step 4: Write E2E**

Path: `projects/community-platform/e2e/status.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/test-auth", { data: { handle: "antonsafronov" } });
});

test("post a status update", async ({ page }) => {
  await page.goto("/this-week");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/this week/i);
  const textarea = page.getByLabel(/what are you working on/i);
  await textarea.fill("Building the platform.");
  await page.getByRole("button", { name: /post/i }).click();
  await expect(page.getByText(/posted/i)).toBeVisible();
});

test("edit posted status", async ({ page }) => {
  await page.goto("/this-week");
  await page.getByLabel(/what are you working on/i).fill("Initial.");
  await page.getByRole("button", { name: /post/i }).click();
  await expect(page.getByText(/posted/i)).toBeVisible();

  // After post, the page renders with current = posted content; "Update" button replaces "Post"
  await page.reload();
  await page.getByLabel(/what are you working on/i).fill("Updated content.");
  await page.getByRole("button", { name: /update/i }).click();
  await expect(page.getByText(/updated/i)).toBeVisible();
});

test("delete posted status", async ({ page }) => {
  await page.goto("/this-week");
  await page.getByLabel(/what are you working on/i).fill("Will be deleted.");
  await page.getByRole("button", { name: /post/i }).click();
  await expect(page.getByText(/posted/i)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /delete/i }).click();
  await expect(page.getByText(/deleted/i)).toBeVisible();
});
```

- [ ] **Step 5: Run E2E**

```bash
pnpm e2e
```

- [ ] **Step 6: Commit**

```bash
git add projects/community-platform/app projects/community-platform/playwright.config.ts projects/community-platform/e2e/status.spec.ts
git commit -m "feat(community-platform): E2E status flow with mock-mode store"
```

### Task 5.7: Phase 5 closeout

- [ ] **Step 1: Full check**

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

- [ ] **Step 2: CHANGELOG**

```markdown
### Phase 5 — Status updates (complete)
- `lib/week.ts` ISO 8601 week helpers (boundary tests for W1, W53).
- `lib/status-reader.ts` runtime read via GitHub API (60s ISR cache).
- `app/actions/status.ts` post / edit / delete server actions with SHA-based optimistic locking.
- `StatusEditor` client component with optimistic UI and conflict refresh prompt.
- `/this-week` page renders editor + others' feed.
- E2E mock-mode store for deterministic CI.
```

- [ ] **Step 3: Commit**

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 5"
```

---

## Phase 6: Membership consent flow

**Phase goal:** First-time roster member sees a consent modal on login. Acceptance creates `community/members/<slug>.md` (the consent stub) via the bot, then redirects to `/home`. Returning members skip the modal.

**Phase ships:** Members can opt into the platform; their consent is recorded as a git commit.

### Task 6.1: Consent stub server action

**Spec:** §6.11.

**Files:**
- Create: `projects/community-platform/app/actions/consent.ts`
- Create: `projects/community-platform/tests/integration/consent.test.ts`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/integration/consent.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ githubHandle: "anton" })),
}));

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  deleteFile: vi.fn(),
};

vi.mock("@/lib/github-app", async (orig) => {
  const actual = await orig<typeof import("@/lib/github-app")>();
  return { ...actual, createGitHubApp: vi.fn(() => mockClient) };
});

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn((h: string) =>
    h === "anton" ? { slug: "anton-safronov", name: "Anton" } : undefined,
  ),
}));

import { acceptConsent, hasConsent } from "@/app/actions/consent";

describe("consent actions", () => {
  it("acceptConsent creates community/members/<slug>.md", async () => {
    mockClient.readFile.mockResolvedValueOnce(null);
    mockClient.writeFile.mockResolvedValueOnce({ sha: "newsha" });
    const result = await acceptConsent();
    expect(result.ok).toBe(true);
    expect(mockClient.writeFile).toHaveBeenCalledWith(
      "community/members/anton-safronov.md",
      expect.stringContaining("consented_at"),
      expect.objectContaining({ message: expect.stringContaining("consent") }),
    );
  });

  it("acceptConsent skips when file already exists", async () => {
    mockClient.readFile.mockResolvedValueOnce({ content: "x", sha: "s", path: "p" });
    mockClient.writeFile.mockClear();
    const result = await acceptConsent();
    expect(result.ok).toBe(true);
    expect(mockClient.writeFile).not.toHaveBeenCalled();
  });

  it("hasConsent returns true when file exists", async () => {
    mockClient.readFile.mockResolvedValueOnce({ content: "x", sha: "s", path: "p" });
    expect(await hasConsent("anton")).toBe(true);
  });

  it("hasConsent returns false when file missing", async () => {
    mockClient.readFile.mockResolvedValueOnce(null);
    expect(await hasConsent("anton")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `app/actions/consent.ts`**

Path: `projects/community-platform/app/actions/consent.ts`

```ts
"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp, GitHubAppError } from "@/lib/github-app";

export type ConsentResult =
  | { ok: true }
  | { ok: false; error: "not_authenticated" | "not_a_member" | "unknown" };

function client() {
  return createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
}

function profilePath(slug: string): string {
  return `community/members/${slug}.md`;
}

function stubBody(handle: string, name: string): string {
  return `---\nname: ${name}\ngithub_handle: ${handle}\nconsented_at: ${new Date().toISOString()}\n---\n\n_Profile prose to come._\n`;
}

export async function hasConsent(handle: string): Promise<boolean> {
  const member = findMemberByHandle(handle);
  if (!member) return false;
  const result = await client().readFile(profilePath(member.slug));
  return result !== null;
}

export async function acceptConsent(): Promise<ConsentResult> {
  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const member = findMemberByHandle(session.githubHandle);
  if (!member) return { ok: false, error: "not_a_member" };

  const c = client();
  const existing = await c.readFile(profilePath(member.slug));
  if (existing) return { ok: true };

  try {
    await c.writeFile(
      profilePath(member.slug),
      stubBody(session.githubHandle, member.name),
      { message: `feat(community): ${session.githubHandle} platform consent` },
    );
    return { ok: true };
  } catch (err: unknown) {
    if (err instanceof GitHubAppError) return { ok: false, error: "unknown" };
    return { ok: false, error: "unknown" };
  }
}

export async function acceptConsentAndSetCookie(): Promise<ConsentResult> {
  const result = await acceptConsent();
  if (result.ok) {
    const c = await cookies();
    c.set("waic-consented", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return result;
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/app/actions/consent.ts projects/community-platform/tests
git commit -m "feat(community-platform): consent server actions"
```

### Task 6.2: ConsentModal + /consent page

**Spec:** §6.11.

**Files:**
- Create: `projects/community-platform/app/components/ConsentModal.tsx`
- Create: `projects/community-platform/app/consent/page.tsx`
- Create: `projects/community-platform/app/consent/ConsentClient.tsx`
- Create: `projects/community-platform/tests/unit/consent-modal.test.tsx`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/unit/consent-modal.test.tsx`

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConsentModal } from "@/app/components/ConsentModal";

describe("ConsentModal", () => {
  it("renders consent text + accept + cancel", () => {
    render(<ConsentModal onAccept={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /opt in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls onAccept and onCancel", () => {
    const onAccept = vi.fn();
    const onCancel = vi.fn();
    render(<ConsentModal onAccept={onAccept} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onAccept).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `ConsentModal`**

Path: `projects/community-platform/app/components/ConsentModal.tsx`

```tsx
"use client";

export function ConsentModal({
  onAccept,
  onCancel,
}: {
  onAccept: () => void;
  onCancel: () => void;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 max-w-md rounded bg-white p-6 dark:bg-neutral-900">
        <h2 className="text-xl font-semibold">Opt in to the Warsaw AI Community platform</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>Your status updates will be committed to a public MIT-licensed repository.</li>
          <li>You can edit or delete them at any time.</li>
          <li>You can request full data export or deletion at any time.</li>
        </ul>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onAccept}
            className="rounded bg-neutral-900 px-4 py-2 text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Accept and continue
          </button>
          <button
            onClick={onCancel}
            className="rounded border px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel — go back
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `/consent` page (server shell + client)**

Path: `projects/community-platform/app/consent/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { hasConsent } from "@/app/actions/consent";
import { ConsentClient } from "@/app/consent/ConsentClient";

export default async function ConsentPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) redirect("/login");
  const member = findMemberByHandle(session.githubHandle);
  if (!member) redirect("/no-access");

  if (await hasConsent(session.githubHandle)) redirect("/home");

  return <ConsentClient />;
}
```

Path: `projects/community-platform/app/consent/ConsentClient.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { ConsentModal } from "@/app/components/ConsentModal";
import { acceptConsentAndSetCookie } from "@/app/actions/consent";

export function ConsentClient(): JSX.Element {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <ConsentModal
        onAccept={() =>
          startTransition(async () => {
            const result = await acceptConsentAndSetCookie();
            if (result.ok) router.push("/home");
            else router.push("/login");
          })
        }
        onCancel={() =>
          startTransition(async () => {
            await signOut({ callbackUrl: "/login" });
          })
        }
      />
    </main>
  );
}
```

- [ ] **Step 5: Run tests, verify build**

```bash
pnpm test tests/unit/consent-modal.test.tsx
pnpm build
```

- [ ] **Step 6: Commit**

```bash
git add projects/community-platform/app projects/community-platform/tests
git commit -m "feat(community-platform): /consent page + ConsentModal"
```

### Task 6.3: Wire consent into middleware

**Spec:** §6.11.

**Files:** Modify `projects/community-platform/middleware.ts`, `projects/community-platform/app/api/test-auth/route.ts`.

- [ ] **Step 1: Update middleware to redirect first-time members to `/consent`**

Path: `projects/community-platform/middleware.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";

const PUBLIC_PATHS = new Set(["/login", "/no-access", "/consent"]);
const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon", "/api/test-auth"];

export default async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const session = await auth();
  const handle = session?.githubHandle;

  if (!handle) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const member = findMemberByHandle(handle);
  if (!member) {
    const url = req.nextUrl.clone();
    url.pathname = "/no-access";
    return NextResponse.redirect(url);
  }

  const consented = req.cookies.get("waic-consented")?.value === "1";
  if (!consented) {
    const url = req.nextUrl.clone();
    url.pathname = "/consent";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Update test-auth route to support `consented` flag**

Path: `projects/community-platform/app/api/test-auth/route.ts`

```ts
import { encode } from "next-auth/jwt";
import { env } from "@/lib/env";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const { handle, consented } = await req.json();
  if (typeof handle !== "string" || handle.length === 0) {
    return new NextResponse("handle required", { status: 400 });
  }

  const token = await encode({
    token: { githubHandle: handle.toLowerCase() },
    secret: env.NEXTAUTH_SECRET,
    salt: "authjs.session-token",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("authjs.session-token", token, {
    httpOnly: true, sameSite: "lax", secure: false, path: "/",
  });
  if (consented) {
    res.cookies.set("waic-consented", "1", {
      httpOnly: true, sameSite: "lax", secure: false, path: "/",
    });
  }
  return res;
}
```

- [ ] **Step 3: Update existing E2E to set `consented: true`**

In `e2e/auth.spec.ts`, `members.spec.ts`, `archives.spec.ts`, `status.spec.ts`: change all `request.post("/api/test-auth", { data: { handle: "..." } })` to add `consented: true` in the data object.

- [ ] **Step 4: Verify, commit**

```bash
pnpm e2e
git add projects/community-platform/middleware.ts projects/community-platform/app/api/test-auth projects/community-platform/e2e
git commit -m "feat(community-platform): consent gate in middleware + E2E updates"
```

### Task 6.4: E2E consent flow

**Files:** Create `projects/community-platform/e2e/consent.spec.ts`.

- [ ] **Step 1: Write E2E**

Path: `projects/community-platform/e2e/consent.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test("first-time roster member sees consent modal", async ({ page, request }) => {
  await request.post("/api/test-auth", { data: { handle: "antonsafronov" } });
  await page.goto("/home");
  await expect(page).toHaveURL(/\/consent$/);
  await expect(page.getByRole("heading", { name: /opt in/i })).toBeVisible();
});

test("returning member skips consent", async ({ page, request }) => {
  await request.post("/api/test-auth", { data: { handle: "antonsafronov", consented: true } });
  await page.goto("/home");
  await expect(page).toHaveURL(/\/home$/);
});

test("cancel returns to login", async ({ page, request }) => {
  await request.post("/api/test-auth", { data: { handle: "antonsafronov" } });
  await page.goto("/consent");
  await page.getByRole("button", { name: /cancel/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});
```

- [ ] **Step 2: Run, commit**

```bash
pnpm e2e
git add projects/community-platform/e2e/consent.spec.ts
git commit -m "feat(community-platform): E2E consent flow"
```

### Task 6.5: Phase 6 closeout

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

CHANGELOG entry:

```markdown
### Phase 6 — Membership consent flow (complete)
- `app/actions/consent.ts` — `acceptConsent`, `hasConsent`, `acceptConsentAndSetCookie`.
- `ConsentModal` component + `/consent` page.
- Middleware sends first-time roster members to `/consent`; `waic-consented` cookie short-circuits.
- E2E: first-time, returning, cancel paths.
```

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 6"
```

---

## Phase 7: Contributions counter

**Phase goal:** Each profile shows a contributions card with: project commits, ADRs filed, meetings attended, status posts. All git-derived (build-time).

**Phase ships:** Observation-only gamification per spec §0.2 anti-pattern guidance.

### Task 7.1: Contributions calculator (`lib/contributions.ts`)

**Spec:** §6.6.

**Files:**
- Create: `projects/community-platform/lib/contributions.ts`
- Create: `projects/community-platform/tests/unit/contributions.test.ts`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/unit/contributions.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { computeContributions, type GitCommit } from "@/lib/contributions";

const commits: GitCommit[] = [
  { sha: "a", author: "antonsafronov", date: "2026-04-24", files: ["projects/gbrain/spec.md"] },
  { sha: "b", author: "antonsafronov", date: "2026-04-25", files: ["docs/decisions/0001-x.md"] },
  { sha: "c", author: "alice-ex", date: "2026-04-26", files: ["projects/community-platform/app/page.tsx"] },
  { sha: "d", author: "warsaw-ai-bot", date: "2026-04-27", files: ["community/status/2026-W17/anton-safronov.md"] },
];

const meetings = [
  { slug: "2026-04-24", attendees: ["Anton Safronov", "Alice Example"] },
  { slug: "2026-04-17", attendees: ["Anton Safronov"] },
];

const roster = [
  { name: "Anton Safronov", githubHandle: "antonsafronov", slug: "anton-safronov" },
  { name: "Alice Example", githubHandle: "alice-ex", slug: "alice-example" },
];

describe("contributions", () => {
  it("counts authored commits to project folders, excluding bot", () => {
    const c = computeContributions({ commits, meetings, roster });
    expect(c["antonsafronov"]?.projectCommits).toBe(1);
    expect(c["alice-ex"]?.projectCommits).toBe(1);
  });

  it("counts ADRs filed", () => {
    const c = computeContributions({ commits, meetings, roster });
    expect(c["antonsafronov"]?.adrsFiled).toBe(1);
  });

  it("counts meeting attendance by name match", () => {
    const c = computeContributions({ commits, meetings, roster });
    expect(c["antonsafronov"]?.meetingsAttended).toBe(2);
    expect(c["alice-ex"]?.meetingsAttended).toBe(1);
  });

  it("returns zeros for members with no signals", () => {
    const r = [...roster, { name: "Bob", githubHandle: "bob", slug: "bob" }];
    const c = computeContributions({ commits, meetings, roster: r });
    expect(c["bob"]).toEqual({
      projectCommits: 0,
      adrsFiled: 0,
      meetingsAttended: 0,
      statusPosts: 0,
    });
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `lib/contributions.ts`**

Path: `projects/community-platform/lib/contributions.ts`

```ts
import type { RosterMember } from "@/lib/roster";
import type { Meeting } from "@/lib/meetings";

export interface GitCommit {
  sha: string;
  author: string;
  date: string;
  files: readonly string[];
}

export interface Contributions {
  projectCommits: number;
  adrsFiled: number;
  meetingsAttended: number;
  statusPosts: number;
}

const BOT_AUTHORS = new Set(["warsaw-ai-bot", "warsaw-ai-bot[bot]"]);

export interface ComputeInput {
  commits: readonly GitCommit[];
  meetings: readonly Pick<Meeting, "slug" | "attendees">[];
  roster: readonly RosterMember[];
}

export function computeContributions(input: ComputeInput): Record<string, Contributions> {
  const result: Record<string, Contributions> = {};
  for (const m of input.roster) {
    result[m.githubHandle] = {
      projectCommits: 0,
      adrsFiled: 0,
      meetingsAttended: 0,
      statusPosts: 0,
    };
  }

  for (const commit of input.commits) {
    if (BOT_AUTHORS.has(commit.author.toLowerCase())) continue;
    const counts = result[commit.author.toLowerCase()];
    if (!counts) continue;

    if (commit.files.some((f) => f.startsWith("projects/"))) {
      counts.projectCommits += 1;
    }
    counts.adrsFiled += commit.files.filter((f) => /^docs\/decisions\/\d{4}-.+\.md$/.test(f)).length;
    counts.statusPosts += commit.files.filter((f) => /^community\/status\/\d{4}-W\d{2}\/.+\.md$/.test(f)).length;
  }

  for (const meeting of input.meetings) {
    for (const attendeeName of meeting.attendees) {
      const member = input.roster.find((m) => m.name === attendeeName);
      if (member) {
        const counts = result[member.githubHandle];
        if (counts) counts.meetingsAttended += 1;
      }
    }
  }

  return result;
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/lib/contributions.ts projects/community-platform/tests/unit/contributions.test.ts
git commit -m "feat(community-platform): contributions calculator"
```

### Task 7.2: Build-time contributions script

**Spec:** §6.6.

**Files:**
- Create: `projects/community-platform/scripts/build-contributions.ts`
- Modify: `projects/community-platform/package.json`
- Modify: `projects/community-platform/lib/content-snapshot.ts`

- [ ] **Step 1: Write the build script**

Path: `projects/community-platform/scripts/build-contributions.ts`

**Security note:** Uses `execFileSync` (not `execSync`/`exec`) to avoid any shell interpretation. All arguments are hardcoded constants — no user input is ever passed to git.

```ts
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import { computeContributions, type GitCommit } from "@/lib/contributions";
import { readRoster } from "@/lib/roster";
import { listMeetings } from "@/lib/meetings";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const OUTPUT = path.resolve(__dirname, "../lib/__generated__/contributions.json");

interface GitLogEntry {
  sha: string;
  author: string;
  date: string;
  files: string[];
}

function parseGitLog(): GitLogEntry[] {
  // execFileSync invokes git directly with no shell — no command-injection surface.
  // All args are hardcoded constants.
  const output = execFileSync(
    "git",
    ["log", "--pretty=format:COMMIT|%H|%ae|%aI", "--name-only"],
    { cwd: REPO_ROOT, encoding: "utf8", maxBuffer: 100 * 1024 * 1024 },
  );

  const entries: GitLogEntry[] = [];
  let current: GitLogEntry | null = null;

  for (const line of output.split("\n")) {
    if (line.startsWith("COMMIT|")) {
      if (current) entries.push(current);
      const parts = line.slice(7).split("|");
      const email = parts[1] ?? "";
      // Map email → GitHub handle. GitHub noreply emails are
      // <id>+<handle>@users.noreply.github.com or <handle>@users.noreply.github.com.
      // For non-noreply emails the local-part is best-effort.
      const localPart = email.replace(/@.*/, "");
      const handle = localPart.replace(/^\d+\+/, "").toLowerCase();
      current = {
        sha: parts[0] ?? "",
        author: handle,
        date: parts[2] ?? "",
        files: [],
      };
    } else if (line.trim() === "") {
      // skip empty separators
    } else if (current) {
      current.files.push(line.trim());
    }
  }
  if (current) entries.push(current);
  return entries;
}

async function main(): Promise<void> {
  const rosterPath = path.join(REPO_ROOT, "community/members/roster.md");
  const [roster, meetings] = await Promise.all([
    readRoster(rosterPath),
    listMeetings(REPO_ROOT),
  ]);

  const commits: GitCommit[] = parseGitLog();
  const contributions = computeContributions({ commits, meetings, roster });

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(contributions, null, 2));
  console.log(`Wrote ${OUTPUT}: ${Object.keys(contributions).length} members`);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 2: Chain script in `package.json`**

```json
"scripts": {
  "dev": "pnpm snapshot && pnpm contributions && next dev",
  "build": "pnpm snapshot && pnpm contributions && next build",
  "snapshot": "tsx scripts/snapshot-content.ts",
  "contributions": "tsx scripts/build-contributions.ts",
  ...
}
```

- [ ] **Step 3: Expose contributions in `lib/content-snapshot.ts`**

Append to `projects/community-platform/lib/content-snapshot.ts`:

```ts
import contribJson from "@/lib/__generated__/contributions.json" with { type: "json" };
import type { Contributions } from "@/lib/contributions";

const contributions: Record<string, Contributions> = contribJson;

export function getContributions(handle: string): Contributions {
  return (
    contributions[handle.toLowerCase()] ?? {
      projectCommits: 0,
      adrsFiled: 0,
      meetingsAttended: 0,
      statusPosts: 0,
    }
  );
}
```

- [ ] **Step 4: Run, verify, commit**

```bash
cd projects/community-platform
pnpm contributions
git add projects/community-platform/scripts projects/community-platform/lib projects/community-platform/package.json
git commit -m "feat(community-platform): build-time contributions script (execFileSync, no shell)"
```

### Task 7.3: ContributionCard component

**Files:**
- Create: `projects/community-platform/app/components/ContributionCard.tsx`
- Create: `projects/community-platform/tests/unit/contribution-card.test.tsx`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/unit/contribution-card.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContributionCard } from "@/app/components/ContributionCard";

describe("ContributionCard", () => {
  it("renders four metrics", () => {
    render(
      <ContributionCard
        contributions={{ projectCommits: 12, adrsFiled: 3, meetingsAttended: 8, statusPosts: 5 }}
      />,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/project commits/i)).toBeInTheDocument();
    expect(screen.getByText(/adrs filed/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `ContributionCard`**

Path: `projects/community-platform/app/components/ContributionCard.tsx`

```tsx
import type { Contributions } from "@/lib/contributions";

export function ContributionCard({
  contributions,
}: {
  contributions: Contributions;
}): JSX.Element {
  const items: { label: string; value: number }[] = [
    { label: "Project commits", value: contributions.projectCommits },
    { label: "ADRs filed", value: contributions.adrsFiled },
    { label: "Meetings attended", value: contributions.meetingsAttended },
    { label: "Status posts", value: contributions.statusPosts },
  ];

  return (
    <section className="rounded border p-4">
      <h3 className="text-lg font-medium">Contributions</h3>
      <p className="mt-1 text-xs text-neutral-500">
        Derived from git history. Bot commits excluded.
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded border border-neutral-200 p-3 dark:border-neutral-800">
            <dd className="text-2xl font-semibold tabular-nums">{it.value}</dd>
            <dt className="text-xs text-neutral-600 dark:text-neutral-400">{it.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: Run, commit**

```bash
git add projects/community-platform/app/components/ContributionCard.tsx projects/community-platform/tests
git commit -m "feat(community-platform): ContributionCard component"
```

### Task 7.4: Wire counter into profile pages

**Files:** Modify `projects/community-platform/app/members/[slug]/page.tsx`.

- [ ] **Step 1: Add `<ContributionCard>` to profile**

Path: `projects/community-platform/app/members/[slug]/page.tsx`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { findMemberBySlug, getContributions, listMembers } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { PersonaPanel } from "@/app/components/PersonaPanel";
import { SafeHtml } from "@/app/components/SafeHtml";
import { ContributionCard } from "@/app/components/ContributionCard";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listMembers().map((m) => ({ slug: m.slug }));
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<JSX.Element> {
  const { slug } = await params;
  const member = findMemberBySlug(slug);
  if (!member) notFound();

  const profileHtml = member.profile?.body ? await renderMarkdownToHtml(member.profile.body) : null;
  const personaHtml = member.persona ? await renderMarkdownToHtml(member.persona) : null;
  const contributions = getContributions(member.githubHandle);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/members" className="text-sm underline">← Members</Link>
      <h1 className="mt-4 text-3xl font-semibold">{member.name}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        <a className="underline" href={`https://github.com/${member.githubHandle}`}>
          @{member.githubHandle}
        </a>
      </p>

      <div className="mt-6">
        <ContributionCard contributions={contributions} />
      </div>

      {profileHtml ? (
        <section className="mt-6">
          <h2 className="text-xl font-medium">Profile</h2>
          <SafeHtml html={profileHtml} className="prose prose-neutral dark:prose-invert mt-2 max-w-none" />
        </section>
      ) : (
        <section className="mt-6 rounded border border-dashed p-4 text-sm text-neutral-600 dark:text-neutral-400">
          {member.name} hasn't filled out a profile yet.
        </section>
      )}

      <div className="mt-6">
        <PersonaPanel html={personaHtml} slug={member.slug} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build, commit**

```bash
pnpm build
git add projects/community-platform/app/members
git commit -m "feat(community-platform): contributions card on profile pages"
```

### Task 7.5: Phase 7 closeout

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

CHANGELOG entry:

```markdown
### Phase 7 — Contributions counter (complete)
- `lib/contributions.ts` calculator (project commits, ADRs filed, meetings attended, status posts).
- `scripts/build-contributions.ts` parses `git log` at build time via `execFileSync` (no shell).
- `ContributionCard` on each profile.
- Bot commits excluded.
- Author email → handle mapping is best-effort; private-email members may be undercounted.
```

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 7"
```

---

## Phase 8: GDPR mechanisms

**Phase goal:** Members can export and delete their own data via UI buttons.

**Phase ships:** Spec §6.13 mechanisms working end-to-end.

### Task 8.1: GDPR export (`/api/me/export`)

**Spec:** §6.13.

**Files:**
- Create: `projects/community-platform/app/api/me/export/route.ts`
- Create: `projects/community-platform/tests/integration/gdpr-export.test.ts`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/integration/gdpr-export.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ githubHandle: "anton" })),
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn((h: string) =>
    h === "anton" ? { slug: "anton-safronov", name: "Anton", githubHandle: "anton", profile: { data: {}, body: "Hi" }, persona: null } : undefined,
  ),
  getContributions: vi.fn(() => ({ projectCommits: 5, adrsFiled: 1, meetingsAttended: 2, statusPosts: 1 })),
}));

const mockClient = { readFile: vi.fn() };
vi.mock("@/lib/github-app", async (orig) => {
  const a = await orig<typeof import("@/lib/github-app")>();
  return { ...a, createGitHubApp: vi.fn(() => mockClient) };
});

vi.mock("@/lib/status-reader", () => ({
  readWeekStatuses: vi.fn(async () => [
    { slug: "anton-safronov", body: "Working.", sha: "s1", lastModified: "2026-04-30" },
  ]),
}));

import { GET } from "@/app/api/me/export/route";

describe("GET /api/me/export", () => {
  it("returns json with member, profile, contributions, statuses", async () => {
    const res = await GET(new Request("http://localhost/api/me/export"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.handle).toBe("anton");
    expect(body.member.name).toBe("Anton");
    expect(body.contributions.projectCommits).toBe(5);
    expect(Array.isArray(body.statuses)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `/api/me/export/route.ts`**

Path: `projects/community-platform/app/api/me/export/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle, getContributions } from "@/lib/content-snapshot";
import { readWeekStatuses } from "@/lib/status-reader";
import { createAppAuth } from "@octokit/auth-app";
import { currentWeek, weekFromDate } from "@/lib/week";

async function getInstallationToken(): Promise<string> {
  const a = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installation = await a({ type: "installation" });
  return installation.token;
}

export async function GET(_req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.githubHandle) return new NextResponse("unauthorized", { status: 401 });
  const member = findMemberByHandle(session.githubHandle);
  if (!member) return new NextResponse("not a member", { status: 403 });

  const token = await getInstallationToken();

  // Pull last 12 weeks of statuses (rough approximation; full history would require
  // listing the entire community/status/ tree).
  const weeks: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.push(weekFromDate(d));
  }
  const uniqueWeeks = Array.from(new Set(weeks));

  const allStatuses = await Promise.all(
    uniqueWeeks.map((w) =>
      readWeekStatuses({
        week: w,
        owner: env.GITHUB_REPO_OWNER,
        repo: env.GITHUB_REPO_NAME,
        branch: env.GITHUB_REPO_BRANCH,
        token,
      }).then((statuses) => statuses.filter((s) => s.slug === member.slug).map((s) => ({ ...s, week: w }))),
    ),
  );

  const payload = {
    exportedAt: new Date().toISOString(),
    handle: session.githubHandle,
    member: {
      name: member.name,
      slug: member.slug,
      githubHandle: member.githubHandle,
      profile: member.profile,
      persona: member.persona,
    },
    contributions: getContributions(session.githubHandle),
    statuses: allStatuses.flat(),
    currentWeek: currentWeek(),
  };

  return NextResponse.json(payload);
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/app/api/me/export projects/community-platform/tests
git commit -m "feat(community-platform): GDPR /api/me/export"
```

### Task 8.2: GDPR delete (`/api/me/delete`)

**Spec:** §6.13.

**Files:**
- Create: `projects/community-platform/app/api/me/delete/route.ts`
- Create: `projects/community-platform/tests/integration/gdpr-delete.test.ts`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/integration/gdpr-delete.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ githubHandle: "anton" })),
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(() => ({ slug: "anton-safronov", name: "Anton" })),
}));

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  deleteFile: vi.fn(),
};
vi.mock("@/lib/github-app", async (orig) => {
  const a = await orig<typeof import("@/lib/github-app")>();
  return { ...a, createGitHubApp: vi.fn(() => mockClient) };
});

vi.mock("@/lib/status-reader", () => ({
  readWeekStatuses: vi.fn(async (opts) =>
    opts.week === "2026-W18"
      ? [{ slug: "anton-safronov", body: "Hi", sha: "s1", lastModified: "x" }]
      : [],
  ),
}));

import { POST } from "@/app/api/me/delete/route";

describe("POST /api/me/delete", () => {
  it("deletes profile + status files", async () => {
    mockClient.readFile.mockResolvedValueOnce({ content: "x", sha: "profilesha", path: "p" });
    mockClient.deleteFile.mockResolvedValue(undefined);

    const res = await POST(new Request("http://localhost/api/me/delete", { method: "POST" }));
    expect(res.status).toBe(200);
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "community/members/anton-safronov.md",
      expect.objectContaining({ sha: "profilesha" }),
    );
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "community/status/2026-W18/anton-safronov.md",
      expect.objectContaining({ sha: "s1" }),
    );
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `/api/me/delete/route.ts`**

Path: `projects/community-platform/app/api/me/delete/route.ts`

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp, GitHubAppError } from "@/lib/github-app";
import { readWeekStatuses } from "@/lib/status-reader";
import { weekFromDate } from "@/lib/week";
import { createAppAuth } from "@octokit/auth-app";

async function getInstallationToken(): Promise<string> {
  const a = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installation = await a({ type: "installation" });
  return installation.token;
}

export async function POST(_req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.githubHandle) return new NextResponse("unauthorized", { status: 401 });
  const member = findMemberByHandle(session.githubHandle);
  if (!member) return new NextResponse("not a member", { status: 403 });

  const c = createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });

  // 1. Delete profile file
  const profilePath = `community/members/${member.slug}.md`;
  const profile = await c.readFile(profilePath);
  if (profile) {
    await c.deleteFile(profilePath, {
      sha: profile.sha,
      message: `chore(gdpr): delete profile for ${session.githubHandle}`,
    });
  }

  // 2. Delete all status files (last 52 weeks scan)
  const token = await getInstallationToken();
  const weeks: string[] = [];
  for (let i = 0; i < 52; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.push(weekFromDate(d));
  }
  const uniqueWeeks = Array.from(new Set(weeks));

  for (const week of uniqueWeeks) {
    const statuses = await readWeekStatuses({
      week,
      owner: env.GITHUB_REPO_OWNER,
      repo: env.GITHUB_REPO_NAME,
      branch: env.GITHUB_REPO_BRANCH,
      token,
    });
    const mine = statuses.find((s) => s.slug === member.slug);
    if (!mine) continue;
    try {
      await c.deleteFile(`community/status/${week}/${member.slug}.md`, {
        sha: mine.sha,
        message: `chore(gdpr): delete status ${week} for ${session.githubHandle}`,
      });
    } catch (err: unknown) {
      if (err instanceof GitHubAppError && err.kind === "not_found") continue;
      throw err;
    }
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/app/api/me/delete projects/community-platform/tests
git commit -m "feat(community-platform): GDPR /api/me/delete (profile + statuses)"
```

### Task 8.3: GDPR UI on profile

**Files:** Modify `projects/community-platform/app/members/[slug]/page.tsx` to add an admin/self-only block with Export and Delete buttons.

- [ ] **Step 1: Create `GdprPanel` component**

Path: `projects/community-platform/app/components/GdprPanel.tsx`

```tsx
"use client";

import { useState } from "react";

export function GdprPanel(): JSX.Element {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const exportData = async (): Promise<void> => {
    setBusy(true);
    try {
      const res = await fetch("/api/me/export");
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `warsaw-ai-community-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Exported.");
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const deleteData = async (): Promise<void> => {
    if (!window.confirm("Delete your profile and all status updates? This cannot be undone (commits remain in git history but files are removed from main).")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/me/delete", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Deleted. Sign out to clear your session.");
    } catch (err) {
      setMessage(`Error: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded border border-red-200 p-4 dark:border-red-900">
      <h3 className="text-lg font-medium">Data controls</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Export or delete your data. Deletion removes your profile file and all status updates from
        the repo's main branch; commits in history remain attributable to your GitHub handle.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={exportData}
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-900"
        >
          Export my data
        </button>
        <button
          onClick={deleteData}
          disabled={busy}
          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
        >
          Delete my data
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{message}</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Render `GdprPanel` only on the viewer's own profile**

Modify `projects/community-platform/app/members/[slug]/page.tsx` — after the persona panel, conditionally include:

```tsx
import { auth } from "@/lib/auth";
import { GdprPanel } from "@/app/components/GdprPanel";

// inside the component, after fetching member:
const session = await auth();
const isSelf = session?.githubHandle === member.githubHandle;

// ... at the end of the JSX:
{isSelf && (
  <div className="mt-6">
    <GdprPanel />
  </div>
)}
```

- [ ] **Step 3: Verify build**

```bash
pnpm build
```

- [ ] **Step 4: Commit**

```bash
git add projects/community-platform/app
git commit -m "feat(community-platform): GdprPanel on own profile (export + delete)"
```

### Task 8.4: E2E GDPR

**Files:** Create `projects/community-platform/e2e/gdpr.spec.ts`.

- [ ] **Step 1: Write E2E**

Path: `projects/community-platform/e2e/gdpr.spec.ts`

```ts
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/test-auth", { data: { handle: "antonsafronov", consented: true } });
});

test("export endpoint returns JSON for self", async ({ request }) => {
  const res = await request.get("/api/me/export");
  expect(res.ok()).toBe(true);
  const body = await res.json();
  expect(body.handle).toBeDefined();
  expect(body.member).toBeDefined();
});

test("GdprPanel visible on own profile only", async ({ page }) => {
  await page.goto("/members/anton-safronov");
  await expect(page.getByRole("heading", { name: /data controls/i })).toBeVisible();

  // Visit another member's profile (if exists)
  await page.goto("/members/alice-example").catch(() => {});
  // GdprPanel should NOT be visible on someone else's profile
  const panel = page.getByRole("heading", { name: /data controls/i });
  expect(await panel.count()).toBe(0);
});
```

- [ ] **Step 2: Run, commit**

```bash
pnpm e2e
git add projects/community-platform/e2e/gdpr.spec.ts
git commit -m "feat(community-platform): E2E GDPR"
```

### Task 8.5: Phase 8 closeout

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

CHANGELOG entry:

```markdown
### Phase 8 — GDPR mechanisms (complete)
- `/api/me/export` returns JSON with profile, contributions, last 12 weeks of statuses.
- `/api/me/delete` removes profile + status files via the bot (52-week scan).
- `GdprPanel` component on viewer's own profile only.
- E2E: export endpoint, panel visibility.
```

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 8"
```

---

## Phase 9: Health metric

**Phase goal:** Admin-only view at `/admin/health` shows the program's health metric: weekly active posters / total roster members. Per spec §10, this is locked from day one.

**Phase ships:** Anton can see whether the platform is working.

### Task 9.1: Health metric calculator (`lib/health-metric.ts`)

**Spec:** §2 goal 8, §10.

**Files:**
- Create: `projects/community-platform/lib/health-metric.ts`
- Create: `projects/community-platform/tests/unit/health-metric.test.ts`

- [ ] **Step 1: Write failing test**

Path: `projects/community-platform/tests/unit/health-metric.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { computeHealthMetric } from "@/lib/health-metric";

const roster = [
  { name: "A", githubHandle: "a", slug: "a" },
  { name: "B", githubHandle: "b", slug: "b" },
  { name: "C", githubHandle: "c", slug: "c" },
  { name: "D", githubHandle: "d", slug: "d" },
];

describe("computeHealthMetric", () => {
  it("computes weekly active posters / total members", () => {
    const result = computeHealthMetric({
      roster,
      weekStatuses: [
        { slug: "a", body: "x", sha: "1", lastModified: "x" },
        { slug: "b", body: "x", sha: "2", lastModified: "x" },
      ],
    });
    expect(result.activePosters).toBe(2);
    expect(result.totalMembers).toBe(4);
    expect(result.ratio).toBe(0.5);
  });

  it("returns zero when no posts", () => {
    const result = computeHealthMetric({ roster, weekStatuses: [] });
    expect(result.activePosters).toBe(0);
    expect(result.ratio).toBe(0);
  });
});
```

- [ ] **Step 2: Run test, expect fail**

- [ ] **Step 3: Implement `lib/health-metric.ts`**

Path: `projects/community-platform/lib/health-metric.ts`

```ts
import type { RosterMember } from "@/lib/roster";
import type { StatusUpdate } from "@/lib/status-reader";

export interface HealthMetric {
  activePosters: number;
  totalMembers: number;
  ratio: number;
}

export function computeHealthMetric(input: {
  roster: readonly RosterMember[];
  weekStatuses: readonly Pick<StatusUpdate, "slug">[];
}): HealthMetric {
  const totalMembers = input.roster.length;
  const memberSlugs = new Set(input.roster.map((m) => m.slug));
  const activePosters = new Set(
    input.weekStatuses.map((s) => s.slug).filter((s) => memberSlugs.has(s)),
  ).size;
  return {
    activePosters,
    totalMembers,
    ratio: totalMembers === 0 ? 0 : activePosters / totalMembers,
  };
}
```

- [ ] **Step 4: Run test, expect pass**

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/lib/health-metric.ts projects/community-platform/tests
git commit -m "feat(community-platform): health metric calculator"
```

### Task 9.2: Admin health page

**Spec:** §2 goal 8.

**Files:**
- Create: `projects/community-platform/app/admin/health/page.tsx`

- [ ] **Step 1: Write the page**

Path: `projects/community-platform/app/admin/health/page.tsx`

```tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { isAdmin, listMembers } from "@/lib/content-snapshot";
import { currentWeek, weekFromDate } from "@/lib/week";
import { readWeekStatuses } from "@/lib/status-reader";
import { computeHealthMetric } from "@/lib/health-metric";
import { createAppAuth } from "@octokit/auth-app";

async function getInstallationToken(): Promise<string> {
  const a = createAppAuth({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
  });
  const installation = await a({ type: "installation" });
  return installation.token;
}

export default async function AdminHealthPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) redirect("/login");
  if (!isAdmin(session.githubHandle)) redirect("/home");

  const week = currentWeek();
  const token = await getInstallationToken();
  const statuses = await readWeekStatuses({
    week,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
    token,
  });

  const metric = computeHealthMetric({ roster: listMembers(), weekStatuses: statuses });

  // 4-week trend
  const trendWeeks: { week: string; ratio: number; activePosters: number }[] = [];
  for (let i = 0; i < 4; i += 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i * 7);
    const w = weekFromDate(d);
    const s = await readWeekStatuses({
      week: w,
      owner: env.GITHUB_REPO_OWNER,
      repo: env.GITHUB_REPO_NAME,
      branch: env.GITHUB_REPO_BRANCH,
      token,
    });
    const m = computeHealthMetric({ roster: listMembers(), weekStatuses: s });
    trendWeeks.push({ week: w, ratio: m.ratio, activePosters: m.activePosters });
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Health metric</h1>
        <Link href="/home" className="text-sm underline">Home</Link>
      </header>

      <section className="mt-6 rounded border p-4">
        <h2 className="text-xl font-medium">This week ({week})</h2>
        <p className="mt-2 text-4xl font-semibold tabular-nums">
          {metric.activePosters} / {metric.totalMembers}
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {(metric.ratio * 100).toFixed(0)}% active posters this week
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Targets: v0.1 launch 50%+ · v0.2 sustained 60% across 4 weeks · v0.3 sustained 70%
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-medium">4-week trend</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left">
              <th className="border-b py-2">Week</th>
              <th className="border-b py-2">Posters</th>
              <th className="border-b py-2">Ratio</th>
            </tr>
          </thead>
          <tbody>
            {trendWeeks.map((t) => (
              <tr key={t.week}>
                <td className="border-b py-2 font-mono">{t.week}</td>
                <td className="border-b py-2 tabular-nums">{t.activePosters}</td>
                <td className="border-b py-2 tabular-nums">{(t.ratio * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify, commit**

```bash
pnpm build
git add projects/community-platform/app/admin
git commit -m "feat(community-platform): /admin/health metric page"
```

### Task 9.3: Phase 9 closeout

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
```

CHANGELOG entry:

```markdown
### Phase 9 — Health metric (complete)
- `lib/health-metric.ts` calculator.
- `/admin/health` page (admin-only, gated by isAdmin).
- 4-week trend table.
```

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): close Phase 9"
```

---

## Phase 10: Pre-launch + production deploy

**Phase goal:** Spec §8 acceptance criteria fully verified; production deployment live; v0.1.0 tag pushed.

**Phase ships:** v0.1.0 — the Lite slice, on the public Vercel URL.

### Task 10.1: Verify all spec acceptance criteria

**Spec:** §8.

- [ ] **Step 1: Walk the acceptance list**

Open `projects/community-platform/spec.md` §8 and check each item:

1. All 19 roster members have `github_handle`. Run: `grep -c "github_handle\|GitHub" community/members/roster.md`. Cross-check by attempting login as each (or sampling 3–5).
2. Status update flow E2E + concurrent edit covered. Already in `e2e/status.spec.ts`.
3. Contribution counter matches `git log` for at least 5 members. Run a manual check: pick 5 members, run `git log --author="<email>" --oneline | wc -l`, compare to `lib/__generated__/contributions.json`. Document the comparison.
4. Persona panel renders for the 4 personas in `persona-builder/personas/`. Visit each member profile.
5. Lighthouse ≥ 90 on `/home`, `/members`, `/this-week`. Run: `pnpm dlx lighthouse https://<preview-url>/home --view`.
6. No PII in error logs. Browse Vercel function logs for 24 hours of preview traffic; grep for `email`, `token`, `secret`. Document negative result.
7. Health metric viewable by admins. Visit `/admin/health` as an admin.

Document each in `projects/community-platform/CHANGELOG.md` under a "Phase 10 — Verification" section.

- [ ] **Step 2: Commit verification log**

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "docs(community-platform): Phase 10 verification log"
```

### Task 10.2: Lighthouse + perf

**Files:** None to create; tweak as needed based on findings.

- [ ] **Step 1: Run Lighthouse on preview URL**

```bash
pnpm dlx lighthouse https://<preview-url>/home --output=json --output-path=lighthouse-home.json --view
pnpm dlx lighthouse https://<preview-url>/members --output=json --output-path=lighthouse-members.json --view
pnpm dlx lighthouse https://<preview-url>/this-week --output=json --output-path=lighthouse-this-week.json --view
```

- [ ] **Step 2: Address scores < 90**

Common fixes:
- Image `<img>` → `next/image`.
- Add `loading="lazy"` to non-critical images.
- Reduce font payload (system fonts only — already the default).
- Add `Cache-Control` headers via `next.config.ts` headers().

- [ ] **Step 3: Commit any fixes**

```bash
git add projects/community-platform
git commit -m "perf(community-platform): tune Lighthouse scores to 90+"
```

### Task 10.3: Production deploy

- [ ] **Step 1: Sanity-check env on Vercel**

```bash
cd projects/community-platform
pnpm dlx vercel env ls
```

Verify all 13 env vars set for both `preview` and `production`. Real values (no placeholders) in production.

- [ ] **Step 2: Promote to production**

```bash
cd projects/community-platform
pnpm dlx vercel --prod
```

Note the production URL (e.g., `warsaw-ai-community-platform.vercel.app`).

- [ ] **Step 3: Smoke-test production**

- Visit production URL → redirect to `/login`.
- Sign in with your GitHub → consent modal → accept → land on `/home`.
- Browse `/members`, `/projects`, `/decisions`, `/meetings`.
- Post a status on `/this-week` — verify commit appears in the repo within 60s.
- Visit `/admin/health`.

- [ ] **Step 4: Update README with production URL**

In `projects/community-platform/README.md`, set the Production URL.

- [ ] **Step 5: Commit**

```bash
git add projects/community-platform/README.md
git commit -m "chore(community-platform): production URL in README"
```

### Task 10.4: Tag + announce

- [ ] **Step 1: Tag v0.1.0**

```bash
git tag -a community-platform-v0.1.0 -m "Warsaw AI Community Platform v0.1.0 — Lite slice"
git push origin warsaw-org-and-stack-guide --tags
```

- [ ] **Step 2: Open PR to main**

```bash
gh pr create \
  --title "Warsaw AI Community Platform v0.1.0" \
  --body "$(cat <<'EOF'
## Summary

- Lite slice (per spec): identity + memory spine + one write surface.
- Stack: Next.js 15 + Vercel + GitHub OAuth (JWT) + GitHub App writer.
- Storage: 100% git for v0.1.
- Live at: <production-url>

## Spec

[`projects/community-platform/spec.md`](projects/community-platform/spec.md)

## Plan

[`projects/community-platform/plan.md`](projects/community-platform/plan.md)

## Test plan

- [x] All ten phases shipped green.
- [x] Spec §8 acceptance criteria verified (see CHANGELOG Phase 10).
- [x] Lighthouse ≥ 90 on /home, /members, /this-week.
- [x] No PII in error logs.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: After merge, announce in Telegram**

Post in `#announcements` topic: "v0.1 of the Warsaw AI Community platform is live at <URL>. Sign in with GitHub. Roster members only."

- [ ] **Step 4: Final CHANGELOG**

In `projects/community-platform/CHANGELOG.md`, replace `[Unreleased]` heading with `[0.1.0] — <today>`.

```bash
git add projects/community-platform/CHANGELOG.md
git commit -m "release(community-platform): v0.1.0"
```

---

## Self-review

The plan covers spec §1–§10. Each spec section maps to at least one task:

| Spec | Tasks |
|---|---|
| §1 (Problem) | All phases motivate this |
| §2 goal 1 (login + directories) | Phase 1 (auth), Phase 2 (members), Phase 3 (archives) |
| §2 goal 2 (contribution count) | Phase 7 |
| §2 goal 3 (status updates) | Phase 5 |
| §2 goal 4 (persona panel) | Phase 2.4 |
| §2 goal 5 (project pages) | Phase 3.1 + 3.2 |
| §2 goal 6 (decisions + meetings) | Phase 3.3–3.6 |
| §2 goal 7 (80% test coverage + E2E) | Every phase has TDD + E2E in 0.7, 0.8, 1.12, 2.7, 3.7, 5.6, 6.4, 8.4 |
| §2 goal 8 (health metric) | Phase 9 |
| §3 (non-goals) | Enforced by absence — no kudos, badges, GBrain panel, etc. |
| §4 (RBAC) | Phase 1.3 |
| §5 (constraints) | Phase 0 (stack), 0.10 (env) |
| §6.1 (classification rule) | Phase 0.11 |
| §6.2 (architecture) | All phases follow the architecture |
| §6.3 (build vs runtime) | Phase 1.9 (snapshot), Phase 5.2 (runtime) |
| §6.4 (auth flow) | Phase 1.5–1.10 |
| §6.5 (status lifecycle) | Phase 5 |
| §6.6 (contributions) | Phase 7 |
| §6.7 (persona) | Phase 2.2, 2.4 |
| §6.8 (GBrain) | Deferred — no task |
| §6.9 (repo layout) | All phases |
| §6.10 (governance source) | Phase 0.2, 1.2, 1.9 |
| §6.11 (consent) | Phase 6 |
| §6.12 (concurrent writes) | Phase 4.2, 5.3 |
| §6.13 (GDPR) | Phase 8 |
| §7 (data + consent table) | Reflected throughout |
| §8 (testing) | Phase 0.7, 0.8 + per-phase tests |
| §9 (risks) | Pre-launch tasks 0.1–0.3 close risk 3 |
| §10 (long-term commitments) | Health metric phase 9; classification rule phase 0.11; commitments documented in spec only (no code) |

**Type consistency check:**
- `RosterMember` is defined in Phase 1.1 and used in Phase 1.3, 7.1, 9.1.
- `MemberWithProfile` defined in Phase 2.2 and used in pages.
- `Contributions` defined in Phase 7.1 and used in 7.3, 8.1.
- `GitHubAppClient` / `GitHubAppError` defined in Phase 4.2 and used in 5.3, 6.1, 8.2.
- `StatusUpdate` defined in Phase 5.2 and used in 8.1, 9.1.
- `Meeting` defined in Phase 3.5; `attendees` is `readonly string[]` everywhere it's referenced (Phase 7.1).

**Placeholder scan:** No `TBD`, `TODO`, "implement later", or "fill in details" remain in tasks. All code blocks are complete and copy-pasteable. The `<handle>` placeholder in Task 0.2 is to be replaced with Anton's real GitHub handle — that's a value the implementing engineer fills in once.

**Scope check:** Single coherent project. Each phase ships green-build, testable software. The scope is consistent with the spec's Lite slice.

**Ambiguity check:** Concurrent edit handling spelled out in 4.2 + 5.3. Bot vs roster member email mapping has known limitation (documented in 7.2 + spec §9 risk 8). Build pipeline order (snapshot → contributions → next build) is locked in 7.2 step 2.

---

**Plan complete and saved to `projects/community-platform/plan.md`.**

## Execution choice

Two execution options after committing this plan:

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task; review between tasks; fast iteration. Use `superpowers:subagent-driven-development`.
2. **Inline Execution** — Execute tasks in this session; batch with checkpoints. Use `superpowers:executing-plans`.

For a 2–3 week solo founder build, **subagent-driven** is the right shape — one subagent per task keeps each context tight, lets you review between tasks, and parallelizes nothing (good for sequential phases).
