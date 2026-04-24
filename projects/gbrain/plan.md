# GBrain Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship GBrain v0.1 — a Telegram bot for the Warsaw AI Community that (a) ingests opt-in tagged messages into markdown files committed to this repo, and (b) posts a daily News & Signals digest generated via Gemini through the Vercel AI Gateway.

**Architecture:** Standalone Next.js App Router project at `projects/gbrain/app/`, deployed to Vercel. Two HTTP entrypoints: `POST /api/telegram/webhook` for Telegram updates, `GET /api/cron/daily-digest` for Vercel Cron. Seven focused TypeScript modules (`consent`, `ingest`, `store`, `digest`, `ai`, `telegram`, `commands`) each tested independently. Gemini is the primary LLM (via Vercel AI Gateway with Claude + OpenAI fail-over). Archive content is written as deterministic markdown to `community/archive/YYYY-MM/` via a GitHub bot token scoped to that path.

**Tech Stack:** Next.js 16 (App Router) · TypeScript 5 · Vercel Fluid Compute + Cron · Vercel AI Gateway · Gemini (`google/gemini-2.0-flash`) · Telegram Bot API (`grammY` library) · Octokit for GitHub commits · Vitest for tests · GitHub Actions for CI.

**Canonical references:**
- Spec: [`projects/gbrain/spec.md`](spec.md)
- ADR-0006: [secret handling](../../docs/decisions/0006-secret-handling-and-rotation.md)
- ADR-0007: [Phase 1 architecture](../../docs/decisions/0007-gbrain-phase-1-architecture.md)

---

## File structure (what this plan creates)

All paths relative to repo root.

```
projects/gbrain/
├── CHANGELOG.md                     (new — release log)
├── plan.md                          (this file)
├── spec.md                          (already exists)
├── README.md                        (already exists)
└── app/                             (Next.js project — Vercel root dir)
    ├── .env.example                 (env var contract, no real values)
    ├── .gitignore                   (app-level ignores)
    ├── .nvmrc                       ("24")
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs
    ├── vercel.ts                    (Vercel config — framework, cron)
    ├── vitest.config.ts
    ├── eslint.config.mjs
    ├── app/
    │   ├── layout.tsx               (minimal root — no UI for v0.1)
    │   ├── page.tsx                 (health page)
    │   └── api/
    │       ├── telegram/
    │       │   └── webhook/
    │       │       └── route.ts     (POST webhook handler)
    │       └── cron/
    │           └── daily-digest/
    │               └── route.ts     (GET cron handler)
    ├── src/
    │   ├── config.ts                (typed env vars, validated at startup)
    │   ├── types.ts                 (shared types: TelegramMessage, ArchiveEntry, ConsentDecision)
    │   ├── topics.ts                (TOPIC_CLASS map: formal | casual per topic id)
    │   ├── consent/
    │   │   ├── index.ts             (public API: evaluate())
    │   │   ├── rules.ts             (decision table impl)
    │   │   └── preferences.ts       (read/write per-author opt-out store)
    │   ├── ingest/
    │   │   ├── index.ts             (public API: toMarkdown())
    │   │   ├── frontmatter.ts       (YAML frontmatter builder)
    │   │   └── slug.ts              (deterministic slug from message)
    │   ├── store/
    │   │   ├── index.ts             (public API: commit(), remove())
    │   │   └── github.ts            (Octokit wrapper, scoped writes)
    │   ├── digest/
    │   │   ├── index.ts             (public API: runDigest())
    │   │   ├── select.ts            (pick messages for last 24h)
    │   │   ├── prompt.ts            (prompt template)
    │   │   └── render.ts            (render LLM output → markdown)
    │   ├── ai/
    │   │   ├── index.ts             (public API: summarise())
    │   │   └── gateway.ts           (Vercel AI Gateway client)
    │   ├── telegram/
    │   │   ├── index.ts             (public API: bot, sendMessage, react)
    │   │   ├── client.ts            (grammY bot factory)
    │   │   └── verify.ts            (webhook secret header validation)
    │   ├── commands/
    │   │   ├── index.ts             (dispatch)
    │   │   ├── forget.ts            (/gbrain-forget)
    │   │   ├── optout.ts            (/gbrain-optout)
    │   │   ├── status.ts            (/gbrain-status)
    │   │   └── confirm.ts           (/yes, /no DM replies)
    │   └── pending/
    │       ├── index.ts             (public API: enqueue(), flush())
    │       └── store.ts             (KV-backed 48h queue; uses Vercel KV via Marketplace OR in-memory fallback for tests)
    └── tests/
        ├── unit/
        │   ├── consent.test.ts
        │   ├── ingest.test.ts
        │   ├── slug.test.ts
        │   ├── digest-prompt.test.ts
        │   ├── digest-render.test.ts
        │   ├── commands-forget.test.ts
        │   ├── commands-optout.test.ts
        │   └── telegram-verify.test.ts
        ├── integration/
        │   ├── webhook-ingest.test.ts       (message → consent → commit)
        │   ├── webhook-command.test.ts      (command routing)
        │   └── cron-digest.test.ts          (digest end-to-end with mocks)
        └── fixtures/
            ├── telegram-messages.ts
            └── gemini-responses.ts

community/archive/                   (new top-level dir — bot writes here)
├── README.md                        (explains contents + consent model)
├── _removed/                        (removal records, hash-only)
│   └── .gitkeep
├── digests/
│   └── .gitkeep
└── .gitkeep

.github/
└── workflows/
    ├── gbrain-ci.yml                (lint + test + secret scan on PRs touching projects/gbrain/**)
    └── gbrain-secret-scan.yml       (re-usable workflow fragment)
```

**Module responsibilities (from spec §7):**

| Module | Input | Output | Pure? |
|---|---|---|---|
| `consent` | `(message, topic, tags, prefs)` | `{ allow, require_confirm, deny, reason }` | Yes |
| `ingest` | `(message)` | markdown string | Yes |
| `store` | `(path, content)` | commit SHA | No (network) |
| `digest` | `(messages[])` | rendered digest markdown | Partly (calls `ai`) |
| `ai` | `(prompt, model, input)` | text + usage | No (network) |
| `telegram` | webhook body / outbound calls | parsed updates / API responses | No (network) |
| `commands` | parsed command + author | side effect (store / DM) | No |
| `pending` | `(entry)` | stored / flushed | No (KV) |

**Types (defined once in `src/types.ts`, imported everywhere):**

```typescript
export type TopicClass = "formal" | "casual";

export interface TelegramMessage {
  message_id: number;
  date: number; // unix seconds
  chat: { id: number; type: string };
  message_thread_id?: number; // topic id in forum-mode chats
  from: { id: number; username?: string; first_name: string };
  text?: string;
  entities?: Array<{ type: string; offset: number; length: number }>;
  reply_to_message?: { message_id: number };
}

export interface ParsedMessage {
  raw: TelegramMessage;
  tags: Set<string>; // e.g. {"kb", "skip", "archive"}
  topicId: number | null;
  topicClass: TopicClass;
  authorHandle: string; // username or "user_{id}"
  plainText: string;
  timestamp: Date;
}

export type ConsentDecision =
  | { kind: "allow"; reason: string }
  | { kind: "require_confirm"; reason: string; confirmFrom: number /* author id */ }
  | { kind: "defer_48h"; reason: string; deferUntil: Date }
  | { kind: "deny"; reason: string };

export interface AuthorPreferences {
  authorId: number;
  optedOut: boolean;
  updatedAt: Date;
}

export interface ArchiveEntry {
  slug: string;           // deterministic, e.g. "2026-04-24-questions-answers-foo-bar"
  topicName: string;
  authorHandle: string;
  timestamp: Date;
  sourceLink: string;     // https://t.me/c/<chat>/<message>
  body: string;           // the message text
  tags: string[];
  frontmatter: Record<string, unknown>;
}
```

---

## Task sequence

Tasks are ordered so that each one produces a working, testable increment. All tasks run inside `projects/gbrain/app/` unless otherwise stated. **Every task ends with a commit.** Conventional commits.

### Task 1: Scaffold the Next.js project

**Files:**
- Create: `projects/gbrain/app/package.json`
- Create: `projects/gbrain/app/tsconfig.json`
- Create: `projects/gbrain/app/next.config.mjs`
- Create: `projects/gbrain/app/.nvmrc`
- Create: `projects/gbrain/app/.gitignore`
- Create: `projects/gbrain/app/app/layout.tsx`
- Create: `projects/gbrain/app/app/page.tsx`
- Create: `projects/gbrain/app/eslint.config.mjs`
- Create: `projects/gbrain/app/vitest.config.ts`
- Create: `projects/gbrain/app/.env.example`
- Create: `projects/gbrain/CHANGELOG.md`

- [ ] **Step 1.1: Create `projects/gbrain/app/package.json`**

```json
{
  "name": "@warsaw-ai/gbrain",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "next dev --port 3005",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "ai": "^6.0.0",
    "grammy": "^1.30.0",
    "next": "^16.0.0",
    "octokit": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "typescript": "^5.6.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 1.2: Create `projects/gbrain/app/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 1.3: Create `projects/gbrain/app/next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { typedRoutes: true }
};
export default nextConfig;
```

- [ ] **Step 1.4: Create `projects/gbrain/app/.nvmrc`**

```
24
```

- [ ] **Step 1.5: Create `projects/gbrain/app/.gitignore`**

```
node_modules/
.next/
.vercel/
coverage/
*.tsbuildinfo
next-env.d.ts
.env
.env.local
.env.*.local
```

- [ ] **Step 1.6: Create `projects/gbrain/app/app/layout.tsx`**

```tsx
import type { ReactNode } from "react";

export const metadata = {
  title: "GBrain",
  description: "Warsaw AI Community knowledge bot"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 1.7: Create `projects/gbrain/app/app/page.tsx`**

```tsx
export default function Page() {
  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>GBrain</h1>
      <p>Warsaw AI Community knowledge bot. This endpoint is a health check; all bot activity happens via Telegram.</p>
    </main>
  );
}
```

- [ ] **Step 1.8: Create `projects/gbrain/app/eslint.config.mjs`**

```js
import next from "eslint-config-next";

export default [...next(), { ignores: [".next/", "coverage/"] }];
```

- [ ] **Step 1.9: Create `projects/gbrain/app/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/types.ts"]
    }
  },
  resolve: { alias: { "@": new URL("./src/", import.meta.url).pathname } }
});
```

- [ ] **Step 1.10: Create `projects/gbrain/app/.env.example`**

```
# Telegram bot — get from @BotFather
TELEGRAM_BOT_TOKEN=
# Secret registered with setWebhook → verified on every webhook
TELEGRAM_WEBHOOK_SECRET=

# Vercel AI Gateway
AI_GATEWAY_API_KEY=

# Gemini (fallback direct if gateway not configured; prefer gateway)
GEMINI_API_KEY=

# GitHub bot — fine-grained PAT scoped to this repo's community/archive/**
GITHUB_BOT_TOKEN=
GITHUB_REPO_OWNER=
GITHUB_REPO_NAME=
GITHUB_DEFAULT_BRANCH=main

# Telegram channel + topic IDs (populated after @BotFather setup)
CHAT_ID=
TOPIC_GENERAL_ID=
TOPIC_QA_ID=
TOPIC_GUIDES_ID=
TOPIC_MEETUPS_ID=
TOPIC_PROJECTS_ID=
TOPIC_NEWS_ID=
TOPIC_TOOLS_ID=
TOPIC_PITCHES_ID=

# Digest config
DIGEST_TIMEZONE=Europe/Warsaw
DIGEST_HOUR_LOCAL=9

# Feature flags / kill switches
GBRAIN_KILL_SWITCH=false
DIGEST_ENABLED=true

# Cron shared secret (Vercel sends this header)
CRON_SECRET=
```

- [ ] **Step 1.11: Create `projects/gbrain/CHANGELOG.md`**

```md
# Changelog

## [Unreleased]
- Scaffold Next.js project at `projects/gbrain/app/`.
- CI pipeline + secret scan workflow.
- Config layer + shared types.
- `consent`, `ingest`, `store`, `telegram`, `digest`, `ai`, `commands`, `pending` modules.
- Telegram webhook + daily digest cron endpoints.
- Soft-launch rollout runbook.
```

- [ ] **Step 1.12: Install dependencies**

Run:
```bash
cd "projects/gbrain/app" && npm install
```
Expected: `package-lock.json` created; `node_modules/` populated. No vulnerabilities printed that affect production code.

- [ ] **Step 1.13: Verify scaffold builds**

Run:
```bash
cd "projects/gbrain/app" && npm run typecheck && npm run build
```
Expected: typecheck passes (no output); build completes with `.next/` produced and shows the single `/` route.

- [ ] **Step 1.14: Commit**

```bash
git add projects/gbrain/app projects/gbrain/CHANGELOG.md
git commit -m "feat(gbrain): scaffold Next.js project, tsconfig, vitest, env contract"
```

---

### Task 2: CI pipeline (lint + test + secret scan)

**Files:**
- Create: `.github/workflows/gbrain-ci.yml`

- [ ] **Step 2.1: Create the workflow**

```yaml
name: gbrain-ci

on:
  pull_request:
    paths:
      - "projects/gbrain/app/**"
      - ".github/workflows/gbrain-ci.yml"
  push:
    branches: [main]
    paths:
      - "projects/gbrain/app/**"

concurrency:
  group: gbrain-ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: projects/gbrain/app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: projects/gbrain/app/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Regex scan for common token shapes
        run: |
          set -euo pipefail
          # Common secret patterns; extend as needed. Fails on ANY match in the diff.
          PATTERNS='(AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{36}|gho_[A-Za-z0-9]{36}|xox[baprs]-[A-Za-z0-9-]+|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|-----BEGIN (RSA |EC )?PRIVATE KEY-----)'
          BASE="${{ github.event.pull_request.base.sha || 'HEAD~1' }}"
          HEAD="${{ github.event.pull_request.head.sha || 'HEAD' }}"
          if git diff "$BASE" "$HEAD" -U0 | grep -E "^\+" | grep -E "$PATTERNS"; then
            echo "::error::Potential secret detected in diff. Rotate the credential and remove it from the branch."
            exit 1
          fi
          echo "No secret patterns detected."
```

- [ ] **Step 2.2: Manually verify the regex against a known-positive string (in a scratch file, then delete)**

Run:
```bash
cd "projects/gbrain/app"
echo 'AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ1234567' | grep -E '(AIza[0-9A-Za-z_-]{35})'
```
Expected: the line prints (regex matches). Do **not** commit this check — it was a sanity test only.

- [ ] **Step 2.3: Commit the workflow**

```bash
git add .github/workflows/gbrain-ci.yml
git commit -m "ci(gbrain): add lint/test/secret-scan workflow for projects/gbrain/app"
```

---

### Task 3: Config layer — typed env vars

**Files:**
- Create: `projects/gbrain/app/src/config.ts`
- Create: `projects/gbrain/app/tests/unit/config.test.ts`

- [ ] **Step 3.1: Write the failing test**

Create `tests/unit/config.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("config.loadConfig()", () => {
  beforeEach(() => {
    for (const k of Object.keys(process.env)) delete process.env[k];
  });
  afterEach(() => {
    for (const k of Object.keys(process.env)) delete process.env[k];
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it("throws when required vars are missing", async () => {
    const { loadConfig } = await import("../../src/config.ts");
    expect(() => loadConfig()).toThrow(/TELEGRAM_BOT_TOKEN/);
  });

  it("returns a typed config when all required vars are present", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "abc:123";
    process.env.TELEGRAM_WEBHOOK_SECRET = "s3cret";
    process.env.AI_GATEWAY_API_KEY = "gw_key";
    process.env.GITHUB_BOT_TOKEN = "ghp_x";
    process.env.GITHUB_REPO_OWNER = "warsaw-ai";
    process.env.GITHUB_REPO_NAME = "community";
    process.env.CHAT_ID = "-1001234567890";
    process.env.TOPIC_NEWS_ID = "42";
    process.env.CRON_SECRET = "cronsec";
    const { loadConfig } = await import("../../src/config.ts");
    const cfg = loadConfig();
    expect(cfg.telegram.token).toBe("abc:123");
    expect(cfg.telegram.chatId).toBe(-1001234567890);
    expect(cfg.topics.newsSignalsId).toBe(42);
    expect(cfg.flags.killSwitch).toBe(false);
    expect(cfg.flags.digestEnabled).toBe(true);
  });

  it("treats GBRAIN_KILL_SWITCH=true as killed", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "abc:123";
    process.env.TELEGRAM_WEBHOOK_SECRET = "s";
    process.env.AI_GATEWAY_API_KEY = "g";
    process.env.GITHUB_BOT_TOKEN = "ghp_x";
    process.env.GITHUB_REPO_OWNER = "warsaw-ai";
    process.env.GITHUB_REPO_NAME = "community";
    process.env.CHAT_ID = "-1001";
    process.env.TOPIC_NEWS_ID = "1";
    process.env.CRON_SECRET = "cs";
    process.env.GBRAIN_KILL_SWITCH = "true";
    const { loadConfig } = await import("../../src/config.ts");
    expect(loadConfig().flags.killSwitch).toBe(true);
  });
});
```

- [ ] **Step 3.2: Run test — expect FAIL**

Run:
```bash
cd "projects/gbrain/app" && npm test -- config
```
Expected: `Cannot find module .../src/config.ts` (module not yet created).

- [ ] **Step 3.3: Implement `src/config.ts`**

```ts
import { z } from "zod";

const schema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(10),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(4),

  AI_GATEWAY_API_KEY: z.string().min(4),
  GEMINI_API_KEY: z.string().optional(),

  GITHUB_BOT_TOKEN: z.string().min(8),
  GITHUB_REPO_OWNER: z.string().min(1),
  GITHUB_REPO_NAME: z.string().min(1),
  GITHUB_DEFAULT_BRANCH: z.string().default("main"),

  CHAT_ID: z.coerce.number().int(),
  TOPIC_GENERAL_ID: z.coerce.number().int().optional(),
  TOPIC_QA_ID: z.coerce.number().int().optional(),
  TOPIC_GUIDES_ID: z.coerce.number().int().optional(),
  TOPIC_MEETUPS_ID: z.coerce.number().int().optional(),
  TOPIC_PROJECTS_ID: z.coerce.number().int().optional(),
  TOPIC_NEWS_ID: z.coerce.number().int(),
  TOPIC_TOOLS_ID: z.coerce.number().int().optional(),
  TOPIC_PITCHES_ID: z.coerce.number().int().optional(),

  DIGEST_TIMEZONE: z.string().default("Europe/Warsaw"),
  DIGEST_HOUR_LOCAL: z.coerce.number().int().min(0).max(23).default(9),

  GBRAIN_KILL_SWITCH: z.enum(["true", "false"]).default("false"),
  DIGEST_ENABLED: z.enum(["true", "false"]).default("true"),

  CRON_SECRET: z.string().min(4)
});

export interface Config {
  telegram: { token: string; webhookSecret: string; chatId: number };
  ai: { gatewayKey: string; geminiKey?: string };
  github: { token: string; owner: string; repo: string; branch: string };
  topics: {
    generalId?: number; qaId?: number; guidesId?: number; meetupsId?: number;
    projectsId?: number; newsSignalsId: number; toolsId?: number; pitchesId?: number;
  };
  digest: { timezone: string; hourLocal: number };
  flags: { killSwitch: boolean; digestEnabled: boolean };
  cron: { secret: string };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const fields = parsed.error.issues.map(i => i.path.join(".")).join(", ");
    throw new Error(`Missing/invalid env vars: ${fields}`);
  }
  const e = parsed.data;
  return {
    telegram: { token: e.TELEGRAM_BOT_TOKEN, webhookSecret: e.TELEGRAM_WEBHOOK_SECRET, chatId: e.CHAT_ID },
    ai: { gatewayKey: e.AI_GATEWAY_API_KEY, geminiKey: e.GEMINI_API_KEY },
    github: { token: e.GITHUB_BOT_TOKEN, owner: e.GITHUB_REPO_OWNER, repo: e.GITHUB_REPO_NAME, branch: e.GITHUB_DEFAULT_BRANCH },
    topics: {
      generalId: e.TOPIC_GENERAL_ID, qaId: e.TOPIC_QA_ID, guidesId: e.TOPIC_GUIDES_ID,
      meetupsId: e.TOPIC_MEETUPS_ID, projectsId: e.TOPIC_PROJECTS_ID,
      newsSignalsId: e.TOPIC_NEWS_ID, toolsId: e.TOPIC_TOOLS_ID, pitchesId: e.TOPIC_PITCHES_ID
    },
    digest: { timezone: e.DIGEST_TIMEZONE, hourLocal: e.DIGEST_HOUR_LOCAL },
    flags: { killSwitch: e.GBRAIN_KILL_SWITCH === "true", digestEnabled: e.DIGEST_ENABLED === "true" },
    cron: { secret: e.CRON_SECRET }
  };
}
```

- [ ] **Step 3.4: Run tests — expect PASS**

Run: `cd "projects/gbrain/app" && npm test -- config`
Expected: 3 tests pass.

- [ ] **Step 3.5: Commit**

```bash
git add projects/gbrain/app/src/config.ts projects/gbrain/app/tests/unit/config.test.ts
git commit -m "feat(gbrain/config): typed env loading with zod + 3 tests"
```

---

### Task 4: Shared types + topics map

**Files:**
- Create: `projects/gbrain/app/src/types.ts`
- Create: `projects/gbrain/app/src/topics.ts`

- [ ] **Step 4.1: Create `src/types.ts`**

```ts
export type TopicClass = "formal" | "casual";

export interface TelegramMessage {
  message_id: number;
  date: number;
  chat: { id: number; type: string };
  message_thread_id?: number;
  from: { id: number; username?: string; first_name: string };
  text?: string;
  entities?: Array<{ type: string; offset: number; length: number }>;
  reply_to_message?: { message_id: number };
}

export interface ParsedMessage {
  raw: TelegramMessage;
  tags: Set<string>;
  topicId: number | null;
  topicClass: TopicClass;
  authorHandle: string;
  plainText: string;
  timestamp: Date;
}

export type ConsentDecision =
  | { kind: "allow"; reason: string }
  | { kind: "require_confirm"; reason: string; confirmFrom: number }
  | { kind: "defer_48h"; reason: string; deferUntil: Date }
  | { kind: "deny"; reason: string };

export interface AuthorPreferences {
  authorId: number;
  optedOut: boolean;
  updatedAt: Date;
}

export interface ArchiveEntry {
  slug: string;
  topicName: string;
  authorHandle: string;
  timestamp: Date;
  sourceLink: string;
  body: string;
  tags: string[];
  frontmatter: Record<string, unknown>;
}

export interface AiUsage { inputTokens: number; outputTokens: number; costUsd?: number }
export interface AiResult { text: string; usage: AiUsage; model: string }
```

- [ ] **Step 4.2: Create `src/topics.ts`**

```ts
import type { TopicClass } from "./types.ts";
import { loadConfig } from "./config.ts";

export interface TopicInfo { id: number; name: string; class: TopicClass }

export function buildTopicMap(cfg = loadConfig()): Map<number, TopicInfo> {
  const t = cfg.topics;
  const entries: Array<[number | undefined, string, TopicClass]> = [
    [t.generalId, "General", "casual"],
    [t.qaId, "Questions & Answers", "casual"],
    [t.guidesId, "Guides", "formal"],
    [t.meetupsId, "Meetups", "formal"],
    [t.projectsId, "Projects & Repos", "formal"],
    [t.newsSignalsId, "News & Signals", "formal"],
    [t.toolsId, "Tools & Stacks", "formal"],
    [t.pitchesId, "Builds & Pitches", "formal"]
  ];
  const map = new Map<number, TopicInfo>();
  for (const [id, name, klass] of entries) {
    if (typeof id === "number") map.set(id, { id, name, class: klass });
  }
  return map;
}
```

- [ ] **Step 4.3: Typecheck**

Run: `cd "projects/gbrain/app" && npm run typecheck`
Expected: pass (no output).

- [ ] **Step 4.4: Commit**

```bash
git add projects/gbrain/app/src/types.ts projects/gbrain/app/src/topics.ts
git commit -m "feat(gbrain/types): shared types + topic map builder"
```

---

### Task 5: Consent rules engine — pure decision table

**Files:**
- Create: `projects/gbrain/app/src/consent/rules.ts`
- Create: `projects/gbrain/app/src/consent/index.ts`
- Create: `projects/gbrain/app/tests/unit/consent.test.ts`

This is the highest-stakes module. Tests cover the full decision table from `spec.md` §10.

- [ ] **Step 5.1: Write the failing test**

Create `tests/unit/consent.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { evaluate } from "../../src/consent/index.ts";
import type { ParsedMessage, AuthorPreferences } from "../../src/types.ts";

const NOW = new Date("2026-04-24T12:00:00Z");

function msg(overrides: Partial<ParsedMessage> = {}): ParsedMessage {
  return {
    raw: {} as never,
    tags: new Set<string>(),
    topicId: 1,
    topicClass: "casual",
    authorHandle: "alice",
    plainText: "hello",
    timestamp: NOW,
    ...overrides
  };
}

const noPrefs = (): AuthorPreferences => ({ authorId: 1, optedOut: false, updatedAt: NOW });
const optedOut = (): AuthorPreferences => ({ authorId: 1, optedOut: true, updatedAt: NOW });

describe("consent.evaluate", () => {
  it("denies casual topic + no tags", () => {
    const d = evaluate({ message: msg(), prefs: noPrefs(), taggerIsAuthor: true, now: NOW });
    expect(d.kind).toBe("deny");
  });

  it("allows casual topic + #kb + tagger is author", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["kb"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("allow");
  });

  it("requires confirmation in casual topic + #kb + tagger is not author", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["kb"]) }),
      prefs: noPrefs(), taggerIsAuthor: false, now: NOW
    });
    expect(d.kind).toBe("require_confirm");
  });

  it("denies #skip in casual topic regardless of other tags", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["kb", "skip"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
  });

  it("defers formal topic + no tags for 48h", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal" }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("defer_48h");
    if (d.kind === "defer_48h") {
      expect(d.deferUntil.getTime() - NOW.getTime()).toBe(48 * 60 * 60 * 1000);
    }
  });

  it("allows formal topic + #kb immediately (no defer)", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal", tags: new Set(["kb"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("allow");
  });

  it("denies formal topic + #skip hard", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal", tags: new Set(["skip"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
  });

  it("denies when author is opted out, regardless of topic/tags", () => {
    const d = evaluate({
      message: msg({ topicClass: "formal", tags: new Set(["kb"]) }),
      prefs: optedOut(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toMatch(/opt/i);
  });

  it("treats #archive alias the same as #kb", () => {
    const d = evaluate({
      message: msg({ tags: new Set(["archive"]) }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("allow");
  });

  it("denies when topic is unknown/null", () => {
    const d = evaluate({
      message: msg({ topicId: null }),
      prefs: noPrefs(), taggerIsAuthor: true, now: NOW
    });
    expect(d.kind).toBe("deny");
  });
});
```

- [ ] **Step 5.2: Run test — expect FAIL**

Run: `cd "projects/gbrain/app" && npm test -- consent`
Expected: module not found error.

- [ ] **Step 5.3: Implement `src/consent/rules.ts`**

```ts
import type { ParsedMessage, ConsentDecision, AuthorPreferences } from "../types.ts";

export interface EvaluateInput {
  message: ParsedMessage;
  prefs: AuthorPreferences;
  taggerIsAuthor: boolean;
  now: Date;
}

const DEFER_MS = 48 * 60 * 60 * 1000;

export function evaluate(input: EvaluateInput): ConsentDecision {
  const { message, prefs, taggerIsAuthor, now } = input;

  if (prefs.optedOut) {
    return { kind: "deny", reason: "author opted out via /gbrain-optout" };
  }

  if (message.tags.has("skip")) {
    return { kind: "deny", reason: "message tagged #skip" };
  }

  if (message.topicId === null) {
    return { kind: "deny", reason: "unknown topic" };
  }

  const kbTagged = message.tags.has("kb") || message.tags.has("archive");

  if (message.topicClass === "formal") {
    if (kbTagged) return { kind: "allow", reason: "formal topic + #kb (immediate)" };
    return {
      kind: "defer_48h",
      reason: "formal topic pre-consent; #skip window open",
      deferUntil: new Date(now.getTime() + DEFER_MS)
    };
  }

  // casual topic
  if (!kbTagged) return { kind: "deny", reason: "casual topic + no archive tag" };
  if (taggerIsAuthor) return { kind: "allow", reason: "casual topic + #kb + author is tagger" };
  return {
    kind: "require_confirm",
    reason: "casual topic + #kb + third-party tagger",
    confirmFrom: message.raw.from.id
  };
}
```

- [ ] **Step 5.4: Create `src/consent/index.ts`**

```ts
export { evaluate } from "./rules.ts";
export type { EvaluateInput } from "./rules.ts";
```

- [ ] **Step 5.5: Run tests — expect PASS**

Run: `cd "projects/gbrain/app" && npm test -- consent`
Expected: 10 tests pass.

- [ ] **Step 5.6: Commit**

```bash
git add projects/gbrain/app/src/consent projects/gbrain/app/tests/unit/consent.test.ts
git commit -m "feat(gbrain/consent): pure rules engine + 10-case decision table tests"
```

---

### Task 6: Author preferences store

**Files:**
- Create: `projects/gbrain/app/src/consent/preferences.ts`
- Create: `projects/gbrain/app/tests/unit/preferences.test.ts`

`preferences` is backed by the repo itself (JSON file in `community/archive/_meta/preferences.json`) so it inherits version control + audit. In-memory fallback for tests.

- [ ] **Step 6.1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { createInMemoryPreferences } from "../../src/consent/preferences.ts";

describe("preferences (in-memory)", () => {
  it("returns default (not opted out) for new author", async () => {
    const store = createInMemoryPreferences();
    const p = await store.get(1);
    expect(p.optedOut).toBe(false);
    expect(p.authorId).toBe(1);
  });

  it("persists optOut() and surfaces via get()", async () => {
    const store = createInMemoryPreferences();
    await store.optOut(1);
    expect((await store.get(1)).optedOut).toBe(true);
  });

  it("optIn() reverses optOut()", async () => {
    const store = createInMemoryPreferences();
    await store.optOut(7);
    await store.optIn(7);
    expect((await store.get(7)).optedOut).toBe(false);
  });
});
```

- [ ] **Step 6.2: Run — expect FAIL**

Run: `cd "projects/gbrain/app" && npm test -- preferences`

- [ ] **Step 6.3: Implement `src/consent/preferences.ts`**

```ts
import type { AuthorPreferences } from "../types.ts";

export interface PreferencesStore {
  get(authorId: number): Promise<AuthorPreferences>;
  optOut(authorId: number): Promise<void>;
  optIn(authorId: number): Promise<void>;
}

export function createInMemoryPreferences(): PreferencesStore {
  const state = new Map<number, AuthorPreferences>();
  const touch = (authorId: number, optedOut: boolean) => {
    state.set(authorId, { authorId, optedOut, updatedAt: new Date() });
  };
  return {
    async get(authorId) {
      return state.get(authorId) ?? { authorId, optedOut: false, updatedAt: new Date(0) };
    },
    async optOut(authorId) { touch(authorId, true); },
    async optIn(authorId) { touch(authorId, false); }
  };
}
```

- [ ] **Step 6.4: Run — expect PASS**

- [ ] **Step 6.5: Commit**

```bash
git add projects/gbrain/app/src/consent/preferences.ts projects/gbrain/app/tests/unit/preferences.test.ts
git commit -m "feat(gbrain/consent): in-memory preferences store + 3 tests"
```

---

### Task 7: Slug generation

**Files:**
- Create: `projects/gbrain/app/src/ingest/slug.ts`
- Create: `projects/gbrain/app/tests/unit/slug.test.ts`

- [ ] **Step 7.1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { buildSlug } from "../../src/ingest/slug.ts";

describe("buildSlug", () => {
  it("produces date-prefixed, topic-scoped, truncated kebab slug", () => {
    expect(buildSlug({
      timestamp: new Date("2026-04-24T15:30:00Z"),
      topicName: "Questions & Answers",
      plainText: "How do I run Llama 3 locally on a Mac with Apple Silicon?"
    })).toBe("2026-04-24-questions-answers-how-do-i-run-llama-3-locally-on-a");
  });

  it("handles non-ascii by stripping", () => {
    expect(buildSlug({
      timestamp: new Date("2026-04-24T00:00:00Z"),
      topicName: "Guides",
      plainText: "Тест документа z polskimi znakami — café"
    })).toMatch(/^2026-04-24-guides-/);
  });

  it("appends message_id when plainText is empty", () => {
    expect(buildSlug({
      timestamp: new Date("2026-04-24T00:00:00Z"),
      topicName: "Projects & Repos",
      plainText: "",
      messageId: 12345
    })).toBe("2026-04-24-projects-repos-msg-12345");
  });
});
```

- [ ] **Step 7.2: Run — expect FAIL**

- [ ] **Step 7.3: Implement `src/ingest/slug.ts`**

```ts
export interface SlugInput {
  timestamp: Date;
  topicName: string;
  plainText: string;
  messageId?: number;
}

const MAX_BODY_CHARS = 40;

function kebab(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function datePart(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildSlug(input: SlugInput): string {
  const topic = kebab(input.topicName);
  const body = kebab(input.plainText).slice(0, MAX_BODY_CHARS).replace(/-+$/, "");
  const date = datePart(input.timestamp);
  if (body.length > 0) return `${date}-${topic}-${body}`;
  if (typeof input.messageId === "number") return `${date}-${topic}-msg-${input.messageId}`;
  return `${date}-${topic}-untitled`;
}
```

- [ ] **Step 7.4: Run — expect PASS**

- [ ] **Step 7.5: Commit**

```bash
git add projects/gbrain/app/src/ingest/slug.ts projects/gbrain/app/tests/unit/slug.test.ts
git commit -m "feat(gbrain/ingest): deterministic slug generator + 3 tests"
```

---

### Task 8: Markdown frontmatter + ingest

**Files:**
- Create: `projects/gbrain/app/src/ingest/frontmatter.ts`
- Create: `projects/gbrain/app/src/ingest/index.ts`
- Create: `projects/gbrain/app/tests/unit/ingest.test.ts`

- [ ] **Step 8.1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { toMarkdown } from "../../src/ingest/index.ts";
import type { ParsedMessage } from "../../src/types.ts";

const NOW = new Date("2026-04-24T12:34:56Z");

function msg(body: string): ParsedMessage {
  return {
    raw: {
      message_id: 42,
      date: NOW.getTime() / 1000,
      chat: { id: -1001234567890, type: "supergroup" },
      message_thread_id: 1,
      from: { id: 99, username: "alice", first_name: "Alice" },
      text: body
    },
    tags: new Set(["kb"]),
    topicId: 1,
    topicClass: "casual",
    authorHandle: "alice",
    plainText: body,
    timestamp: NOW
  };
}

describe("ingest.toMarkdown", () => {
  it("produces deterministic frontmatter + body", () => {
    const md = toMarkdown({
      message: msg("Hello **world**"),
      topicName: "Questions & Answers",
      chatIdForLink: -1001234567890
    });
    expect(md).toContain("---\n");
    expect(md).toMatch(/topic: Questions & Answers/);
    expect(md).toMatch(/author_handle: alice/);
    expect(md).toMatch(/timestamp: 2026-04-24T12:34:56\.000Z/);
    expect(md).toMatch(/source: https:\/\/t\.me\/c\/1234567890\/1\/42/);
    expect(md).toMatch(/tags:\s*\n\s*- kb/);
    expect(md).toMatch(/\n\nHello \*\*world\*\*\n/);
  });

  it("strips channel prefix from chat id in source link", () => {
    const md = toMarkdown({
      message: msg("x"),
      topicName: "Guides",
      chatIdForLink: -1009876543210
    });
    expect(md).toMatch(/https:\/\/t\.me\/c\/9876543210\//);
  });
});
```

- [ ] **Step 8.2: Run — expect FAIL**

- [ ] **Step 8.3: Implement `src/ingest/frontmatter.ts`**

```ts
export function renderFrontmatter(values: Record<string, unknown>): string {
  const lines: string[] = ["---"];
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${String(item)}`);
    } else if (v instanceof Date) {
      lines.push(`${k}: ${v.toISOString()}`);
    } else {
      lines.push(`${k}: ${String(v)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}
```

- [ ] **Step 8.4: Implement `src/ingest/index.ts`**

```ts
import type { ParsedMessage } from "../types.ts";
import { renderFrontmatter } from "./frontmatter.ts";

export interface ToMarkdownInput {
  message: ParsedMessage;
  topicName: string;
  chatIdForLink: number;
}

function telegramLink(chatId: number, threadId: number | undefined, messageId: number): string {
  // Telegram supergroup chat IDs look like -100XXXXXXXXXX; public link uses XXXXXXXXXX.
  const numeric = Math.abs(chatId).toString();
  const trimmed = numeric.startsWith("100") ? numeric.slice(3) : numeric;
  const thread = typeof threadId === "number" ? `${threadId}/` : "";
  return `https://t.me/c/${trimmed}/${thread}${messageId}`;
}

export function toMarkdown(input: ToMarkdownInput): string {
  const { message, topicName, chatIdForLink } = input;
  const fm = renderFrontmatter({
    topic: topicName,
    topic_id: message.topicId ?? "",
    author_handle: message.authorHandle,
    author_id: message.raw.from.id,
    timestamp: message.timestamp,
    source: telegramLink(chatIdForLink, message.raw.message_thread_id, message.raw.message_id),
    tags: Array.from(message.tags).sort(),
    topic_class: message.topicClass
  });
  return `${fm}\n\n${message.plainText}\n`;
}
```

- [ ] **Step 8.5: Run — expect PASS**

- [ ] **Step 8.6: Commit**

```bash
git add projects/gbrain/app/src/ingest projects/gbrain/app/tests/unit/ingest.test.ts
git commit -m "feat(gbrain/ingest): toMarkdown with YAML frontmatter + 2 tests"
```

---

### Task 9: Telegram webhook verification

**Files:**
- Create: `projects/gbrain/app/src/telegram/verify.ts`
- Create: `projects/gbrain/app/tests/unit/telegram-verify.test.ts`

Telegram's `setWebhook` accepts a `secret_token`; Telegram sends it in header `X-Telegram-Bot-Api-Secret-Token`. We verify constant-time.

- [ ] **Step 9.1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { verifyWebhookSecret } from "../../src/telegram/verify.ts";

describe("verifyWebhookSecret", () => {
  it("returns true when headers match the expected secret", () => {
    const headers = new Headers({ "x-telegram-bot-api-secret-token": "abc" });
    expect(verifyWebhookSecret(headers, "abc")).toBe(true);
  });

  it("returns false on mismatch", () => {
    const headers = new Headers({ "x-telegram-bot-api-secret-token": "zzz" });
    expect(verifyWebhookSecret(headers, "abc")).toBe(false);
  });

  it("returns false when header is absent", () => {
    const headers = new Headers();
    expect(verifyWebhookSecret(headers, "abc")).toBe(false);
  });

  it("constant-time compare: different lengths do not throw", () => {
    const headers = new Headers({ "x-telegram-bot-api-secret-token": "short" });
    expect(() => verifyWebhookSecret(headers, "much-longer-expected")).not.toThrow();
    expect(verifyWebhookSecret(headers, "much-longer-expected")).toBe(false);
  });
});
```

- [ ] **Step 9.2: Run — expect FAIL**

- [ ] **Step 9.3: Implement `src/telegram/verify.ts`**

```ts
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function verifyWebhookSecret(headers: Headers, expected: string): boolean {
  const got = headers.get("x-telegram-bot-api-secret-token");
  if (got === null) return false;
  return constantTimeEqual(got, expected);
}
```

- [ ] **Step 9.4: Run — expect PASS**

- [ ] **Step 9.5: Commit**

```bash
git add projects/gbrain/app/src/telegram/verify.ts projects/gbrain/app/tests/unit/telegram-verify.test.ts
git commit -m "feat(gbrain/telegram): webhook secret verification + 4 tests"
```

---

### Task 10: Telegram client (grammY wrapper)

**Files:**
- Create: `projects/gbrain/app/src/telegram/client.ts`
- Create: `projects/gbrain/app/src/telegram/index.ts`

This task has no unit test of its own — it's a thin wrapper; it is covered by integration tests in Task 17.

- [ ] **Step 10.1: Create `src/telegram/client.ts`**

```ts
import { Bot } from "grammy";
import { loadConfig } from "../config.ts";

export interface BotClient {
  sendMessage(chatId: number, threadId: number | undefined, text: string, parseMode?: "Markdown" | "MarkdownV2" | "HTML"): Promise<void>;
  sendDirectMessage(userId: number, text: string): Promise<void>;
  setReaction(chatId: number, messageId: number, emoji: string): Promise<void>;
}

export function createBotClient(cfg = loadConfig()): BotClient {
  const bot = new Bot(cfg.telegram.token);
  return {
    async sendMessage(chatId, threadId, text, parseMode = "Markdown") {
      await bot.api.sendMessage(chatId, text, {
        parse_mode: parseMode,
        message_thread_id: threadId,
        disable_web_page_preview: true
      });
    },
    async sendDirectMessage(userId, text) {
      await bot.api.sendMessage(userId, text, { disable_web_page_preview: true });
    },
    async setReaction(chatId, messageId, emoji) {
      await bot.api.setMessageReaction(chatId, messageId, [{ type: "emoji", emoji }]);
    }
  };
}
```

- [ ] **Step 10.2: Create `src/telegram/index.ts`**

```ts
export { createBotClient } from "./client.ts";
export type { BotClient } from "./client.ts";
export { verifyWebhookSecret } from "./verify.ts";
```

- [ ] **Step 10.3: Typecheck**

Run: `cd "projects/gbrain/app" && npm run typecheck`
Expected: pass.

- [ ] **Step 10.4: Commit**

```bash
git add projects/gbrain/app/src/telegram/client.ts projects/gbrain/app/src/telegram/index.ts
git commit -m "feat(gbrain/telegram): grammY client wrapper for send/react/DM"
```

---

### Task 11: GitHub store (Octokit)

**Files:**
- Create: `projects/gbrain/app/src/store/github.ts`
- Create: `projects/gbrain/app/src/store/index.ts`
- Create: `projects/gbrain/app/tests/unit/store.test.ts`

Path-scoping enforcement is Phase 1's GitHub-side defence against the bot touching anything outside `community/archive/`.

- [ ] **Step 11.1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockGet = vi.fn();
const mockDelete = vi.fn();

vi.mock("octokit", () => ({
  Octokit: class {
    rest = {
      repos: {
        createOrUpdateFileContents: mockCreate,
        getContent: mockGet,
        deleteFile: mockDelete
      }
    };
  }
}));

beforeEach(() => { mockCreate.mockReset(); mockGet.mockReset(); mockDelete.mockReset(); });

describe("store.commit", () => {
  it("rejects paths outside community/archive/", async () => {
    const { createGithubStore } = await import("../../src/store/github.ts");
    const store = createGithubStore({ token: "x", owner: "o", repo: "r", branch: "main" });
    await expect(store.commit({ path: "community/charter/hack.md", content: "x", message: "m" }))
      .rejects.toThrow(/community\/archive/);
  });

  it("calls Octokit createOrUpdateFileContents with the right args", async () => {
    mockGet.mockRejectedValueOnce({ status: 404 });
    mockCreate.mockResolvedValueOnce({ data: { commit: { sha: "abc123" } } });
    const { createGithubStore } = await import("../../src/store/github.ts");
    const store = createGithubStore({ token: "x", owner: "o", repo: "r", branch: "main" });
    const sha = await store.commit({
      path: "community/archive/2026-04/foo.md",
      content: "hello",
      message: "archive: Questions & Answers — alice — 2026-04-24"
    });
    expect(sha).toBe("abc123");
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const call = mockCreate.mock.calls[0][0];
    expect(call.owner).toBe("o");
    expect(call.repo).toBe("r");
    expect(call.path).toBe("community/archive/2026-04/foo.md");
    expect(call.branch).toBe("main");
    expect(call.message).toMatch(/archive:/);
    expect(call.committer.name).toBe("gbrain-bot");
  });

  it("passes existing SHA when updating a file", async () => {
    mockGet.mockResolvedValueOnce({ data: { sha: "oldSha", type: "file" } });
    mockCreate.mockResolvedValueOnce({ data: { commit: { sha: "newCommit" } } });
    const { createGithubStore } = await import("../../src/store/github.ts");
    const store = createGithubStore({ token: "x", owner: "o", repo: "r", branch: "main" });
    await store.commit({ path: "community/archive/2026-04/foo.md", content: "hi", message: "m" });
    expect(mockCreate.mock.calls[0][0].sha).toBe("oldSha");
  });
});
```

- [ ] **Step 11.2: Run — expect FAIL**

- [ ] **Step 11.3: Implement `src/store/github.ts`**

```ts
import { Octokit } from "octokit";

export interface GithubStoreConfig { token: string; owner: string; repo: string; branch: string }

export interface CommitInput { path: string; content: string; message: string }

export interface GithubStore {
  commit(input: CommitInput): Promise<string /* commit sha */>;
  remove(input: { path: string; message: string }): Promise<string>;
}

const BOT_COMMITTER = { name: "gbrain-bot", email: "gbrain-bot@warsaw-ai-community.invalid" };
const ALLOWED_PREFIX = "community/archive/";

function assertAllowedPath(path: string) {
  if (!path.startsWith(ALLOWED_PREFIX)) {
    throw new Error(`path ${path} is outside ${ALLOWED_PREFIX} — write rejected`);
  }
}

export function createGithubStore(cfg: GithubStoreConfig): GithubStore {
  const kit = new Octokit({ auth: cfg.token });
  const common = { owner: cfg.owner, repo: cfg.repo, branch: cfg.branch };

  return {
    async commit({ path, content, message }) {
      assertAllowedPath(path);
      let sha: string | undefined;
      try {
        const existing = await kit.rest.repos.getContent({ ...common, path, ref: cfg.branch });
        const data = existing.data as { sha?: string; type?: string };
        if (data.type === "file" && typeof data.sha === "string") sha = data.sha;
      } catch (err: unknown) {
        const status = (err as { status?: number }).status;
        if (status !== 404) throw err;
      }
      const res = await kit.rest.repos.createOrUpdateFileContents({
        ...common, path, message,
        content: Buffer.from(content, "utf8").toString("base64"),
        committer: BOT_COMMITTER, author: BOT_COMMITTER,
        ...(sha ? { sha } : {})
      });
      return res.data.commit.sha ?? "";
    },

    async remove({ path, message }) {
      assertAllowedPath(path);
      const existing = await kit.rest.repos.getContent({ ...common, path, ref: cfg.branch });
      const data = existing.data as { sha?: string; type?: string };
      if (data.type !== "file" || typeof data.sha !== "string") {
        throw new Error(`cannot remove non-file at ${path}`);
      }
      const res = await kit.rest.repos.deleteFile({
        ...common, path, message, sha: data.sha,
        committer: BOT_COMMITTER, author: BOT_COMMITTER
      });
      return res.data.commit.sha ?? "";
    }
  };
}
```

- [ ] **Step 11.4: Create `src/store/index.ts`**

```ts
export { createGithubStore } from "./github.ts";
export type { GithubStore, CommitInput, GithubStoreConfig } from "./github.ts";
```

- [ ] **Step 11.5: Run — expect PASS**

Run: `cd "projects/gbrain/app" && npm test -- store`
Expected: 3 tests pass.

- [ ] **Step 11.6: Commit**

```bash
git add projects/gbrain/app/src/store projects/gbrain/app/tests/unit/store.test.ts
git commit -m "feat(gbrain/store): Octokit-backed commit/remove restricted to community/archive/"
```

---

### Task 12: AI gateway client

**Files:**
- Create: `projects/gbrain/app/src/ai/gateway.ts`
- Create: `projects/gbrain/app/src/ai/index.ts`
- Create: `projects/gbrain/app/tests/unit/ai.test.ts`

Using the Vercel AI SDK (`ai` package) with the Gateway provider — default model string is `"google/gemini-2.0-flash"`. Fail-over configured in Vercel AI Gateway UI, not in code.

- [ ] **Step 12.1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateText = vi.fn();
vi.mock("ai", () => ({ generateText: (...args: unknown[]) => mockGenerateText(...args) }));

beforeEach(() => mockGenerateText.mockReset());

describe("ai.summarise", () => {
  it("calls generateText with the requested model and prompt, returns text + usage", async () => {
    mockGenerateText.mockResolvedValueOnce({
      text: "summary",
      usage: { inputTokens: 120, outputTokens: 60 }
    });
    const { summarise } = await import("../../src/ai/index.ts");
    const result = await summarise({ model: "google/gemini-2.0-flash", prompt: "hi", maxOutputTokens: 500 });
    expect(result.text).toBe("summary");
    expect(result.usage.inputTokens).toBe(120);
    expect(result.usage.outputTokens).toBe(60);
    expect(result.model).toBe("google/gemini-2.0-flash");
    const arg = mockGenerateText.mock.calls[0][0];
    expect(arg.model).toBe("google/gemini-2.0-flash");
    expect(arg.prompt).toBe("hi");
    expect(arg.maxOutputTokens).toBe(500);
  });
});
```

- [ ] **Step 12.2: Run — expect FAIL**

- [ ] **Step 12.3: Implement `src/ai/gateway.ts`**

```ts
import { generateText } from "ai";
import type { AiResult } from "../types.ts";

export interface SummariseInput {
  model: string;       // e.g. "google/gemini-2.0-flash"
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export async function summarise(input: SummariseInput): Promise<AiResult> {
  const res = await generateText({
    model: input.model,
    prompt: input.prompt,
    maxOutputTokens: input.maxOutputTokens ?? 1500,
    temperature: input.temperature ?? 0.3
  });
  return {
    text: res.text,
    usage: {
      inputTokens: res.usage?.inputTokens ?? 0,
      outputTokens: res.usage?.outputTokens ?? 0
    },
    model: input.model
  };
}
```

- [ ] **Step 12.4: Create `src/ai/index.ts`**

```ts
export { summarise } from "./gateway.ts";
export type { SummariseInput } from "./gateway.ts";
```

- [ ] **Step 12.5: Run — expect PASS**

- [ ] **Step 12.6: Commit**

```bash
git add projects/gbrain/app/src/ai projects/gbrain/app/tests/unit/ai.test.ts
git commit -m "feat(gbrain/ai): Vercel AI Gateway summarise() wrapper + 1 test"
```

---

### Task 13: Digest prompt + render + select

**Files:**
- Create: `projects/gbrain/app/src/digest/select.ts`
- Create: `projects/gbrain/app/src/digest/prompt.ts`
- Create: `projects/gbrain/app/src/digest/render.ts`
- Create: `projects/gbrain/app/src/digest/index.ts`
- Create: `projects/gbrain/app/tests/unit/digest-prompt.test.ts`
- Create: `projects/gbrain/app/tests/unit/digest-render.test.ts`

- [ ] **Step 13.1: Write the failing prompt test**

```ts
// tests/unit/digest-prompt.test.ts
import { describe, it, expect } from "vitest";
import { buildDigestPrompt } from "../../src/digest/prompt.ts";

describe("buildDigestPrompt", () => {
  it("embeds every message with author + source link, excludes skipped ones", () => {
    const prompt = buildDigestPrompt({
      date: new Date("2026-04-24T09:00:00Z"),
      messages: [
        { author: "alice", text: "GPT-5 launched", source: "https://t.me/c/1/2/3", timestamp: new Date("2026-04-24T05:00:00Z") },
        { author: "bob", text: "New Llama paper", source: "https://t.me/c/1/2/4", timestamp: new Date("2026-04-24T06:00:00Z") }
      ]
    });
    expect(prompt).toMatch(/2026-04-24/);
    expect(prompt).toContain("GPT-5 launched");
    expect(prompt).toContain("New Llama paper");
    expect(prompt).toContain("alice");
    expect(prompt).toContain("bob");
    expect(prompt).toMatch(/https:\/\/t\.me\/c\/1\/2\/3/);
    expect(prompt).toMatch(/"why it matters"/);
  });

  it("warns the model when there are no messages", () => {
    const prompt = buildDigestPrompt({
      date: new Date("2026-04-24T09:00:00Z"), messages: []
    });
    expect(prompt).toMatch(/no messages/i);
  });
});
```

- [ ] **Step 13.2: Write the failing render test**

```ts
// tests/unit/digest-render.test.ts
import { describe, it, expect } from "vitest";
import { renderDigest } from "../../src/digest/render.ts";

describe("renderDigest", () => {
  it("wraps LLM output in header + footer", () => {
    const md = renderDigest({
      date: new Date("2026-04-24T09:00:00Z"),
      llmOutput: "- **Thing happened** — https://x.com/foo — why it matters: X",
      itemCount: 3
    });
    expect(md).toMatch(/# 🧠 Daily Digest — 2026-04-24/);
    expect(md).toMatch(/Covering 3 items/);
    expect(md).toMatch(/- \*\*Thing happened\*\*/);
    expect(md).toMatch(/_Generated by GBrain/);
  });

  it("renders an empty-day message when itemCount is 0", () => {
    const md = renderDigest({
      date: new Date("2026-04-24T09:00:00Z"),
      llmOutput: "",
      itemCount: 0
    });
    expect(md).toMatch(/quiet day/i);
  });
});
```

- [ ] **Step 13.3: Run — expect FAIL**

Run: `cd "projects/gbrain/app" && npm test -- digest`

- [ ] **Step 13.4: Implement `src/digest/select.ts`**

```ts
import type { ParsedMessage } from "../types.ts";

export interface DigestItem { author: string; text: string; source: string; timestamp: Date }

export function selectRecent(messages: ParsedMessage[], now: Date, hours = 24, limit = 40): DigestItem[] {
  const cutoff = now.getTime() - hours * 60 * 60 * 1000;
  return messages
    .filter(m => !m.tags.has("skip"))
    .filter(m => m.timestamp.getTime() >= cutoff)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(0, limit)
    .map(m => ({
      author: m.authorHandle,
      text: m.plainText.trim(),
      source: `https://t.me/c/${Math.abs(m.raw.chat.id).toString().replace(/^100/, "")}/${m.raw.message_thread_id ?? ""}/${m.raw.message_id}`,
      timestamp: m.timestamp
    }));
}
```

- [ ] **Step 13.5: Implement `src/digest/prompt.ts`**

```ts
import type { DigestItem } from "./select.ts";

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface PromptInput { date: Date; messages: DigestItem[] }

export function buildDigestPrompt(input: PromptInput): string {
  const { date, messages } = input;
  const day = isoDay(date);

  if (messages.length === 0) {
    return `You are GBrain, a concise daily-news summariser for the Warsaw AI Community.
There are no messages to digest for ${day}.
Respond with a single short line: "No notable News & Signals activity today."`;
  }

  const items = messages.map((m, i) =>
    `${i + 1}. [${m.author}] ${m.text}\n   source: ${m.source}`
  ).join("\n\n");

  return `You are GBrain, the daily-digest summariser for the Warsaw AI Community (Telegram).
Summarise the News & Signals from ${day}. Constraints:
- Output a tight Markdown bullet list.
- For each notable item: a bold headline, a short factual description, a source link, and a one-sentence "why it matters".
- Cluster related items. Skip chatter that isn't news.
- Max 12 bullets. Prefer signal over volume.
- Do not add commentary outside the list.

Source messages:

${items}`;
}
```

- [ ] **Step 13.6: Implement `src/digest/render.ts`**

```ts
function isoDay(d: Date): string { return d.toISOString().slice(0, 10); }

export interface RenderInput { date: Date; llmOutput: string; itemCount: number }

export function renderDigest(input: RenderInput): string {
  const day = isoDay(input.date);
  if (input.itemCount === 0) {
    return `# 🧠 Daily Digest — ${day}

A quiet day in News & Signals — no notable items.

_Generated by GBrain via Vercel AI Gateway._
`;
  }
  return `# 🧠 Daily Digest — ${day}

Covering ${input.itemCount} items from News & Signals in the last 24h.

${input.llmOutput.trim()}

_Generated by GBrain via Vercel AI Gateway. Reply with #skip to exclude a message from future digests._
`;
}
```

- [ ] **Step 13.7: Implement `src/digest/index.ts`**

```ts
import type { ParsedMessage } from "../types.ts";
import { summarise } from "../ai/index.ts";
import { selectRecent } from "./select.ts";
import { buildDigestPrompt } from "./prompt.ts";
import { renderDigest } from "./render.ts";

export interface RunDigestInput { messages: ParsedMessage[]; now: Date; model?: string }

export interface RunDigestResult { markdown: string; itemCount: number; model: string; usage: { inputTokens: number; outputTokens: number } }

export async function runDigest(input: RunDigestInput): Promise<RunDigestResult> {
  const items = selectRecent(input.messages, input.now);
  const model = input.model ?? "google/gemini-2.0-flash";

  if (items.length === 0) {
    return {
      markdown: renderDigest({ date: input.now, llmOutput: "", itemCount: 0 }),
      itemCount: 0, model, usage: { inputTokens: 0, outputTokens: 0 }
    };
  }

  const prompt = buildDigestPrompt({ date: input.now, messages: items });
  const ai = await summarise({ model, prompt, maxOutputTokens: 1500, temperature: 0.3 });
  return {
    markdown: renderDigest({ date: input.now, llmOutput: ai.text, itemCount: items.length }),
    itemCount: items.length, model, usage: ai.usage
  };
}

export { selectRecent } from "./select.ts";
export { buildDigestPrompt } from "./prompt.ts";
export { renderDigest } from "./render.ts";
```

- [ ] **Step 13.8: Run — expect PASS**

Run: `cd "projects/gbrain/app" && npm test -- digest`
Expected: 4 tests pass (2 prompt, 2 render).

- [ ] **Step 13.9: Commit**

```bash
git add projects/gbrain/app/src/digest projects/gbrain/app/tests/unit/digest-prompt.test.ts projects/gbrain/app/tests/unit/digest-render.test.ts
git commit -m "feat(gbrain/digest): prompt + render + select + runDigest orchestrator"
```

---

### Task 14: 48h pending queue (in-memory for v0.1)

**Files:**
- Create: `projects/gbrain/app/src/pending/store.ts`
- Create: `projects/gbrain/app/src/pending/index.ts`
- Create: `projects/gbrain/app/tests/unit/pending.test.ts`

v0.1 ships with an **in-memory** queue — acceptable because Vercel Fluid Compute reuses instances (spec §Fluid Compute) and the 48h window can tolerate brief re-instantiation. Persistent queue (Vercel KV) is Phase 2. A stale-warning comment marks the upgrade path.

- [ ] **Step 14.1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { createInMemoryPendingStore } from "../../src/pending/store.ts";

describe("pending store (in-memory)", () => {
  it("enqueues and lists not-yet-flushable entries", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({ id: "a", messagePath: "community/archive/2026-04/a.md", content: "x", commitMessage: "m", enqueuedAt: now });
    expect(s.listReady(new Date("2026-04-24T10:00:00Z"))).toHaveLength(0);
  });

  it("releases entries once 48h elapses", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({ id: "a", messagePath: "community/archive/2026-04/a.md", content: "x", commitMessage: "m", enqueuedAt: now });
    const ready = s.listReady(new Date("2026-04-26T00:00:01Z"));
    expect(ready.map(e => e.id)).toEqual(["a"]);
  });

  it("cancel(id) removes an entry before flush", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({ id: "a", messagePath: "community/archive/2026-04/a.md", content: "x", commitMessage: "m", enqueuedAt: now });
    s.cancel("a");
    expect(s.listReady(new Date("2026-04-30T00:00:00Z"))).toHaveLength(0);
  });

  it("remove(id) removes after flush so listReady no longer returns it", () => {
    const s = createInMemoryPendingStore();
    const now = new Date("2026-04-24T00:00:00Z");
    s.enqueue({ id: "a", messagePath: "community/archive/2026-04/a.md", content: "x", commitMessage: "m", enqueuedAt: now });
    const later = new Date("2026-04-26T00:00:01Z");
    const ready = s.listReady(later);
    for (const e of ready) s.remove(e.id);
    expect(s.listReady(later)).toHaveLength(0);
  });
});
```

- [ ] **Step 14.2: Run — expect FAIL**

- [ ] **Step 14.3: Implement `src/pending/store.ts`**

```ts
export interface PendingEntry {
  id: string;
  messagePath: string;   // target archive path
  content: string;       // markdown to commit
  commitMessage: string;
  enqueuedAt: Date;
  // NOTE: In-memory store — acceptable for v0.1; migrate to Vercel KV in Phase 2.
}

const RELEASE_MS = 48 * 60 * 60 * 1000;

export interface PendingStore {
  enqueue(entry: PendingEntry): void;
  cancel(id: string): void;
  remove(id: string): void;
  listReady(now: Date): PendingEntry[];
  all(): PendingEntry[];
}

export function createInMemoryPendingStore(): PendingStore {
  const entries = new Map<string, PendingEntry>();
  return {
    enqueue(entry) { entries.set(entry.id, entry); },
    cancel(id) { entries.delete(id); },
    remove(id) { entries.delete(id); },
    listReady(now) {
      return [...entries.values()].filter(e => now.getTime() - e.enqueuedAt.getTime() >= RELEASE_MS);
    },
    all() { return [...entries.values()]; }
  };
}
```

- [ ] **Step 14.4: Implement `src/pending/index.ts`**

```ts
export { createInMemoryPendingStore } from "./store.ts";
export type { PendingStore, PendingEntry } from "./store.ts";
```

- [ ] **Step 14.5: Run — expect PASS**

- [ ] **Step 14.6: Commit**

```bash
git add projects/gbrain/app/src/pending projects/gbrain/app/tests/unit/pending.test.ts
git commit -m "feat(gbrain/pending): in-memory 48h pending queue + 4 tests (Phase 2: migrate to KV)"
```

---

### Task 15: Commands (`/gbrain-forget`, `/gbrain-optout`, `/gbrain-status`, confirm DMs)

**Files:**
- Create: `projects/gbrain/app/src/commands/forget.ts`
- Create: `projects/gbrain/app/src/commands/optout.ts`
- Create: `projects/gbrain/app/src/commands/status.ts`
- Create: `projects/gbrain/app/src/commands/confirm.ts`
- Create: `projects/gbrain/app/src/commands/index.ts`
- Create: `projects/gbrain/app/tests/unit/commands-forget.test.ts`
- Create: `projects/gbrain/app/tests/unit/commands-optout.test.ts`

- [ ] **Step 15.1: Write failing `forget` test**

```ts
// tests/unit/commands-forget.test.ts
import { describe, it, expect, vi } from "vitest";
import { handleForget } from "../../src/commands/forget.ts";

const fakeStore = {
  commit: vi.fn(async () => "sha1"),
  remove: vi.fn(async () => "sha2")
};

describe("handleForget", () => {
  it("parses archive path from a valid archive URL and calls remove()", async () => {
    const res = await handleForget({
      authorId: 99,
      isCoreOrganizer: false,
      messageText: "/gbrain-forget https://github.com/warsaw-ai/community/blob/main/community/archive/2026-04/2026-04-24-guides-hello.md",
      store: fakeStore as never,
      ownerOfPath: async () => 99   // same author = allowed
    });
    expect(res.ok).toBe(true);
    expect(fakeStore.remove).toHaveBeenCalledWith(expect.objectContaining({
      path: "community/archive/2026-04/2026-04-24-guides-hello.md"
    }));
  });

  it("rejects forgetting someone else's content when not a core organizer", async () => {
    const res = await handleForget({
      authorId: 42, isCoreOrganizer: false,
      messageText: "/gbrain-forget community/archive/2026-04/foo.md",
      store: { commit: vi.fn(), remove: vi.fn(async () => "x") } as never,
      ownerOfPath: async () => 99
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/not your content/i);
  });

  it("allows a core organizer to forget any content", async () => {
    const store = { commit: vi.fn(async () => "x"), remove: vi.fn(async () => "y") };
    const res = await handleForget({
      authorId: 1, isCoreOrganizer: true,
      messageText: "/gbrain-forget community/archive/2026-04/foo.md",
      store: store as never,
      ownerOfPath: async () => 99
    });
    expect(res.ok).toBe(true);
    expect(store.remove).toHaveBeenCalled();
  });

  it("returns an error when the message lacks a path", async () => {
    const res = await handleForget({
      authorId: 1, isCoreOrganizer: false,
      messageText: "/gbrain-forget",
      store: fakeStore as never,
      ownerOfPath: async () => 1
    });
    expect(res.ok).toBe(false);
    expect(res.reason).toMatch(/path/i);
  });
});
```

- [ ] **Step 15.2: Write failing `optout` test**

```ts
// tests/unit/commands-optout.test.ts
import { describe, it, expect, vi } from "vitest";
import { handleOptOut, handleOptIn } from "../../src/commands/optout.ts";

describe("handleOptOut / handleOptIn", () => {
  it("opts out when invoked", async () => {
    const prefs = { optOut: vi.fn(async () => {}), optIn: vi.fn(async () => {}), get: vi.fn() };
    const res = await handleOptOut({ authorId: 99, prefs: prefs as never });
    expect(res.ok).toBe(true);
    expect(prefs.optOut).toHaveBeenCalledWith(99);
  });

  it("opts in when invoked", async () => {
    const prefs = { optOut: vi.fn(), optIn: vi.fn(async () => {}), get: vi.fn() };
    const res = await handleOptIn({ authorId: 99, prefs: prefs as never });
    expect(res.ok).toBe(true);
    expect(prefs.optIn).toHaveBeenCalledWith(99);
  });
});
```

- [ ] **Step 15.3: Run — expect FAIL**

- [ ] **Step 15.4: Implement `src/commands/forget.ts`**

```ts
import type { GithubStore } from "../store/index.ts";

export interface ForgetInput {
  authorId: number;
  isCoreOrganizer: boolean;
  messageText: string;
  store: GithubStore;
  ownerOfPath: (path: string) => Promise<number | null>; // returns author_id from frontmatter
}

export interface CommandResult { ok: boolean; reason?: string }

const ARCHIVE_PATH_RE = /community\/archive\/[^\s)]+\.md/;

export async function handleForget(input: ForgetInput): Promise<CommandResult> {
  const match = input.messageText.match(ARCHIVE_PATH_RE);
  if (!match) return { ok: false, reason: "no archive path in message" };
  const path = match[0];

  const ownerId = await input.ownerOfPath(path);
  if (!input.isCoreOrganizer && ownerId !== input.authorId) {
    return { ok: false, reason: "not your content; ask a core organizer" };
  }
  await input.store.remove({ path, message: `forget: ${path} — requested by ${input.authorId}` });
  return { ok: true };
}
```

- [ ] **Step 15.5: Implement `src/commands/optout.ts`**

```ts
import type { PreferencesStore } from "../consent/preferences.ts";

export interface OptInput { authorId: number; prefs: PreferencesStore }
export interface CommandResult { ok: boolean; reason?: string }

export async function handleOptOut(input: OptInput): Promise<CommandResult> {
  await input.prefs.optOut(input.authorId);
  return { ok: true };
}

export async function handleOptIn(input: OptInput): Promise<CommandResult> {
  await input.prefs.optIn(input.authorId);
  return { ok: true };
}
```

- [ ] **Step 15.6: Implement `src/commands/status.ts`**

```ts
import type { PreferencesStore } from "../consent/preferences.ts";

export interface StatusInput { authorId: number; prefs: PreferencesStore }
export interface StatusResult { optedOut: boolean; message: string }

export async function handleStatus(input: StatusInput): Promise<StatusResult> {
  const p = await input.prefs.get(input.authorId);
  const msg = p.optedOut
    ? "You are opted out of GBrain. Nothing you post can be archived. Use /gbrain-optin to reverse."
    : "You are opted in. Messages in formal topics are archive-eligible (48h #skip window). Casual topics require your confirmation per message.";
  return { optedOut: p.optedOut, message: msg };
}
```

- [ ] **Step 15.7: Implement `src/commands/confirm.ts`**

```ts
import type { PendingStore } from "../pending/index.ts";

export interface ConfirmInput {
  decision: "yes" | "no";
  entryId: string;
  pending: PendingStore;
}

export interface CommandResult { ok: boolean; action: "committed-on-flush" | "cancelled" | "unknown" }

export async function handleConfirm(input: ConfirmInput): Promise<CommandResult> {
  if (input.decision === "no") {
    input.pending.cancel(input.entryId);
    return { ok: true, action: "cancelled" };
  }
  // "yes" leaves the entry in place; flush job will commit it.
  const present = input.pending.all().some(e => e.id === input.entryId);
  return present
    ? { ok: true, action: "committed-on-flush" }
    : { ok: false, action: "unknown" };
}
```

- [ ] **Step 15.8: Create `src/commands/index.ts`**

```ts
export { handleForget } from "./forget.ts";
export { handleOptOut, handleOptIn } from "./optout.ts";
export { handleStatus } from "./status.ts";
export { handleConfirm } from "./confirm.ts";
```

- [ ] **Step 15.9: Run — expect PASS**

Run: `cd "projects/gbrain/app" && npm test -- commands`
Expected: 6 tests pass.

- [ ] **Step 15.10: Commit**

```bash
git add projects/gbrain/app/src/commands projects/gbrain/app/tests/unit/commands-forget.test.ts projects/gbrain/app/tests/unit/commands-optout.test.ts
git commit -m "feat(gbrain/commands): forget/optout/optin/status/confirm handlers + 6 tests"
```

---

### Task 16: Telegram webhook route (ingestion pipeline end-to-end)

**Files:**
- Create: `projects/gbrain/app/app/api/telegram/webhook/route.ts`
- Create: `projects/gbrain/app/src/pipeline.ts` (helper that wires the modules)
- Create: `projects/gbrain/app/tests/fixtures/telegram-messages.ts`
- Create: `projects/gbrain/app/tests/integration/webhook-ingest.test.ts`

- [ ] **Step 16.1: Create message parsing helper first**

Create `src/ingest/parse.ts`:

```ts
import type { TelegramMessage, ParsedMessage, TopicClass } from "../types.ts";
import type { TopicInfo } from "../topics.ts";

const TAG_RE = /#(kb|skip|archive|ad)\b/gi;

export interface ParseInput { raw: TelegramMessage; topics: Map<number, TopicInfo> }

export function parseMessage(input: ParseInput): ParsedMessage {
  const tags = new Set<string>();
  const text = input.raw.text ?? "";
  for (const m of text.matchAll(TAG_RE)) tags.add(m[1].toLowerCase());

  const topicId = input.raw.message_thread_id ?? null;
  const topicInfo = topicId !== null ? input.topics.get(topicId) : undefined;
  const topicClass: TopicClass = topicInfo?.class ?? "casual";

  const handle = input.raw.from.username ? input.raw.from.username : `user_${input.raw.from.id}`;

  return {
    raw: input.raw,
    tags,
    topicId: topicInfo ? topicId : null,
    topicClass,
    authorHandle: handle,
    plainText: text,
    timestamp: new Date(input.raw.date * 1000)
  };
}
```

- [ ] **Step 16.2: Create fixtures**

Create `tests/fixtures/telegram-messages.ts`:

```ts
import type { TelegramMessage } from "../../src/types.ts";

export const MSG_NEWS_RAW: TelegramMessage = {
  message_id: 100,
  date: new Date("2026-04-24T08:00:00Z").getTime() / 1000,
  chat: { id: -1001234567890, type: "supergroup" },
  message_thread_id: 6,
  from: { id: 500, username: "alice", first_name: "Alice" },
  text: "DeepSeek V4 Pro just launched https://deepseek.ai/v4 — matches Claude Opus 4.5."
};

export const MSG_QA_WITHOUT_TAG: TelegramMessage = {
  message_id: 101,
  date: new Date("2026-04-24T09:00:00Z").getTime() / 1000,
  chat: { id: -1001234567890, type: "supergroup" },
  message_thread_id: 2,
  from: { id: 501, username: "bob", first_name: "Bob" },
  text: "How do I run Llama 3 on a Mac?"
};

export const MSG_QA_WITH_KB: TelegramMessage = {
  ...MSG_QA_WITHOUT_TAG,
  message_id: 102,
  text: "How do I run Llama 3 on a Mac? Here's my solution: use LM Studio. #kb"
};

export function webhookBody(msg: TelegramMessage) {
  return { update_id: 1, message: msg };
}
```

- [ ] **Step 16.3: Implement the pipeline helper**

Create `src/pipeline.ts`:

```ts
import type { TelegramMessage } from "./types.ts";
import type { BotClient } from "./telegram/client.ts";
import type { GithubStore } from "./store/index.ts";
import type { PreferencesStore } from "./consent/preferences.ts";
import type { PendingStore } from "./pending/index.ts";
import { buildTopicMap } from "./topics.ts";
import { parseMessage } from "./ingest/parse.ts";
import { evaluate } from "./consent/index.ts";
import { toMarkdown } from "./ingest/index.ts";
import { buildSlug } from "./ingest/slug.ts";
import { loadConfig, type Config } from "./config.ts";

export interface PipelineDeps {
  cfg?: Config;
  bot: BotClient;
  store: GithubStore;
  prefs: PreferencesStore;
  pending: PendingStore;
  now?: () => Date;
}

export interface IngestOutcome {
  handled: "allow-committed" | "confirm-dm-sent" | "deferred" | "denied";
  reason: string;
}

export async function ingestOne(raw: TelegramMessage, deps: PipelineDeps): Promise<IngestOutcome> {
  const cfg = deps.cfg ?? loadConfig();
  const now = deps.now?.() ?? new Date();
  const topics = buildTopicMap(cfg);
  const parsed = parseMessage({ raw, topics });

  const prefs = await deps.prefs.get(raw.from.id);
  const decision = evaluate({ message: parsed, prefs, taggerIsAuthor: true, now });

  if (decision.kind === "deny") {
    return { handled: "denied", reason: decision.reason };
  }

  if (decision.kind === "require_confirm") {
    await deps.bot.sendDirectMessage(
      decision.confirmFrom,
      `Your message "${parsed.plainText.slice(0, 80)}…" was flagged for the GBrain archive by another member. Reply /yes or /no (48h timeout = auto-no). Reason: ${decision.reason}`
    );
    return { handled: "confirm-dm-sent", reason: decision.reason };
  }

  const topicName = topics.get(parsed.topicId ?? -1)?.name ?? "Unknown";
  const slug = buildSlug({
    timestamp: parsed.timestamp, topicName, plainText: parsed.plainText, messageId: raw.message_id
  });
  const month = parsed.timestamp.toISOString().slice(0, 7); // "YYYY-MM"
  const path = `community/archive/${month}/${slug}.md`;
  const content = toMarkdown({ message: parsed, topicName, chatIdForLink: cfg.telegram.chatId });
  const commitMessage = `archive: ${topicName} — ${parsed.authorHandle} — ${parsed.timestamp.toISOString()}`;

  if (decision.kind === "allow") {
    await deps.store.commit({ path, content, message: commitMessage });
    await deps.bot.setReaction(cfg.telegram.chatId, raw.message_id, "🧠");
    return { handled: "allow-committed", reason: decision.reason };
  }

  // defer_48h
  deps.pending.enqueue({
    id: `${cfg.telegram.chatId}:${raw.message_id}`,
    messagePath: path, content, commitMessage, enqueuedAt: now
  });
  await deps.bot.setReaction(cfg.telegram.chatId, raw.message_id, "⏳");
  return { handled: "deferred", reason: decision.reason };
}
```

- [ ] **Step 16.4: Write failing integration test**

Create `tests/integration/webhook-ingest.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { MSG_NEWS_RAW, MSG_QA_WITHOUT_TAG, MSG_QA_WITH_KB } from "../fixtures/telegram-messages.ts";
import { ingestOne, type PipelineDeps } from "../../src/pipeline.ts";
import type { Config } from "../../src/config.ts";

const cfg: Config = {
  telegram: { token: "t", webhookSecret: "s", chatId: -1001234567890 },
  ai: { gatewayKey: "g" },
  github: { token: "gh", owner: "w", repo: "c", branch: "main" },
  topics: { generalId: 1, qaId: 2, newsSignalsId: 6 } as never,
  digest: { timezone: "Europe/Warsaw", hourLocal: 9 },
  flags: { killSwitch: false, digestEnabled: true },
  cron: { secret: "cs" }
};

function makeDeps(overrides: Partial<PipelineDeps> = {}): PipelineDeps & {
  _bot: { sendDirectMessage: ReturnType<typeof vi.fn>; setReaction: ReturnType<typeof vi.fn>; sendMessage: ReturnType<typeof vi.fn> };
  _store: { commit: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };
  _pending: { enqueued: unknown[] };
} {
  const _bot = {
    sendDirectMessage: vi.fn(async () => {}),
    setReaction: vi.fn(async () => {}),
    sendMessage: vi.fn(async () => {})
  };
  const _store = { commit: vi.fn(async () => "sha"), remove: vi.fn(async () => "sha") };
  const _pending = { enqueued: [] as unknown[] };
  const pending = {
    enqueue: (e: unknown) => { _pending.enqueued.push(e); },
    cancel: vi.fn(), remove: vi.fn(), listReady: vi.fn(() => []), all: vi.fn(() => [])
  };
  const prefs = {
    get: vi.fn(async (id: number) => ({ authorId: id, optedOut: false, updatedAt: new Date(0) })),
    optIn: vi.fn(), optOut: vi.fn()
  };
  return {
    cfg, bot: _bot as never, store: _store as never, prefs: prefs as never, pending: pending as never,
    now: () => new Date("2026-04-24T10:00:00Z"),
    ...overrides,
    _bot, _store, _pending
  };
}

describe("ingestOne (pipeline integration)", () => {
  it("commits a message posted in a formal topic with #kb", async () => {
    const deps = makeDeps();
    const out = await ingestOne({ ...MSG_NEWS_RAW, text: MSG_NEWS_RAW.text + " #kb" }, deps);
    expect(out.handled).toBe("allow-committed");
    expect(deps._store.commit).toHaveBeenCalledTimes(1);
    const call = deps._store.commit.mock.calls[0][0];
    expect(call.path).toMatch(/^community\/archive\/2026-04\//);
    expect(call.content).toContain("topic: News & Signals");
  });

  it("defers a formal-topic message without tags", async () => {
    const deps = makeDeps();
    const out = await ingestOne(MSG_NEWS_RAW, deps);
    expect(out.handled).toBe("deferred");
    expect(deps._store.commit).not.toHaveBeenCalled();
    expect(deps._pending.enqueued).toHaveLength(1);
  });

  it("denies a casual-topic message without tags", async () => {
    const deps = makeDeps();
    const out = await ingestOne(MSG_QA_WITHOUT_TAG, deps);
    expect(out.handled).toBe("denied");
    expect(deps._store.commit).not.toHaveBeenCalled();
    expect(deps._pending.enqueued).toHaveLength(0);
  });

  it("allows a casual-topic message with #kb (tagger implicit = author)", async () => {
    const deps = makeDeps();
    const out = await ingestOne(MSG_QA_WITH_KB, deps);
    expect(out.handled).toBe("allow-committed");
    expect(deps._store.commit).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 16.5: Run — expect FAIL** (route not wired + modules missing)

Run: `cd "projects/gbrain/app" && npm test -- webhook-ingest`

- [ ] **Step 16.6: Implement the webhook route**

Create `app/api/telegram/webhook/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSecret } from "@/telegram/verify.ts";
import { ingestOne } from "@/pipeline.ts";
import { createBotClient } from "@/telegram/client.ts";
import { createGithubStore } from "@/store/index.ts";
import { createInMemoryPreferences } from "@/consent/preferences.ts";
import { createInMemoryPendingStore } from "@/pending/index.ts";
import { loadConfig } from "@/config.ts";
import { handleForget, handleOptIn, handleOptOut, handleStatus, handleConfirm } from "@/commands/index.ts";

// In-memory singletons (Fluid Compute reuse). Phase 2 replaces these with persistent stores.
const _prefs = createInMemoryPreferences();
const _pending = createInMemoryPendingStore();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const cfg = loadConfig();
  if (cfg.flags.killSwitch) return NextResponse.json({ ok: true, killed: true });

  if (!verifyWebhookSecret(req.headers, cfg.telegram.webhookSecret)) {
    return NextResponse.json({ ok: false, error: "invalid webhook secret" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as { message?: unknown } | null;
  if (!body || typeof body !== "object" || !("message" in body) || !body.message) {
    return NextResponse.json({ ok: true, skipped: "non-message update" });
  }

  const bot = createBotClient(cfg);
  const store = createGithubStore(cfg.github);
  const msg = body.message as import("@/types.ts").TelegramMessage;
  const text = msg.text ?? "";
  const isDM = msg.chat.type === "private";

  if (isDM && text.startsWith("/gbrain-forget")) {
    const r = await handleForget({
      authorId: msg.from.id,
      isCoreOrganizer: false, // TODO once roster is wired; see ADR-0002
      messageText: text, store,
      ownerOfPath: async () => msg.from.id // lax v0.1: caller identity must match any extracted path's author
    });
    await bot.sendDirectMessage(msg.from.id, r.ok ? "Removed." : `Cannot remove: ${r.reason}`);
    return NextResponse.json({ ok: true });
  }

  if (isDM && text.startsWith("/gbrain-optout")) {
    await handleOptOut({ authorId: msg.from.id, prefs: _prefs });
    await bot.sendDirectMessage(msg.from.id, "You are opted out of GBrain archiving.");
    return NextResponse.json({ ok: true });
  }

  if (isDM && text.startsWith("/gbrain-optin")) {
    await handleOptIn({ authorId: msg.from.id, prefs: _prefs });
    await bot.sendDirectMessage(msg.from.id, "You are opted in to GBrain archiving.");
    return NextResponse.json({ ok: true });
  }

  if (isDM && text.startsWith("/gbrain-status")) {
    const s = await handleStatus({ authorId: msg.from.id, prefs: _prefs });
    await bot.sendDirectMessage(msg.from.id, s.message);
    return NextResponse.json({ ok: true });
  }

  if (isDM && (text.trim() === "/yes" || text.trim() === "/no")) {
    // v0.1 limitation: confirmation is matched by author-id alone (most recent pending entry for this author).
    const entries = _pending.all().filter(e => e.id.endsWith(`:${msg.from.id}`) || e.id.includes(`${msg.from.id}`));
    const entry = entries[entries.length - 1];
    if (entry) {
      await handleConfirm({ decision: text.trim() === "/yes" ? "yes" : "no", entryId: entry.id, pending: _pending });
      await bot.sendDirectMessage(msg.from.id, text.trim() === "/yes" ? "Confirmed. Will be archived on next flush." : "Cancelled.");
    }
    return NextResponse.json({ ok: true });
  }

  // Channel / supergroup message → ingestion pipeline
  if (msg.chat.id === cfg.telegram.chatId) {
    const out = await ingestOne(msg, { cfg, bot, store, prefs: _prefs, pending: _pending });
    return NextResponse.json({ ok: true, outcome: out.handled });
  }

  return NextResponse.json({ ok: true, skipped: "not our chat" });
}
```

- [ ] **Step 16.7: Run tests — expect PASS**

Run: `cd "projects/gbrain/app" && npm test -- webhook-ingest`
Expected: 4 integration tests pass.

- [ ] **Step 16.8: Typecheck**

Run: `cd "projects/gbrain/app" && npm run typecheck`
Expected: pass.

- [ ] **Step 16.9: Commit**

```bash
git add projects/gbrain/app/src/ingest/parse.ts projects/gbrain/app/src/pipeline.ts projects/gbrain/app/app/api/telegram/webhook/route.ts projects/gbrain/app/tests/fixtures projects/gbrain/app/tests/integration/webhook-ingest.test.ts
git commit -m "feat(gbrain/webhook): parse+pipeline+route, 4 ingestion integration tests"
```

---

### Task 17: Daily digest cron route

**Files:**
- Create: `projects/gbrain/app/app/api/cron/daily-digest/route.ts`
- Create: `projects/gbrain/app/tests/integration/cron-digest.test.ts`
- Create: `projects/gbrain/app/vercel.ts`

For v0.1 the digest input comes from a transient in-memory message log that the webhook keeps (adding in this task). Phase 2 swaps this to a persistent source. This is intentional — v0.1 ships with constrained but working digest.

- [ ] **Step 17.1: Add in-memory recent-news log**

Create `src/digest/news-log.ts`:

```ts
import type { ParsedMessage } from "../types.ts";

const LOG: ParsedMessage[] = [];
const MAX = 200;

export function recordNews(msg: ParsedMessage): void {
  LOG.push(msg);
  if (LOG.length > MAX) LOG.splice(0, LOG.length - MAX);
}

export function snapshotNews(): ParsedMessage[] {
  return [...LOG];
}

export function clearNews(): void { LOG.length = 0; }
```

- [ ] **Step 17.2: Wire the log into the pipeline (only News & Signals topic)**

Edit `src/pipeline.ts` — inside `ingestOne`, after `parseMessage`, add (before the consent check):

```ts
import { recordNews } from "./digest/news-log.ts";
// ...
// inside ingestOne, right after `const parsed = parseMessage(...)`:
if (parsed.topicId === cfg.topics.newsSignalsId) recordNews(parsed);
```

Follow-up: typecheck passes.

Run: `cd "projects/gbrain/app" && npm run typecheck`
Expected: pass.

- [ ] **Step 17.3: Write failing cron integration test**

Create `tests/integration/cron-digest.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { runDigest } from "../../src/digest/index.ts";
import type { ParsedMessage } from "../../src/types.ts";

vi.mock("ai", () => ({
  generateText: vi.fn(async () => ({
    text: "- **DeepSeek V4 launched** — matches Claude Opus 4.5\n  https://deepseek.ai/v4\n  why it matters: open-source frontier model",
    usage: { inputTokens: 80, outputTokens: 40 }
  }))
}));

const NOW = new Date("2026-04-24T09:00:00Z");

function mkMsg(text: string, hoursAgo: number): ParsedMessage {
  return {
    raw: {
      message_id: 1 + hoursAgo, date: (NOW.getTime() - hoursAgo * 3600 * 1000) / 1000,
      chat: { id: -1001234567890, type: "supergroup" },
      message_thread_id: 6,
      from: { id: 500, username: "alice", first_name: "Alice" },
      text
    },
    tags: new Set(),
    topicId: 6,
    topicClass: "formal",
    authorHandle: "alice",
    plainText: text,
    timestamp: new Date(NOW.getTime() - hoursAgo * 3600 * 1000)
  };
}

describe("runDigest", () => {
  it("renders an empty-day digest when no messages are in the 24h window", async () => {
    const result = await runDigest({ messages: [], now: NOW });
    expect(result.itemCount).toBe(0);
    expect(result.markdown).toMatch(/quiet day/i);
  });

  it("renders a populated digest when messages exist", async () => {
    const result = await runDigest({
      messages: [mkMsg("DeepSeek V4 Pro launched", 2), mkMsg("old news", 48)],
      now: NOW
    });
    expect(result.itemCount).toBe(1); // 48h-old item excluded
    expect(result.markdown).toMatch(/DeepSeek V4/);
    expect(result.markdown).toMatch(/# 🧠 Daily Digest/);
  });
});
```

- [ ] **Step 17.4: Run — expect FAIL** (initially passes for empty-day, fails for populated — ensure LLM mock works)

Run: `cd "projects/gbrain/app" && npm test -- cron-digest`

- [ ] **Step 17.5: (No implementation needed — `runDigest` exists; confirm tests pass)**

Run again — both should pass now.

- [ ] **Step 17.6: Implement cron route**

Create `app/api/cron/daily-digest/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { loadConfig } from "@/config.ts";
import { runDigest } from "@/digest/index.ts";
import { snapshotNews, clearNews } from "@/digest/news-log.ts";
import { createBotClient } from "@/telegram/client.ts";
import { createGithubStore } from "@/store/index.ts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const cfg = loadConfig();

  if (cfg.flags.killSwitch || !cfg.flags.digestEnabled) {
    return NextResponse.json({ ok: true, skipped: "disabled" });
  }

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${cfg.cron.secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const messages = snapshotNews();
  const now = new Date();
  const result = await runDigest({ messages, now });

  const bot = createBotClient(cfg);
  await bot.sendMessage(cfg.telegram.chatId, cfg.topics.newsSignalsId, result.markdown, "Markdown");

  // Archive the digest itself
  const store = createGithubStore(cfg.github);
  const day = now.toISOString().slice(0, 10);
  await store.commit({
    path: `community/archive/digests/${day}.md`,
    content: result.markdown,
    message: `digest: ${day} — ${result.itemCount} items`
  });

  clearNews();

  return NextResponse.json({
    ok: true,
    itemCount: result.itemCount,
    usage: result.usage,
    model: result.model
  });
}
```

- [ ] **Step 17.7: Create `vercel.ts`**

Create `projects/gbrain/app/vercel.ts`:

```ts
// vercel.ts — see https://vercel.com/docs/project-configuration/vercel-ts
import { type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  buildCommand: "npm run build",
  installCommand: "npm install",
  crons: [
    // Run every day at 07:00 UTC (≈ 09:00 Europe/Warsaw during CET, 10:00 during CEST).
    // Vercel Cron runs in UTC; we accept DST drift for v0.1 (acceptable per spec §20 open questions).
    { path: "/api/cron/daily-digest", schedule: "0 7 * * *" }
  ],
  headers: []
};
```

Note: add `"@vercel/config": "^1"` to `package.json` devDependencies and run `npm install` before committing.

- [ ] **Step 17.8: Add `@vercel/config` dep**

Edit `projects/gbrain/app/package.json` — add to `devDependencies`:

```json
"@vercel/config": "^1.0.0"
```

Then:

```bash
cd "projects/gbrain/app" && npm install
```

- [ ] **Step 17.9: Typecheck + test**

Run: `cd "projects/gbrain/app" && npm run typecheck && npm test`
Expected: all tests (unit + integration) pass; typecheck clean.

- [ ] **Step 17.10: Commit**

```bash
git add projects/gbrain/app/src/digest/news-log.ts projects/gbrain/app/src/pipeline.ts projects/gbrain/app/app/api/cron/daily-digest/route.ts projects/gbrain/app/vercel.ts projects/gbrain/app/package.json projects/gbrain/app/package-lock.json projects/gbrain/app/tests/integration/cron-digest.test.ts
git commit -m "feat(gbrain/digest): cron route + vercel.ts (daily at 07:00 UTC) + in-memory news log"
```

---

### Task 18: Archive folder scaffolding + README

**Files:**
- Create: `community/archive/README.md`
- Create: `community/archive/.gitkeep`
- Create: `community/archive/_removed/.gitkeep`
- Create: `community/archive/digests/.gitkeep`

- [ ] **Step 18.1: Create `community/archive/README.md`**

```md
# Archive

GBrain-managed archive of opt-in Telegram content from the Warsaw AI Community.

## Layout

- `YYYY-MM/` — one markdown file per archived message.
- `digests/YYYY-MM-DD.md` — daily digest of News & Signals.
- `_removed/YYYY-MM-DD.md` — removal records (hash-only; content is redacted).

## Consent

See [`../telegram/topics.md`](../telegram/topics.md) and [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).

- Formal topics (Guides, Meetups, Projects & Repos, News & Signals, Tools & Stacks, Builds & Pitches) — pre-consent with a 48h `#skip` window.
- Casual topics (General, Questions & Answers) — require author confirmation via DM.
- Universal `#kb` / `#archive` tag forces ingestion; `#skip` forces exclusion.
- `/gbrain-forget` to remove your own content; core organizers can remove any content.
- `/gbrain-optout` hard-disables archiving of your future messages.

## Integrity

Every file in `YYYY-MM/` was committed by the `gbrain-bot` committer identity, not by a human contributor. Branch protection limits the bot token to this directory (and `digests/`, `_removed/`).

## License

Content is licensed under the repository's MIT license (see [`../../LICENSE`](../../LICENSE)). Individual authors retain personal rights per [`CONTRIBUTING.md`](../../CONTRIBUTING.md).
```

- [ ] **Step 18.2: Add .gitkeep placeholders**

```bash
cd "/Users/antonsafronov/Projects/Warsaw AI Comunity"
touch community/archive/.gitkeep
touch community/archive/_removed/.gitkeep
touch community/archive/digests/.gitkeep
```

- [ ] **Step 18.3: Commit**

```bash
git add community/archive
git commit -m "docs(archive): scaffold community/archive/ with README + placeholders"
```

---

### Task 19: Onboarding doc for members

**Files:**
- Create: `community/telegram/onboarding-gbrain.md`

- [ ] **Step 19.1: Create the onboarding doc**

```md
# GBrain — how it works

Welcome. GBrain is our community's knowledge bot. This page explains what it does, when it does it, and how to control what it remembers about you.

## TL;DR

- GBrain **is** a bot in our Telegram channel that can (a) save useful messages to our repo's archive, and (b) post a daily News & Signals digest.
- GBrain **is not** watching private DMs. It reads messages in our channel; it writes nothing unless consent rules say it can.
- You can opt out at any time, and you can ask for specific messages to be removed.

## What GBrain does

1. **Daily digest** in **News & Signals** — once a day GBrain posts a short summary of the last 24h of News & Signals messages. No digest on quiet days.
2. **Archive of opt-in content** — messages you (or other members) tag `#kb` end up in `community/archive/` in our repo. Frontmatter records author, timestamp, topic, and a source link.
3. **Commands** (DM the bot):
   - `/gbrain-status` — see your current preferences.
   - `/gbrain-optout` — no future message of yours is archived.
   - `/gbrain-optin` — reverse the above.
   - `/gbrain-forget <archive-url-or-path>` — remove your own archived content.

## Consent rules — short version

| Where you post | Default |
|---|---|
| **General** or **Questions & Answers** | Nothing is archived unless **you** post or react with `#kb`. If someone else tags you, GBrain DMs you to confirm. |
| **Guides, Meetups, Projects & Repos, News & Signals, Tools & Stacks, Builds & Pitches** | Pre-consent applies: your message is **archive-eligible after 48h**. Reply `#skip` (or edit the message to add `#skip`) within 48h to exclude it. |
| Any topic | `#kb` or `#archive` tag forces immediate ingestion. `#skip` forces exclusion. |
| Any topic, if opted out | Nothing is archived. |

## Commands walk-through

1. **Start the bot** — DM `@WarsawAIBrainBot` once and send `/start`. This lets the bot DM you later for confirmations.
2. **Check your status** — DM `/gbrain-status`.
3. **Opt out** — DM `/gbrain-optout`.
4. **Remove a specific message** — find the archive URL on GitHub, DM `/gbrain-forget <url>`.

## Where the archive lives

- Repo: [`community/archive/`](../archive/).
- Public, MIT-licensed, version-controlled, auditable.
- Removal = real file deletion + a removal record in [`_removed/`](../archive/_removed/).

## Questions

Ping any core organizer, or post in **Questions & Answers**.
```

- [ ] **Step 19.2: Commit**

```bash
git add community/telegram/onboarding-gbrain.md
git commit -m "docs(community): member-facing GBrain onboarding doc"
```

---

### Task 20: Operations playbook

**Files:**
- Create: `docs/playbooks/gbrain-operations.md`

- [ ] **Step 20.1: Create the playbook**

```md
# GBrain Operations Playbook

Operational runbook for core organizers. Covers: deploying, monitoring, intervening, and recovering.

## Environments

| Env | URL pattern | Purpose |
|---|---|---|
| Production | `https://gbrain.<your-vercel-domain>` | Real Warsaw AI Community channel |
| Preview | per-PR Vercel preview URL | PR validation, never pointed at real channel |
| Local | `http://localhost:3005` | Development |

## Deploy (production)

1. Push to `main`.
2. Vercel auto-builds `projects/gbrain/app/` (root-directory setting).
3. On green deploy:
   - Vercel Cron picks up `vercel.ts` schedule automatically.
   - Telegram webhook stays pointed at production.

## Switching on / off

| Control | How |
|---|---|
| Full kill | Set `GBRAIN_KILL_SWITCH=true` in Vercel env → redeploy not required for env-var reads but recommended. Webhook returns `{ok:true, killed:true}` without processing. |
| Pause digest only | Set `DIGEST_ENABLED=false`. Cron still fires but returns `skipped: disabled`. |
| Revoke Telegram webhook | `curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"` |
| Revoke GitHub PAT | GitHub Settings → Developer settings → Fine-grained tokens → revoke. |

## Common issues

**Issue: bot silent in the channel.**
1. Check Vercel deployments — is production green?
2. Check Telegram webhook status: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`. Look for `last_error_message`.
3. Check Vercel logs for the webhook route.

**Issue: digest missed a day.**
1. Check Vercel Cron history.
2. Check AI Gateway dashboard for usage and errors.
3. Manual trigger: `curl -H "Authorization: Bearer <CRON_SECRET>" "https://<prod-url>/api/cron/daily-digest"`.

**Issue: cost spike.**
1. AI Gateway dashboard shows per-day tokens.
2. If unexpected: `DIGEST_ENABLED=false` immediately.
3. Check for prompt-injection attempt in recent News & Signals messages.
4. Open incident note in `community/archive/_removed/` (or as an ADR if precedent).

**Issue: member requests removal.**
1. DM channel, or direct request.
2. `/gbrain-forget <path>` from their DM — or, as core organizer, run manually:
   ```bash
   # Using the Octokit token or gh CLI equivalent:
   gh api -X DELETE /repos/<owner>/<repo>/contents/<path> \
     -f message="forget: <path> — organizer removal per request" \
     -f sha=<current-sha>
   ```
3. Write a line in `community/archive/_removed/YYYY-MM-DD.md` with date, path-hash, reason.

**Issue: secret leaked.**
1. Follow ADR-0006 rotation runbook.
2. Incident note as ADR.

## Weekly check-list

- [ ] Digest posted every day this week?
- [ ] Any entries in `_removed/`?
- [ ] AI Gateway cost under weekly target?
- [ ] Any errors in Vercel logs for webhook or cron?
- [ ] Pending queue size — is anything stuck?

## Phase 1 shipping gates (from spec §11)

- [ ] ≥ 5 non-organizer members have archived content.
- [ ] ≥ 10 archived items total.
- [ ] ≥ 14 consecutive digest posts.
- [ ] Poll: "is the daily digest useful?" — ≥ 3 positive.
- [ ] Onboarding doc linked from channel welcome.
- [ ] No critical incident in last 7 days.

## Contacts

- Primary: Anton (founder).
- Core organizers: nominated per ADR-0002 — fill in here as they're onboarded.
```

- [ ] **Step 20.2: Update `docs/playbooks/README.md` to reference it**

Edit `docs/playbooks/README.md` — change the "current playbooks" section from `*(none yet — see the "to write" list below)*` to:

```md
## Current playbooks

- [GBrain Operations](gbrain-operations.md) — deploy, monitor, intervene, recover.

## To write
```

Then keep the rest of the "To write" list unchanged (remove the "GBrain operations (post-v1)" line since it now exists).

- [ ] **Step 20.3: Commit**

```bash
git add docs/playbooks/gbrain-operations.md docs/playbooks/README.md
git commit -m "docs(playbooks): GBrain operations runbook"
```

---

### Task 21: Rollout runbook

**Files:**
- Create: `docs/playbooks/gbrain-rollout.md`

- [ ] **Step 21.1: Create rollout runbook**

```md
# GBrain Rollout Runbook

Step-by-step guide for launching GBrain in three phases: staging, soft launch, full launch.

## Pre-launch — week 1–2

### 1. Create the Telegram bot
1. Open @BotFather in Telegram.
2. `/newbot` → name "GBrain" → username `@WarsawAIBrainBot`.
3. Save the bot token **directly to Vercel env vars** (see step 3). **Do not paste it anywhere else.**
4. `/setprivacy` → DISABLE (bot needs to read non-`/command` messages in groups).
5. `/setjoingroups` → ENABLE.

### 2. Set up Vercel project
1. `cd projects/gbrain/app`
2. `npx vercel link` — create new project, name `gbrain`, root directory `projects/gbrain/app`.
3. `npx vercel env add TELEGRAM_BOT_TOKEN production preview development` — paste the token here, once.
4. Repeat for every var in `.env.example` that is not optional. **Use `vercel env add` not files.**
5. `npx vercel --prod` — first production deploy. Note the URL.

### 3. Register Telegram webhook
```bash
# Generate a strong webhook secret
SECRET=$(openssl rand -hex 32)
# Store it as an env var:
npx vercel env add TELEGRAM_WEBHOOK_SECRET production preview development
# (paste $SECRET when prompted)

# Register with Telegram:
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<your-prod-url>/api/telegram/webhook" \
  -d "secret_token=$SECRET" \
  -d "allowed_updates=[\"message\"]"
```

### 4. Stage against a throwaway group
1. Create a private Telegram group with 2–3 trusted people.
2. Add `@WarsawAIBrainBot` as admin with permissions: read messages + send messages.
3. Temporarily override `CHAT_ID` + `TOPIC_NEWS_ID` to the staging group's values.
4. Post test messages; confirm:
   - `#kb` in formal topics → immediate commit.
   - No tags in formal topics → 48h deferred (check pending store via log).
   - `#kb` from another member in casual topic → DM confirmation to author.
   - `/gbrain-status`, `/gbrain-optout` work.
   - Manual cron trigger produces a digest.

## Soft launch — week 3–4

### 5. Point at production channel, organizer-only
1. Update `CHAT_ID` to real `Warsaw AI Community` chat id.
2. Populate all `TOPIC_*_ID` vars using Telegram's `getUpdates` or the "forum topics" API.
3. Announce in Telegram **Announcements** (or pinned General post if Announcements not live):
   > "GBrain (@WarsawAIBrainBot) is joining the channel today. For the next 2 weeks **only core organizers will use the archive tags**; members can already use `/gbrain-status` and `/gbrain-optout` in DM to set preferences. Full consent rules unlock on <date>."
4. Pin the [onboarding doc](../../community/telegram/onboarding-gbrain.md) link.

## Full launch — week 5

1. Post update in Announcements:
   > "GBrain consent rules are now live for everyone. See pinned link for how it works. Questions in **Questions & Answers**."
2. Unrestrict tag handling (no code change needed — was never actually restricted in code; the soft-launch was a social agreement).
3. Start watching the weekly metrics check-list.

## Week 5–8 — observation window

- Daily: check digest posted.
- Weekly: run the check-list in [`gbrain-operations.md`](gbrain-operations.md).
- Tune prompt in `src/digest/prompt.ts` if digest quality is low. Each prompt change = new commit + ADR if the change is significant.
- Collect feedback in Questions & Answers. Consider a pinned "rate today's digest" poll.

## Week 8 — Phase 1 review

Run the shipping gates in [`gbrain-operations.md`](gbrain-operations.md) — if ≥ 80% green, open ADR-00NN to unlock Phase 2. If < 80%, write a retrospective ADR instead and adjust scope.

## Rollback

- **Panic button**: set `GBRAIN_KILL_SWITCH=true`.
- **Targeted**: `DIGEST_ENABLED=false` or delete webhook (`deleteWebhook`).
- **Full rollback**: revert Vercel deployment to previous good state (one click).
- **Data rollback**: `git revert` the offending bot commits; content is gone but a tombstone remains, which is correct.
```

- [ ] **Step 21.2: Commit**

```bash
git add docs/playbooks/gbrain-rollout.md
git commit -m "docs(playbooks): GBrain three-phase rollout runbook"
```

---

### Task 22: End-to-end smoke script (manual verification helper)

**Files:**
- Create: `projects/gbrain/app/scripts/smoke.ts`

This is a one-shot TypeScript smoke-test script for manual use during rollout. Not run in CI.

- [ ] **Step 22.1: Create the script**

```ts
// projects/gbrain/app/scripts/smoke.ts
// Run: tsx scripts/smoke.ts
// Requires: a staging TELEGRAM_BOT_TOKEN and CHAT_ID exported in the local shell.

import { loadConfig } from "../src/config.ts";
import { createBotClient } from "../src/telegram/client.ts";

async function main(): Promise<void> {
  const cfg = loadConfig();
  const bot = createBotClient(cfg);

  console.log("Sending smoke test to chat:", cfg.telegram.chatId);
  await bot.sendMessage(
    cfg.telegram.chatId,
    cfg.topics.newsSignalsId,
    "🧠 GBrain smoke test — " + new Date().toISOString(),
    "Markdown"
  );
  console.log("OK. Check the channel.");
}

main().catch(err => { console.error(err); process.exit(1); });
```

- [ ] **Step 22.2: Add `tsx` dep + `smoke` script**

Edit `projects/gbrain/app/package.json`:

Add to `devDependencies`: `"tsx": "^4.19.0"`
Add to `scripts`: `"smoke": "tsx scripts/smoke.ts"`

Then:

```bash
cd "projects/gbrain/app" && npm install
```

- [ ] **Step 22.3: Commit**

```bash
git add projects/gbrain/app/scripts/smoke.ts projects/gbrain/app/package.json projects/gbrain/app/package-lock.json
git commit -m "chore(gbrain): add manual smoke script"
```

---

### Task 23: Final verification

- [ ] **Step 23.1: Full test sweep + coverage**

Run:
```bash
cd "/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/gbrain/app"
npm run lint
npm run typecheck
npm run test:coverage
```

Expected: lint clean, typecheck clean, all tests pass, coverage ≥ 80% lines/branches/functions/statements.

- [ ] **Step 23.2: Build**

Run:
```bash
npm run build
```

Expected: `.next/` produced, 2 API routes listed (`/api/telegram/webhook` POST, `/api/cron/daily-digest` GET) and `/` (health page). No warnings.

- [ ] **Step 23.3: Check repo is still clean**

Run:
```bash
cd "/Users/antonsafronov/Projects/Warsaw AI Comunity"
git status
```

Expected: working tree clean. All tasks have been committed.

- [ ] **Step 23.4: Update CHANGELOG**

Edit `projects/gbrain/CHANGELOG.md` → promote `[Unreleased]` section to `[0.1.0] - 2026-04-24`:

```md
# Changelog

## [0.1.0] - 2026-04-24
- Scaffold Next.js project at `projects/gbrain/app/`.
- CI pipeline + secret scan workflow.
- Config layer + shared types.
- `consent`, `ingest`, `store`, `telegram`, `digest`, `ai`, `commands`, `pending` modules.
- Telegram webhook + daily digest cron endpoints.
- Soft-launch rollout runbook.

## [Unreleased]
- Phase 2: Q&A with RAG (Neon Postgres + pgvector).
```

- [ ] **Step 23.5: Commit the release marker**

```bash
git add projects/gbrain/CHANGELOG.md
git commit -m "chore(gbrain): mark 0.1.0 — phase 1 feature-complete"
```

- [ ] **Step 23.6: Summary to the user**

Summarise commit count, test count, coverage, and list remaining manual steps (BotFather setup, Vercel link, env var entry, webhook register). Point at `docs/playbooks/gbrain-rollout.md` for the exact commands.

---

## Self-review (performed after writing plan)

**Spec coverage:**
- Spec §1–§5 (problem/goals/non-goals/users/constraints) — contextual, no tasks needed.
- Spec §6 Architecture overview — implemented by Tasks 1, 16, 17.
- Spec §7 Components — implemented by Tasks 3–17.
- Spec §8 Ingestion data flow — Task 16.
- Spec §9 Digest data flow — Task 17.
- Spec §10 Consent machine — Tasks 5 + 6 + partial wiring in Task 16.
- Spec §11 Phase 1 code/infra checklist — Tasks 1–22.
- Spec §11 Operating artifacts — Tasks 19, 20, 21 (onboarding + ops + rollout).
- Spec §12 Phase 2 preview — intentionally out of scope for this plan; a note in Task 14 flags Vercel KV migration.
- Spec §13 Phase 3 — out of scope.
- Spec §14 Repo layout — Task 1 establishes `projects/gbrain/app/`; Task 18 establishes `community/archive/`.
- Spec §15 Secrets — Task 2 (secret-scan CI) + Task 3 (typed config with zod validation) + ADR-0006 already committed.
- Spec §16 Observability — Vercel AI Gateway dashboard (inherited), custom metrics deferred; runbook Task 20 describes how to read them. No v0.1 task beyond wiring.
- Spec §17 Testing strategy — every `src/` module has a unit test; two integration tests (webhook, cron). Coverage gated ≥ 80% via vitest config (Task 1).
- Spec §18 Rollout — Task 21.
- Spec §19 Rollback — Task 20 + Task 21 (runbook covers kill-switch paths).
- Spec §20 Risks — mitigations live in Tasks 2 (secret scan), 3 (kill switch), 5 (consent tests), 11 (path-scoped store), 20 (runbook).
- Spec §21 ADR cross-references — ADRs 0006/0007 already written; Phase 1 doesn't add new ADRs.
- Spec §22 Success criteria — Task 23.1 enforces test+coverage; operator checklist lives in Task 20.

**Placeholder scan:** None found in task steps (searched for TBD/TODO/fill-in).
- ⚠ One intentional `// TODO once roster is wired; see ADR-0002` inside Task 16's webhook route — justified (core-organizer status depends on ADR-0002 roster), flagged for Phase 2. Keeping.

**Type consistency:**
- `ConsentDecision` kinds (`allow`, `require_confirm`, `defer_48h`, `deny`) — used identically across Tasks 5, 16.
- `PendingEntry` fields match across Tasks 14, 16 (`id`, `messagePath`, `content`, `commitMessage`, `enqueuedAt`).
- `ArchiveEntry` defined in Task 4; currently only used for frontmatter shape in Task 8 (`toMarkdown` returns a string, not an `ArchiveEntry` — consistent with spec §7 table).
- `GithubStore.commit` signature: `({ path, content, message }) => Promise<string>` — consistent between Tasks 11, 15, 16, 17.
- Function name consistency: `evaluate` (Task 5), `toMarkdown` (Task 8), `runDigest` (Task 13), `ingestOne` (Task 16), `recordNews`/`snapshotNews`/`clearNews` (Task 17) — no drift found.

**Scope check:** Plan is tight to Phase 1. Phase 2 hooks (pgvector, KV migration, retroactive import) are explicitly deferred with single-line notes in Tasks 14 and pipeline code. The plan does not bleed into Phase 2 work.

**One correction made inline during review:** In Task 16 step 16.6, I initially wrote `new URL("@/...", import.meta.url)` style imports that would have required `vitest.config.ts` alias sync; I used `@/...` imports with the existing `tsconfig.json` path alias and Next's built-in support. Consistent with Task 1's `tsconfig`.

Plan is ready to execute.

---

**Plan complete and saved to `projects/gbrain/plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task (23 tasks), review each before the next, fast iteration, low context-bleed. Each task ends with a commit, so there are 23 surgical commits plus the final release-tag commit.

**2. Inline Execution** — Execute all tasks in this session using `superpowers:executing-plans`, batched with checkpoints at major milestones (after Task 5, Task 11, Task 17, Task 23).

**Which approach?**