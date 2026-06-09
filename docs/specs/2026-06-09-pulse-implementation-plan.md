# Pulse — Reports + Notion PM — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `projects/pulse/` — a standalone ops sub-project that parses repo data into typed structs, generates a monthly review markdown (P1), mirrors four read-only context databases into Notion + snapshots the Notion Tasks board back to git (P2), and automates all of it via a single GitHub Actions workflow (P3).

**Architecture:** git = system of record, Notion = system of engagement; two one-way flows. `lib/sources/*` are pure, Zod-validated, fail-fast parsers (no Notion dependency). `lib/notion/*` performs idempotent upsert via the v5 `data_source_id` API behind a `p-limit` throttle (mirror token, write) and a read-only Tasks export (export token, read). `lib/reports/monthly.ts` derives the review from sources only. `scripts/*` are thin orchestrators wired by `.github/workflows/pulse.yml`.

**Tech Stack:** TypeScript (ESM) · `tsx` · Zod · `@notionhq/client@^5` (API `2025-09-03`) · `p-limit` · `gray-matter` · Vitest (+ `@vitest/coverage-v8`) · ESLint 9 flat config. Node 22. Package manager: pnpm.

**Spec:** `docs/specs/2026-06-09-pulse-reports-notion-design.md` (rev `0c267fe`). **This plan is the build contract; the spec is the design contract. Do not re-brainstorm.**

---

## Planning decisions locked (resolved during plan-writing)

These close the spec's open items (O3) and pin choices the executor must NOT re-derive:

1. **Plan location.** Canonical plan = this file (`docs/specs/`, sibling of the design spec + handoff). Task 1 adds `projects/pulse/plan.md` as a one-line pointer to it (and `projects/pulse/spec.md` pointing to the design spec) to satisfy the `_template` four-file shape without duplicating content.
2. **No `@` path alias.** The repo path contains a space (`Warsaw AI Comunity`), which breaks the vitest `@`-alias (gbrain GOTCHA). Pulse uses **relative imports only**. Repo-root resolution derives from `import.meta.url` via `fileURLToPath`, never `process.cwd()`.
3. **Engagement metric → source (one source per locked metric):**
   - **Contributions** ← `projects/community-platform/lib/__generated__/contributions.json` → `[handle].projectCommits`.
   - **Kudos** ← `projects/community-platform/lib/__generated__/kudos.json` → `[handle]` (currently `{}` → default `0`).
   - **Status streak** ← `community/status/<ISO-week>/*.md` frontmatter (`author`, `week`); trailing run of consecutive ISO weeks per handle.
   - **Events attended** ← `projects/community-platform/lib/__generated__/event-rosters.json` → count of events where handle ∈ `[slug].going.publicSlugs`.
   - **Member universe** ← `community/members/roster.md` rows with a real `@handle` (skip `(TBD)`). `contributions.json.meetingsAttended` is deliberately NOT used (the spec names "events"; rosters are per-member attributable).
4. **Projects DB source.** `portfolio.ts` parses **`PROJECTS.md`** (clean table) — the authoritative per-project source — NOT the non-uniform project `STATE.md` files (community-platform's is a 310-line narrative; gbrain has none).
5. **Decisions DB source.** `decisions.ts` parses the **index table in `docs/decisions/README.md`** (all five fields in clean tabular form, maintained by the adr-writer skill) — satisfies "`docs/decisions/*.md → Adr[]`" with one robust parse instead of N variable-format file parses.
6. **states.ts** parses only the **root `STATE.md`** (uniform: `## Active drivers`, `## Hot now`, `## Blockers`) → drivers/hot-now/blockers for the report narrative.
7. **shipping.ts** tolerates both `—` (community-platform) and `-` (gbrain) heading separators and filters to semver-shaped versions; `git tag` (`<slug>-v<version>`) is the authoritative shipped-set cross-check.
8. **O3 — Notion property types (locked):** every mirrored DB carries an `External ID` (`rich_text`, the idempotency key) and `last_synced_at` (`date`). Per-DB types are in Task 16.
9. **O2 — Weekly digest deferred.** `lib/reports/weekly.ts` is NOT built. P1 ships monthly only.

---

## File structure

```
projects/pulse/
├── package.json                 # T1 — tsx + zod + @notionhq/client@^5 + p-limit + gray-matter
├── tsconfig.json                # T1 — ESM, strict, noUncheckedIndexedAccess
├── vitest.config.ts             # T1 — node env, coverage lib/** ≥80%
├── eslint.config.js             # T1 — flat config (eslint 9 + typescript-eslint)
├── .gitignore                   # T1 — node_modules, coverage
├── README.md STATE.md CHANGELOG.md CLAUDE.md AGENTS.md BACKLOG.md  # T1 — from _template, customized
├── plan.md  spec.md             # T1 — one-line pointers to docs/specs canonical docs
├── SETUP.md                     # T12 — one-time Notion runbook (two integrations)
├── notion-index.json            # T15 — { sourceKey: { pageId, dataSourceId } } (committed; seeded {})
├── snapshots/.gitkeep           # T18 — tasks-snapshot.json lands here (overwritten; git = audit)
├── lib/
│   ├── types.ts                 # T2 — domain Zod schemas + inferred types
│   ├── sources/
│   │   ├── repo-io.ts           # T3 — REPO_ROOT + fs/git io helpers
│   │   ├── iso-week.ts          # T4 — ISO-week parse + adjacency + trailing streak
│   │   ├── portfolio.ts         # T5 — PROJECTS.md → Project[]
│   │   ├── states.ts            # T6 — root STATE.md → RepoState
│   │   ├── decisions.ts         # T7 — docs/decisions/README.md index → Adr[]
│   │   ├── shipping.ts          # T8 — CHANGELOG headings + git tags → Release[]
│   │   └── engagement.ts        # T9 — JSON + status + roster → Engagement[]
│   ├── notion/
│   │   ├── client.ts            # T13 — v5 client + database_id→data_source_id resolution
│   │   ├── throttle.ts          # T14 — p-limit + backoff honoring Retry-After
│   │   ├── index-store.ts       # T15 — read/write notion-index.json
│   │   ├── mappers.ts           # T16 — struct → Notion properties (per DB) + externalId
│   │   ├── upsert.ts            # T17 — query-by-external-id → update|create (mirror token)
│   │   ├── export-tasks.ts      # T18 — read-only Tasks dump → snapshot rows (export token)
│   │   └── digest.ts            # T21 — publish monthly review as a Notion page (mirror token)
│   └── reports/
│       └── monthly.ts           # T10 — data → monthly-review markdown
├── scripts/
│   ├── build-report.ts          # T11 — --period=monthly → docs/playbooks/monthly-review.md
│   ├── publish-digest.ts        # T21 — monthly review → Notion digest page
│   ├── sync-notion.ts           # T19 — mirror the 4 context DBs
│   └── export-tasks.ts          # T20 — nightly Tasks backup snapshot
└── tests/
    ├── fixtures/                # mini PROJECTS.md, STATE.md, CHANGELOG.md, ADR README, JSON, status, events
    ├── unit/                    # one *.test.ts per lib module
    └── integration/             # build-report loader against fixtures

.github/workflows/pulse.yml      # T22 — push mirror + cron digest + nightly snapshot
```

**Conventions for every `lib/sources/*` module:** export a **pure** `parseX(input): X[]` (validated with Zod; throws on shape mismatch — L8) AND an async `loadX(repoRoot): Promise<X[]>` that does the fs reads then calls `parseX`. Unit tests target `parseX` with fixture strings (hermetic, fast); the integration test exercises the loaders against `tests/fixtures/`.

---

# PHASE P1 — Core + monthly review (no Notion dependency)

> Independently shippable. Closes spec §10.1: `pnpm build-report --period=monthly` produces a correct `docs/playbooks/monthly-review.md` from real repo data; parsers Zod-validated; ≥80% coverage on `lib/`; malformed input throws.

## Task 1: Scaffold `projects/pulse/`

**Files:**
- Create: `projects/pulse/package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `.gitignore`
- Create (from `_template`): `README.md`, `STATE.md`, `CHANGELOG.md`, `CLAUDE.md`, `AGENTS.md`, `BACKLOG.md`
- Create (pointers): `projects/pulse/plan.md`, `projects/pulse/spec.md`
- Modify: `PROJECTS.md` (add a portfolio row)

- [ ] **Step 1: Copy the template + create source dirs**

```bash
cp -R projects/_template projects/pulse
mkdir -p projects/pulse/lib/sources projects/pulse/lib/notion projects/pulse/lib/reports \
         projects/pulse/scripts projects/pulse/tests/unit projects/pulse/tests/integration \
         projects/pulse/tests/fixtures projects/pulse/snapshots
touch projects/pulse/snapshots/.gitkeep
```

- [ ] **Step 2: Write `projects/pulse/package.json`**

```json
{
  "name": "@warsaw-ai/pulse",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build-report": "tsx scripts/build-report.ts",
    "publish-digest": "tsx scripts/publish-digest.ts",
    "sync-notion": "tsx scripts/sync-notion.ts",
    "export-tasks": "tsx scripts/export-tasks.ts",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@notionhq/client": "^5.1.0",
    "gray-matter": "^4.0.3",
    "p-limit": "^6.2.0",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/node": "22.10.2",
    "@vitest/coverage-v8": "^2.1.9",
    "eslint": "^9.39.4",
    "tsx": "^4.21.0",
    "typescript": "5.7.2",
    "typescript-eslint": "^8.59.1",
    "vitest": "^2.1.9"
  }
}
```

- [ ] **Step 3: Write `projects/pulse/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["lib/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "tests/fixtures"]
}
```

- [ ] **Step 4: Write `projects/pulse/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["node_modules", "tests/fixtures"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["lib/**/*.ts"],
      exclude: ["**/*.test.ts", "lib/types.ts"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
```

> `lib/types.ts` is excluded from coverage: it is schema declarations only, exercised indirectly by every parser test.

- [ ] **Step 5: Write `projects/pulse/eslint.config.js`**

```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules", "coverage", "tests/fixtures"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
);
```

- [ ] **Step 6: Write `projects/pulse/.gitignore`**

```
node_modules/
coverage/
*.tsbuildinfo
```

- [ ] **Step 7: Customize the template docs**

Replace placeholders in the copied files:
- `projects/pulse/spec.md` → entire contents: `# Pulse — spec\n\nCanonical design spec: [\`docs/specs/2026-06-09-pulse-reports-notion-design.md\`](../../docs/specs/2026-06-09-pulse-reports-notion-design.md).`
- `projects/pulse/plan.md` → entire contents: `# Pulse — plan\n\nCanonical implementation plan: [\`docs/specs/2026-06-09-pulse-implementation-plan.md\`](../../docs/specs/2026-06-09-pulse-implementation-plan.md).`
- `projects/pulse/STATE.md` → set `**Owner / DRI:** Anton`, `**Status:** Building`, `**Branch:** chore/pulse-p1`, "What just happened" = "Scaffolded from _template; P1 in progress."
- `projects/pulse/README.md` → 1 paragraph: what pulse is (per spec §0) + pointer to the design spec.
- `projects/pulse/AGENTS.md` → fill the `<project-name>` → `pulse` and add under Conventions: "Pure parsers in `lib/sources/*` (Zod fail-fast); no Notion dep in P1; relative imports only (no `@` alias — repo path has a space)."

- [ ] **Step 8: Add a row to `PROJECTS.md`**

In the `## Active portfolio` table, append after the Community Platform row:

```markdown
| [Pulse](projects/pulse/README.md) | `projects/pulse/` | **Building** — P1 in flight | Anton | Repo parsers + monthly review (no Notion yet) | P2 (Notion mirror + Tasks export) |
```

- [ ] **Step 9: Install dependencies**

Run (from `projects/pulse/`): `pnpm install`
Expected: resolves + writes `projects/pulse/pnpm-lock.yaml`, exit 0.

- [ ] **Step 10: Verify the toolchain is green on an empty project**

Run (from `projects/pulse/`): `pnpm tsc --noEmit && pnpm vitest run --passWithNoTests`
Expected: `tsc` exits 0; vitest reports "no test files found" and exits 0 (with `--passWithNoTests`).

- [ ] **Step 11: Commit**

```bash
git add projects/pulse PROJECTS.md
git commit -m "feat(pulse): scaffold sub-project (P1 toolchain)"
```

## Task 2: Domain types (`lib/types.ts`)

**Files:**
- Create: `projects/pulse/lib/types.ts`
- Test: `projects/pulse/tests/unit/types.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/types.test.ts
import { describe, it, expect } from "vitest";
import { ProjectSchema, AdrSchema, ReleaseSchema, EngagementSchema, RepoStateSchema } from "../../lib/types.js";

describe("domain schemas", () => {
  it("ProjectSchema accepts a valid project and rejects a bad status", () => {
    const ok = { slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "", currentFocus: "x", nextGate: "y" };
    expect(ProjectSchema.parse(ok).slug).toBe("gbrain");
    expect(() => ProjectSchema.parse({ ...ok, status: "Wat" })).toThrow();
  });

  it("AdrSchema requires a 4-digit id and a date", () => {
    const ok = { id: "0017", adr: "ADR-0017", title: "Yuriy peer co-founder", status: "Accepted", date: "2026-06-09", path: "docs/decisions/0017-x.md" };
    expect(AdrSchema.parse(ok).adr).toBe("ADR-0017");
    expect(() => AdrSchema.parse({ ...ok, date: "nope" })).toThrow();
  });

  it("ReleaseSchema + EngagementSchema + RepoStateSchema parse valid shapes", () => {
    expect(ReleaseSchema.parse({ project: "gbrain", version: "0.1.1", date: "2026-04-26", summary: "x" }).version).toBe("0.1.1");
    expect(EngagementSchema.parse({ handle: "anton1rsod", name: "Anton", contributions: 5, kudos: 0, statusStreak: 2, eventsAttended: 1 }).handle).toBe("anton1rsod");
    expect(RepoStateSchema.parse({ lastUpdated: "2026-06-09", drivers: [], hotNow: [], blockers: [] }).hotNow).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run (from `projects/pulse/`): `pnpm vitest run tests/unit/types.test.ts`
Expected: FAIL — cannot find module `../../lib/types.js`.

- [ ] **Step 3: Write `lib/types.ts`**

```ts
import { z } from "zod";

export const PROJECT_STATUSES = ["Proposed", "In design", "Building", "Live", "Archived"] as const;
export const ADR_STATUSES = ["Proposed", "Accepted", "Superseded", "Deprecated", "Rejected"] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const ProjectSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  status: z.enum(PROJECT_STATUSES),
  dri: z.string().min(1),
  version: z.string(),       // may be "" when none declared
  currentFocus: z.string(),
  nextGate: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const AdrSchema = z.object({
  id: z.string().regex(/^\d{4}$/),
  adr: z.string().regex(/^ADR-\d{4}$/),
  title: z.string().min(1),
  status: z.enum(ADR_STATUSES),
  date: isoDate,
  path: z.string().min(1),
});
export type Adr = z.infer<typeof AdrSchema>;

export const ReleaseSchema = z.object({
  project: z.string().min(1),
  version: z.string().min(1),
  date: isoDate,
  summary: z.string(),
});
export type Release = z.infer<typeof ReleaseSchema>;

export const EngagementSchema = z.object({
  handle: z.string().min(1),
  name: z.string().min(1),
  contributions: z.number().int().nonnegative(),
  kudos: z.number().int().nonnegative(),
  statusStreak: z.number().int().nonnegative(),
  eventsAttended: z.number().int().nonnegative(),
});
export type Engagement = z.infer<typeof EngagementSchema>;

export const DriverSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  detail: z.string(),
});
export type Driver = z.infer<typeof DriverSchema>;

export const RepoStateSchema = z.object({
  lastUpdated: z.string(),
  drivers: z.array(DriverSchema),
  hotNow: z.array(z.string()),
  blockers: z.array(z.string()),
});
export type RepoState = z.infer<typeof RepoStateSchema>;

export interface Member {
  name: string;
  handle: string;
  slug: string; // profile slug, e.g. "anton-safronov" (used to match event rosters)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/types.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/types.ts projects/pulse/tests/unit/types.test.ts
git commit -m "feat(pulse): domain Zod schemas + inferred types"
```

## Task 3: Repo I/O helpers (`lib/sources/repo-io.ts`)

Centralizes filesystem access so the pure parsers stay hermetic. `REPO_ROOT` derives from `import.meta.url` (space-safe; overridable via `PULSE_REPO_ROOT` for tests). **No process spawning** — git tags are handled as an injected input in Task 8.

**Files:**
- Create: `projects/pulse/lib/sources/repo-io.ts`
- Test: `projects/pulse/tests/unit/repo-io.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/repo-io.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readFileOrNull, readJson, listStatusFiles } from "../../lib/sources/repo-io.js";

let root: string;
beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "pulse-io-"));
  await mkdir(path.join(root, "community/status/2026-W18"), { recursive: true });
  await writeFile(path.join(root, "community/status/2026-W18/anton.md"), "x");
  await writeFile(path.join(root, "data.json"), JSON.stringify({ a: 1 }));
});
afterAll(async () => { await rm(root, { recursive: true, force: true }); });

describe("repo-io", () => {
  it("readFileOrNull returns content or null", async () => {
    expect(await readFileOrNull(path.join(root, "missing.md"))).toBeNull();
    expect(await readFileOrNull(path.join(root, "data.json"))).toContain("\"a\"");
  });
  it("readJson parses, throws on missing", async () => {
    expect(await readJson(path.join(root, "data.json"))).toEqual({ a: 1 });
    await expect(readJson(path.join(root, "missing.json"))).rejects.toThrow();
  });
  it("listStatusFiles returns absolute paths under community/status", async () => {
    const files = await listStatusFiles(root);
    expect(files).toHaveLength(1);
    expect(files[0]).toContain("2026-W18");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/repo-io.test.ts`
Expected: FAIL — cannot find module `repo-io.js`.

- [ ] **Step 3: Write `lib/sources/repo-io.ts`**

```ts
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// repo-io.ts lives at projects/pulse/lib/sources → repo root is four levels up.
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = process.env.PULSE_REPO_ROOT ?? path.resolve(HERE, "../../../..");

export async function readFileOrNull(absPath: string): Promise<string | null> {
  try {
    return await readFile(absPath, "utf8");
  } catch (err: unknown) {
    if (err && typeof err === "object" && (err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function readJson(absPath: string): Promise<unknown> {
  const raw = await readFile(absPath, "utf8");
  return JSON.parse(raw) as unknown;
}

/** Absolute paths of every markdown status file under community/status/<week>/. */
export async function listStatusFiles(repoRoot = REPO_ROOT): Promise<string[]> {
  const base = path.join(repoRoot, "community/status");
  let weeks: string[];
  try {
    weeks = await readdir(base);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const week of weeks) {
    const dir = path.join(base, week);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      continue; // skip entries that cannot be read as a directory
    }
    for (const name of entries) {
      if (name.endsWith(".md")) out.push(path.join(dir, name));
    }
  }
  return out.sort();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/repo-io.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/sources/repo-io.ts projects/pulse/tests/unit/repo-io.test.ts
git commit -m "feat(pulse): repo-io helpers (hermetic fs, space-safe root)"
```

## Task 4: ISO-week math (`lib/sources/iso-week.ts`)

Pure week arithmetic for the status-streak metric. Year-boundary-correct via ISO-week→Monday date conversion.

**Files:**
- Create: `projects/pulse/lib/sources/iso-week.ts`
- Test: `projects/pulse/tests/unit/iso-week.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/iso-week.test.ts
import { describe, it, expect } from "vitest";
import { parseIsoWeek, isoWeekMonday, trailingStreak } from "../../lib/sources/iso-week.js";

describe("iso-week", () => {
  it("parseIsoWeek extracts year+week, throws on garbage", () => {
    expect(parseIsoWeek("2026-W18")).toEqual({ year: 2026, week: 18 });
    expect(() => parseIsoWeek("2026-18")).toThrow();
  });

  it("isoWeekMonday returns the Monday (UTC) of the ISO week", () => {
    // 2026-W01 Monday is 2025-12-29 (ISO rule: week containing first Thursday).
    expect(isoWeekMonday(2026, 1).toISOString().slice(0, 10)).toBe("2025-12-29");
    expect(isoWeekMonday(2026, 18).toISOString().slice(0, 10)).toBe("2026-04-27");
  });

  it("trailingStreak counts consecutive weeks ending at the latest", () => {
    expect(trailingStreak(["2026-W16", "2026-W17", "2026-W18"])).toBe(3);
    expect(trailingStreak(["2026-W16", "2026-W18"])).toBe(1); // gap breaks the trailing run
    expect(trailingStreak([])).toBe(0);
  });

  it("trailingStreak spans a year boundary correctly", () => {
    // 2026-W53 (Mon 2026-12-28) → 2027-W01 (Mon 2027-01-04) are 7 days apart.
    expect(trailingStreak(["2026-W53", "2027-W01"])).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/iso-week.test.ts`
Expected: FAIL — cannot find module `iso-week.js`.

- [ ] **Step 3: Write `lib/sources/iso-week.ts`**

```ts
export interface IsoWeek {
  year: number;
  week: number;
}

const WEEK_RE = /^(\d{4})-W(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function parseIsoWeek(value: string): IsoWeek {
  const m = WEEK_RE.exec(value.trim());
  if (!m) throw new Error(`Invalid ISO week: ${value}`);
  return { year: Number(m[1]), week: Number(m[2]) };
}

/** Monday (00:00 UTC) of the given ISO week. ISO rule: week 1 contains the year's first Thursday. */
export function isoWeekMonday(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7; // Mon=1..Sun=7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Dow + 1);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return monday;
}

function mondayOf(week: string): number {
  const { year, week: w } = parseIsoWeek(week);
  return isoWeekMonday(year, w).getTime();
}

/**
 * Length of the run of consecutive ISO weeks ending at the most recent week present.
 * Deterministic from the data alone (no "now"): streak = trailing consecutive count.
 */
export function trailingStreak(weeks: readonly string[]): number {
  if (weeks.length === 0) return 0;
  const sorted = [...new Set(weeks)].map(mondayOf).sort((a, b) => a - b);
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const cur = sorted[i] as number;
    const prev = sorted[i - 1] as number;
    if (Math.round((cur - prev) / DAY_MS) === 7) streak++;
    else break;
  }
  return streak;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/iso-week.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/sources/iso-week.ts projects/pulse/tests/unit/iso-week.test.ts
git commit -m "feat(pulse): ISO-week math for status streak"
```

## Task 5: Portfolio parser (`lib/sources/portfolio.ts`)

Parses the `## Active portfolio` table in `PROJECTS.md` → `Project[]`. Authoritative source for the Notion **Projects** DB.

**Files:**
- Create: `projects/pulse/lib/sources/portfolio.ts`
- Create: `projects/pulse/tests/fixtures/PROJECTS.sample.md`
- Test: `projects/pulse/tests/unit/portfolio.test.ts`

- [ ] **Step 1: Write the fixture**

```markdown
<!-- tests/fixtures/PROJECTS.sample.md -->
# Projects

## Active portfolio

| Project | Path | Status | Lead | Current focus | Next gate |
|---|---|---|---|---|---|
| [GBrain](projects/gbrain/README.md) | `projects/gbrain/` | **Building** — v0.1.2 in flight | Anton | E3 finalization | v0.2.0 soft launch |
| [Community Platform](projects/community-platform/README.md) | `projects/community-platform/` | **Live** — v0.10.0.1 | Anton | Engagement bootstrap | v0.11 |

## Status vocabulary

(unrelated table that must be ignored)
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/portfolio.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parsePortfolio } from "../../lib/sources/portfolio.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/PROJECTS.sample.md"), "utf8");

describe("parsePortfolio", () => {
  it("parses each active-portfolio row into a typed Project", () => {
    const projects = parsePortfolio(fixture);
    expect(projects).toHaveLength(2);
    expect(projects[0]).toEqual({
      slug: "gbrain",
      name: "GBrain",
      path: "projects/gbrain/",
      status: "Building",
      dri: "Anton",
      version: "v0.1.2",
      currentFocus: "E3 finalization",
      nextGate: "v0.2.0 soft launch",
    });
    expect(projects[1].slug).toBe("community-platform");
    expect(projects[1].version).toBe("v0.10.0.1");
  });

  it("tolerates a parenthetical status like **Live (v1)**", () => {
    const withParen = fixture.replace("**Live** — v0.10.0.1", "**Live (v1)** — v0.10.0.1");
    expect(parsePortfolio(withParen)[1]!.status).toBe("Live");
  });

  it("throws when a row has no recognized status (fail-fast, L8)", () => {
    const bad = fixture.replace("**Building** — v0.1.2 in flight", "in progress");
    expect(() => parsePortfolio(bad)).toThrow(/status/i);
  });

  it("throws when the Active portfolio section is missing", () => {
    expect(() => parsePortfolio("# Projects\n\nno table here")).toThrow(/Active portfolio/i);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/portfolio.test.ts`
Expected: FAIL — cannot find module `portfolio.js`.

- [ ] **Step 4: Write `lib/sources/portfolio.ts`**

```ts
import { ProjectSchema, PROJECT_STATUSES, type Project } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";
import path from "node:path";

/** Lines of the markdown section that starts at `## <heading>` until the next `## `. */
function sectionLines(content: string, heading: string): string[] | null {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return end === -1 ? rest : rest.slice(0, end);
}

/** Split a markdown table row `| a | b |` into trimmed cells. */
function cells(row: string): string[] {
  return row.split("|").slice(1, -1).map((c) => c.trim());
}

function statusOf(cell: string): Project["status"] {
  // Match the status word right after `**`, tolerating a parenthetical like "**Live (v1)**".
  const found = PROJECT_STATUSES.find((s) => new RegExp(`\\*\\*\\s*${s}\\b`).test(cell));
  if (!found) throw new Error(`No recognized status in cell: ${cell}`);
  return found;
}

export function parsePortfolio(content: string): Project[] {
  const section = sectionLines(content, "Active portfolio");
  if (!section) throw new Error("PROJECTS.md: missing '## Active portfolio' section");

  const rows = section.filter((l) => l.trim().startsWith("|"));
  const dataRows = rows.filter((l) => !/^\|\s*Project\s*\|/.test(l) && !/^\|\s*-{2,}/.test(l) && !/\|\s*---/.test(l));

  const projects = dataRows.map((row) => {
    const c = cells(row);
    if (c.length < 6) throw new Error(`PROJECTS.md row has <6 cells: ${row}`);
    const name = /\[([^\]]+)\]/.exec(c[0] ?? "")?.[1];
    if (!name) throw new Error(`PROJECTS.md: cannot parse project name from: ${c[0]}`);
    const cleanPath = (c[1] ?? "").replace(/`/g, "").trim();
    const slug = cleanPath.replace(/\/$/, "").split("/").filter(Boolean).pop() ?? "";
    const version = /\bv\d+\.\d+[\w.]*/.exec(c[2] ?? "")?.[0] ?? "";
    return ProjectSchema.parse({
      slug,
      name,
      path: cleanPath,
      status: statusOf(c[2] ?? ""),
      dri: c[3] ?? "",
      version,
      currentFocus: c[4] ?? "",
      nextGate: c[5] ?? "",
    });
  });

  if (projects.length === 0) throw new Error("PROJECTS.md: Active portfolio table has no data rows");
  return projects;
}

export async function loadPortfolio(repoRoot = REPO_ROOT): Promise<Project[]> {
  const content = await readFileOrNull(path.join(repoRoot, "PROJECTS.md"));
  if (content === null) throw new Error("PROJECTS.md not found");
  return parsePortfolio(content);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/portfolio.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add projects/pulse/lib/sources/portfolio.ts projects/pulse/tests/unit/portfolio.test.ts projects/pulse/tests/fixtures/PROJECTS.sample.md
git commit -m "feat(pulse): PROJECTS.md → Project[] parser"
```

## Task 6: Root-state parser (`lib/sources/states.ts`)

Parses the **root** `STATE.md` (`## Active drivers` / `## Hot now` / `## Blockers`) → `RepoState`. Feeds the monthly review narrative.

**Files:**
- Create: `projects/pulse/lib/sources/states.ts`
- Create: `projects/pulse/tests/fixtures/STATE.sample.md`
- Test: `projects/pulse/tests/unit/states.test.ts`

- [ ] **Step 1: Write the fixture**

```markdown
<!-- tests/fixtures/STATE.sample.md -->
# STATE — Warsaw AI Community

**Last updated:** 2026-06-09

## Active drivers
- **Anton (DRI):** gbrain · community-platform · `pulse`.
- **Yuriy (peer co-founder):** community ops — onboarding.

## Hot now
- **`pulse` spec APPROVED** — writing-plans next.
- Repo operating foundation SHIPPED 2026-06-09.

## Blockers
- None.

## Latest handoff
- docs/specs/...handoff.md
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/states.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseRootState } from "../../lib/sources/states.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/STATE.sample.md"), "utf8");

describe("parseRootState", () => {
  it("extracts lastUpdated, drivers, hotNow, and normalizes 'None.' blockers to []", () => {
    const s = parseRootState(fixture);
    expect(s.lastUpdated).toBe("2026-06-09");
    expect(s.drivers).toEqual([
      { name: "Anton", role: "DRI", detail: "gbrain · community-platform · `pulse`." },
      { name: "Yuriy", role: "peer co-founder", detail: "community ops — onboarding." },
    ]);
    expect(s.hotNow).toHaveLength(2);
    expect(s.hotNow[0]).toContain("spec APPROVED");
    expect(s.blockers).toEqual([]);
  });

  it("keeps real blockers", () => {
    const s = parseRootState(fixture.replace("- None.", "- Waiting on Notion setup."));
    expect(s.blockers).toEqual(["Waiting on Notion setup."]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/states.test.ts`
Expected: FAIL — cannot find module `states.js`.

- [ ] **Step 4: Write `lib/sources/states.ts`**

```ts
import { RepoStateSchema, type Driver, type RepoState } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";
import path from "node:path";

function sectionLines(content: string, heading: string): string[] {
  const lines = content.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith("## "));
  return end === -1 ? rest : rest.slice(0, end);
}

function bullets(lines: string[]): string[] {
  return lines.map((l) => l.trim()).filter((l) => l.startsWith("- ")).map((l) => l.slice(2).trim());
}

const DRIVER_RE = /^\*\*(.+?) \((.+?)\):\*\*\s*(.*)$/;

export function parseRootState(content: string): RepoState {
  const lastUpdated = /\*\*Last updated:\*\*\s*(\S+)/.exec(content)?.[1] ?? "";

  const drivers: Driver[] = bullets(sectionLines(content, "Active drivers")).flatMap((b) => {
    const m = DRIVER_RE.exec(b);
    return m ? [{ name: m[1] as string, role: m[2] as string, detail: (m[3] ?? "").trim() }] : [];
  });

  const hotNow = bullets(sectionLines(content, "Hot now"));

  const rawBlockers = bullets(sectionLines(content, "Blockers"));
  const blockers = rawBlockers.length === 1 && /^none\.?$/i.test(rawBlockers[0] ?? "") ? [] : rawBlockers;

  return RepoStateSchema.parse({ lastUpdated, drivers, hotNow, blockers });
}

export async function loadRootState(repoRoot = REPO_ROOT): Promise<RepoState> {
  const content = await readFileOrNull(path.join(repoRoot, "STATE.md"));
  if (content === null) throw new Error("root STATE.md not found");
  return parseRootState(content);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/states.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add projects/pulse/lib/sources/states.ts projects/pulse/tests/unit/states.test.ts projects/pulse/tests/fixtures/STATE.sample.md
git commit -m "feat(pulse): root STATE.md → RepoState parser"
```

## Task 7: Decisions parser (`lib/sources/decisions.ts`)

Parses the `## Index` table in `docs/decisions/README.md` → `Adr[]`. One robust parse over the maintained index (decision #5).

**Files:**
- Create: `projects/pulse/lib/sources/decisions.ts`
- Create: `projects/pulse/tests/fixtures/decisions-README.sample.md`
- Test: `projects/pulse/tests/unit/decisions.test.ts`

- [ ] **Step 1: Write the fixture**

```markdown
<!-- tests/fixtures/decisions-README.sample.md -->
# ADRs

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-oss-first-licensing.md) | OSS-first licensing | Accepted | 2026-04-24 |
| [0016](0016-telegram-echo-statuses.md) | Telegram echo for statuses | Proposed | 2026-05-28 |
| [0017](0017-yuriy-peer-co-founder.md) | Yuriy as peer co-founder | Accepted | 2026-06-09 |
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/decisions.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseDecisions } from "../../lib/sources/decisions.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/decisions-README.sample.md"), "utf8");

describe("parseDecisions", () => {
  it("parses each index row into a typed Adr", () => {
    const adrs = parseDecisions(fixture);
    expect(adrs).toHaveLength(3);
    expect(adrs[0]).toEqual({
      id: "0001",
      adr: "ADR-0001",
      title: "OSS-first licensing",
      status: "Accepted",
      date: "2026-04-24",
      path: "docs/decisions/0001-oss-first-licensing.md",
    });
    expect(adrs[1].status).toBe("Proposed");
  });

  it("throws on an unrecognized status (fail-fast)", () => {
    const bad = fixture.replace("| Accepted | 2026-04-24 |", "| Maybe | 2026-04-24 |");
    expect(() => parseDecisions(bad)).toThrow();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/decisions.test.ts`
Expected: FAIL — cannot find module `decisions.js`.

- [ ] **Step 4: Write `lib/sources/decisions.ts`**

```ts
import { AdrSchema, type Adr } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";
import path from "node:path";

function cells(row: string): string[] {
  return row.split("|").slice(1, -1).map((c) => c.trim());
}

export function parseDecisions(readmeContent: string): Adr[] {
  const rows = readmeContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^\|\s*\[\d{4}\]/.test(l)); // only rows whose first cell is a [NNNN](...) link

  const adrs = rows.map((row) => {
    const c = cells(row);
    const idCell = c[0] ?? "";
    const id = /\[(\d{4})\]/.exec(idCell)?.[1];
    const file = /\(([^)]+\.md)\)/.exec(idCell)?.[1];
    if (!id || !file) throw new Error(`docs/decisions/README.md: bad index row: ${row}`);
    return AdrSchema.parse({
      id,
      adr: `ADR-${id}`,
      title: c[1] ?? "",
      status: c[2] ?? "",
      date: c[3] ?? "",
      path: `docs/decisions/${file}`,
    });
  });

  if (adrs.length === 0) throw new Error("docs/decisions/README.md: no ADR index rows found");
  return adrs;
}

export async function loadDecisions(repoRoot = REPO_ROOT): Promise<Adr[]> {
  const content = await readFileOrNull(path.join(repoRoot, "docs/decisions/README.md"));
  if (content === null) throw new Error("docs/decisions/README.md not found");
  return parseDecisions(content);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/decisions.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add projects/pulse/lib/sources/decisions.ts projects/pulse/tests/unit/decisions.test.ts projects/pulse/tests/fixtures/decisions-README.sample.md
git commit -m "feat(pulse): docs/decisions index → Adr[] parser"
```

## Task 8: Shipping parser (`lib/sources/shipping.ts`)

Parses each `projects/*/CHANGELOG.md` → `Release[]`. Tolerates both `—` and `-` heading separators; filters to semver-shaped versions. `parseTagSet` is a pure helper the workflow can feed (`git tag` output) as an authoritative shipped-set cross-check — `lib/` never spawns a process.

**Files:**
- Create: `projects/pulse/lib/sources/shipping.ts`
- Create: `projects/pulse/tests/fixtures/CHANGELOG.sample.md`
- Test: `projects/pulse/tests/unit/shipping.test.ts`

- [ ] **Step 1: Write the fixture**

```markdown
<!-- tests/fixtures/CHANGELOG.sample.md -->
# Changelog

## Versioning policy (placeholder)

| Version | Meaning |
|---|---|
| 0.1.0 | first |

## [Unreleased] — 2026-06-01 — wip

## [0.10.0.1] — 2026-05-31 (chat-52 followup — serialization hotfix; H122)

### Fixed
- something

## [0.1.1] - 2026-04-26 — rehearsal complete + Gemini direct

### Changed
- something
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/shipping.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseChangelog, parseTagSet } from "../../lib/sources/shipping.js";

const fixture = readFileSync(path.join(__dirname, "../fixtures/CHANGELOG.sample.md"), "utf8");

describe("parseChangelog", () => {
  it("extracts only semver releases, both dash styles, with clean summaries", () => {
    const releases = parseChangelog(fixture, "demo");
    expect(releases).toHaveLength(2); // Unreleased + Versioning policy excluded
    expect(releases[0]).toEqual({
      project: "demo",
      version: "0.10.0.1",
      date: "2026-05-31",
      summary: "chat-52 followup — serialization hotfix; H122",
    });
    expect(releases[1]).toEqual({
      project: "demo",
      version: "0.1.1",
      date: "2026-04-26",
      summary: "rehearsal complete + Gemini direct",
    });
  });
});

describe("parseTagSet", () => {
  it("maps `<slug>-v<version>` tag lines into a project@version set", () => {
    const set = parseTagSet(["community-platform-v0.10.0.1", "gbrain-v0.1.1", "not-a-tag"]);
    expect(set.has("community-platform@0.10.0.1")).toBe(true);
    expect(set.has("gbrain@0.1.1")).toBe(true);
    expect(set.size).toBe(2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/shipping.test.ts`
Expected: FAIL — cannot find module `shipping.js`.

- [ ] **Step 4: Write `lib/sources/shipping.ts`**

```ts
import { readdir } from "node:fs/promises";
import path from "node:path";
import { ReleaseSchema, type Release } from "../types.js";
import { readFileOrNull, REPO_ROOT } from "./repo-io.js";

// "## [<version>] <sep> <YYYY-MM-DD><rest>" where <sep> is em-dash or hyphen.
const HEADING_RE = /^##\s*\[([^\]]+)\]\s*[—-]\s*(\d{4}-\d{2}-\d{2})(.*)$/;
const SEMVER_RE = /^\d+\.\d+/;

function cleanSummary(rest: string): string {
  return rest.replace(/^[\s—\-(]+/, "").replace(/[)\s]+$/, "").trim();
}

export function parseChangelog(content: string, projectSlug: string): Release[] {
  const out: Release[] = [];
  for (const line of content.split("\n")) {
    const m = HEADING_RE.exec(line.trim());
    if (!m) continue;
    const version = (m[1] ?? "").trim();
    if (!SEMVER_RE.test(version)) continue; // skips [Unreleased] etc.
    out.push(
      ReleaseSchema.parse({
        project: projectSlug,
        version,
        date: m[2] ?? "",
        summary: cleanSummary(m[3] ?? ""),
      }),
    );
  }
  return out;
}

/** `<slug>-v<version>` tag lines → Set of "<slug>@<version>". */
export function parseTagSet(tagLines: readonly string[]): Set<string> {
  const set = new Set<string>();
  for (const line of tagLines) {
    const m = /^(.+)-v(\d+\.\d+[\w.]*)$/.exec(line.trim());
    if (m) set.add(`${m[1]}@${m[2]}`);
  }
  return set;
}

export async function loadReleases(repoRoot = REPO_ROOT): Promise<Release[]> {
  const projectsDir = path.join(repoRoot, "projects");
  let dirs: string[];
  try {
    dirs = await readdir(projectsDir);
  } catch {
    return [];
  }
  const out: Release[] = [];
  for (const slug of dirs) {
    if (slug.startsWith("_") || slug.startsWith(".")) continue;
    const content = await readFileOrNull(path.join(projectsDir, slug, "CHANGELOG.md"));
    if (content) out.push(...parseChangelog(content, slug));
  }
  return out;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/shipping.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add projects/pulse/lib/sources/shipping.ts projects/pulse/tests/unit/shipping.test.ts projects/pulse/tests/fixtures/CHANGELOG.sample.md
git commit -m "feat(pulse): CHANGELOG → Release[] parser + git-tag set helper"
```

## Task 9: Engagement parser (`lib/sources/engagement.ts`)

Combines the committed community-platform aggregates + `community/status/` + `roster.md` → `Engagement[]`, one row per opt-in member. Each locked metric has exactly one source (planning decision #3). Zod-validates each JSON input at the boundary (L8).

**Files:**
- Create: `projects/pulse/lib/sources/engagement.ts`
- Create fixtures: `tests/fixtures/contributions.sample.json`, `tests/fixtures/kudos.sample.json`, `tests/fixtures/event-rosters.sample.json`, `tests/fixtures/roster.sample.md`
- Test: `projects/pulse/tests/unit/engagement.test.ts`

- [ ] **Step 1: Write the fixtures**

```json
// tests/fixtures/contributions.sample.json
{ "anton1rsod": { "projectCommits": 385, "adrsFiled": 16, "meetingsAttended": 0, "statusPosts": 1 },
  "markspas": { "projectCommits": 0, "adrsFiled": 0, "meetingsAttended": 0, "statusPosts": 0 } }
```

```json
// tests/fixtures/kudos.sample.json
{ "anton1rsod": 3 }
```

```json
// tests/fixtures/event-rosters.sample.json
{ "2026-05-21-meetup-4": { "going": { "publicSlugs": ["anton-safronov"], "hiddenCount": 1 },
  "interested": { "publicSlugs": [], "hiddenCount": 0 } } }
```

```markdown
<!-- tests/fixtures/roster.sample.md -->
# Member Roster

## Core organizers

| Name | GitHub | Role | Telegram | Focus |
|---|---|---|---|---|
| Anton Safronov | @anton1rsod | Founder | @antonsafronov (TBD) | Direction |
| Yuriy | *(TBD)* | Co-founder | *(TBD)* | Ops |

## Members (opt-in)

| Name | GitHub | Telegram | Link | Focus |
|---|---|---|---|---|
| Mark Spasonov | @markspas |  | https://x | RevOps |
```

- [ ] **Step 2: Write the failing test**

```ts
// tests/unit/engagement.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  parseRoster,
  ContributionsFileSchema,
  KudosFileSchema,
  EventRostersFileSchema,
  buildEngagement,
} from "../../lib/sources/engagement.js";

const fx = (f: string) => readFileSync(path.join(__dirname, "../fixtures", f), "utf8");

describe("parseRoster", () => {
  it("returns members with a real handle + derived slug, skipping (TBD) rows", () => {
    const members = parseRoster(fx("roster.sample.md"));
    expect(members).toEqual([
      { name: "Anton Safronov", handle: "anton1rsod", slug: "anton-safronov" },
      { name: "Mark Spasonov", handle: "markspas", slug: "mark-spasonov" },
    ]);
  });
});

describe("buildEngagement", () => {
  it("computes the four locked metrics per member", () => {
    const members = parseRoster(fx("roster.sample.md"));
    const contributions = ContributionsFileSchema.parse(JSON.parse(fx("contributions.sample.json")));
    const kudos = KudosFileSchema.parse(JSON.parse(fx("kudos.sample.json")));
    const eventRosters = EventRostersFileSchema.parse(JSON.parse(fx("event-rosters.sample.json")));
    const statusWeeksByHandle = { anton1rsod: ["2026-W17", "2026-W18"] };

    const rows = buildEngagement({ members, contributions, kudos, eventRosters, statusWeeksByHandle });
    expect(rows[0]).toEqual({
      handle: "anton1rsod", name: "Anton Safronov",
      contributions: 385, kudos: 3, statusStreak: 2, eventsAttended: 1,
    });
    expect(rows[1]).toEqual({
      handle: "markspas", name: "Mark Spasonov",
      contributions: 0, kudos: 0, statusStreak: 0, eventsAttended: 0,
    });
  });

  it("ContributionsFileSchema rejects a malformed row (fail-fast)", () => {
    expect(() => ContributionsFileSchema.parse({ x: { projectCommits: "nope" } })).toThrow();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/engagement.test.ts`
Expected: FAIL — cannot find module `engagement.js`.

- [ ] **Step 4: Write `lib/sources/engagement.ts`**

```ts
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { EngagementSchema, type Engagement, type Member } from "../types.js";
import { readFileOrNull, readJson, listStatusFiles, REPO_ROOT } from "./repo-io.js";
import { trailingStreak } from "./iso-week.js";

export const ContributionsFileSchema = z.record(
  z.string(),
  z.object({
    projectCommits: z.number(),
    adrsFiled: z.number(),
    meetingsAttended: z.number(),
    statusPosts: z.number(),
  }),
);
export type ContributionsFile = z.infer<typeof ContributionsFileSchema>;

export const KudosFileSchema = z.record(z.string(), z.number());
export type KudosFile = z.infer<typeof KudosFileSchema>;

const RosterSideSchema = z.object({ publicSlugs: z.array(z.string()), hiddenCount: z.number() });
export const EventRostersFileSchema = z.record(
  z.string(),
  z.object({ going: RosterSideSchema, interested: RosterSideSchema }),
);
export type EventRostersFile = z.infer<typeof EventRostersFileSchema>;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cells(row: string): string[] {
  return row.split("|").slice(1, -1).map((c) => c.trim());
}

/** Members with a real GitHub handle (column 1). Skips (TBD)/empty rows. */
export function parseRoster(content: string): Member[] {
  const members: Member[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|")) continue;
    if (/GitHub/i.test(line) || /^\|\s*-{2,}/.test(line) || /\|\s*---/.test(line)) continue;
    const c = cells(line);
    if (c.length < 2) continue;
    const handle = /@([A-Za-z0-9_-]+)/.exec(c[1] ?? "")?.[1];
    if (!handle) continue; // (TBD) or empty GitHub cell
    const name = (c[0] ?? "").replace(/[*_]/g, "").replace(/\([^)]*\)/g, "").trim();
    if (!name) continue;
    members.push({ name, handle, slug: slugify(name) });
  }
  return members;
}

export interface EngagementInputs {
  members: readonly Member[];
  contributions: ContributionsFile;
  kudos: KudosFile;
  eventRosters: EventRostersFile;
  statusWeeksByHandle: Record<string, string[]>;
}

export function buildEngagement(inputs: EngagementInputs): Engagement[] {
  const { members, contributions, kudos, eventRosters, statusWeeksByHandle } = inputs;
  return members.map((m) => {
    const eventsAttended = Object.values(eventRosters).filter((ev) => {
      // publicSlugs may key by profile slug or handle depending on platform version; match either.
      const going = ev.going.publicSlugs;
      return going.includes(m.slug) || going.includes(m.handle);
    }).length;

    return EngagementSchema.parse({
      handle: m.handle,
      name: m.name,
      contributions: contributions[m.handle]?.projectCommits ?? 0,
      kudos: kudos[m.handle] ?? 0,
      statusStreak: trailingStreak(statusWeeksByHandle[m.handle] ?? []),
      eventsAttended,
    });
  });
}

/** Group status weeks by frontmatter author (handle), across community/status/<week>/*.md. */
async function statusWeeksByHandle(repoRoot: string): Promise<Record<string, string[]>> {
  const files = await listStatusFiles(repoRoot);
  const acc: Record<string, string[]> = {};
  for (const file of files) {
    const content = await readFileOrNull(file);
    if (!content) continue;
    const fm = matter(content).data as { author?: unknown; week?: unknown };
    if (typeof fm.author === "string" && typeof fm.week === "string") {
      (acc[fm.author] ??= []).push(fm.week);
    }
  }
  return acc;
}

export async function loadEngagement(repoRoot = REPO_ROOT): Promise<Engagement[]> {
  const gen = path.join(repoRoot, "projects/community-platform/lib/__generated__");
  const rosterContent = await readFileOrNull(path.join(repoRoot, "community/members/roster.md"));
  if (rosterContent === null) throw new Error("community/members/roster.md not found");

  const contributions = ContributionsFileSchema.parse(await readJson(path.join(gen, "contributions.json")));
  const kudos = KudosFileSchema.parse(await readJson(path.join(gen, "kudos.json")));
  const eventRosters = EventRostersFileSchema.parse(await readJson(path.join(gen, "event-rosters.json")));

  return buildEngagement({
    members: parseRoster(rosterContent),
    contributions,
    kudos,
    eventRosters,
    statusWeeksByHandle: await statusWeeksByHandle(repoRoot),
  });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/engagement.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add projects/pulse/lib/sources/engagement.ts projects/pulse/tests/unit/engagement.test.ts projects/pulse/tests/fixtures/contributions.sample.json projects/pulse/tests/fixtures/kudos.sample.json projects/pulse/tests/fixtures/event-rosters.sample.json projects/pulse/tests/fixtures/roster.sample.md
git commit -m "feat(pulse): engagement parser (4 locked metrics, fail-fast JSON)"
```

## Task 10: Monthly review builder (`lib/reports/monthly.ts`)

Pure function: structs → monthly-review markdown. Deterministic (`period` + `generatedAt` are inputs, never `new Date()`).

**Files:**
- Create: `projects/pulse/lib/reports/monthly.ts`
- Test: `projects/pulse/tests/unit/monthly.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/monthly.test.ts
import { describe, it, expect } from "vitest";
import { buildMonthlyReview, type MonthlyReviewInput } from "../../lib/reports/monthly.js";

const input: MonthlyReviewInput = {
  period: "2026-05",
  generatedAt: "2026-06-01T09:30:00.000Z",
  projects: [
    { slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "v0.1.2", currentFocus: "E3", nextGate: "v0.2.0" },
  ],
  releases: [
    { project: "community-platform", version: "0.10.0.1", date: "2026-05-31", summary: "hotfix" },
    { project: "gbrain", version: "0.1.0", date: "2026-04-26", summary: "scaffold" },
  ],
  decisions: [
    { id: "0016", adr: "ADR-0016", title: "Telegram echo", status: "Proposed", date: "2026-05-28", path: "docs/decisions/0016-x.md" },
    { id: "0001", adr: "ADR-0001", title: "OSS-first", status: "Accepted", date: "2026-04-24", path: "docs/decisions/0001-x.md" },
  ],
  engagement: [
    { handle: "markspas", name: "Mark", contributions: 0, kudos: 0, statusStreak: 0, eventsAttended: 0 },
    { handle: "anton1rsod", name: "Anton", contributions: 385, kudos: 3, statusStreak: 2, eventsAttended: 1 },
  ],
  state: { lastUpdated: "2026-06-01", drivers: [{ name: "Anton", role: "DRI", detail: "all" }], hotNow: ["ship pulse"], blockers: [] },
};

describe("buildMonthlyReview", () => {
  it("titles by month and includes only in-period releases + decisions", () => {
    const md = buildMonthlyReview(input);
    expect(md).toContain("# Monthly Review — May 2026");
    expect(md).toContain("0.10.0.1"); // May release present
    expect(md).not.toContain("scaffold"); // April release excluded
    expect(md).toContain("ADR-0016"); // May decision present
    expect(md).not.toContain("OSS-first"); // April decision excluded
  });

  it("sorts engagement by contributions desc", () => {
    const md = buildMonthlyReview(input);
    expect(md.indexOf("Anton")).toBeLessThan(md.indexOf("Mark"));
  });

  it("renders empty-states and 'None' blockers", () => {
    const md = buildMonthlyReview({ ...input, releases: [], state: { ...input.state, blockers: [] } });
    expect(md).toContain("_No releases this month._");
    expect(md).toContain("_None._");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/monthly.test.ts`
Expected: FAIL — cannot find module `monthly.js`.

- [ ] **Step 3: Write `lib/reports/monthly.ts`**

```ts
import type { Adr, Engagement, Project, Release, RepoState } from "../types.js";

export interface MonthlyReviewInput {
  period: string;        // "YYYY-MM"
  generatedAt: string;   // ISO timestamp
  projects: Project[];
  releases: Release[];
  decisions: Adr[];
  engagement: Engagement[];
  state: RepoState;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthLabel(period: string): string {
  const [y, m] = period.split("-");
  const idx = Number(m) - 1;
  return `${MONTHS[idx] ?? m} ${y}`;
}

function cell(s: string): string {
  return s.replace(/\|/g, "\\|").replace(/\n+/g, " ").trim();
}

function table(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.map(cell).join(" | ")} |`).join("\n");
  return [head, sep, body].join("\n");
}

function list(items: string[], empty: string): string {
  return items.length ? items.map((i) => `- ${i}`).join("\n") : empty;
}

export function buildMonthlyReview(input: MonthlyReviewInput): string {
  const { period, generatedAt } = input;
  const label = monthLabel(period);
  const inPeriod = <T extends { date: string }>(xs: T[]) => xs.filter((x) => x.date.startsWith(period));

  const releases = inPeriod(input.releases).sort((a, b) => b.date.localeCompare(a.date));
  const decisions = inPeriod(input.decisions).sort((a, b) => b.date.localeCompare(a.date));
  const engagement = [...input.engagement].sort((a, b) => b.contributions - a.contributions);

  const out: string[] = [];
  out.push(`# Monthly Review — ${label}`);
  out.push("");
  out.push(`> Generated by **pulse** at ${generatedAt}. Derived from the repo — do not edit by hand.`);
  out.push("");

  out.push("## Portfolio");
  out.push(table(
    ["Project", "Status", "DRI", "Version", "Current focus", "Next gate"],
    input.projects.map((p) => [p.name, p.status, p.dri, p.version || "—", p.currentFocus, p.nextGate]),
  ));
  out.push("");

  out.push(`## Shipped in ${label}`);
  out.push(releases.length
    ? table(["Version", "Project", "Date", "Summary"], releases.map((r) => [r.version, r.project, r.date, r.summary]))
    : "_No releases this month._");
  out.push("");

  out.push(`## Decisions in ${label}`);
  out.push(decisions.length
    ? table(["ADR", "Title", "Status", "Date"], decisions.map((d) => [d.adr, d.title, d.status, d.date]))
    : "_No decisions this month._");
  out.push("");

  out.push("## Engagement");
  out.push(table(
    ["Member", "Contributions", "Kudos", "Status streak", "Events attended"],
    engagement.map((e) => [e.name, String(e.contributions), String(e.kudos), String(e.statusStreak), String(e.eventsAttended)]),
  ));
  out.push("");

  out.push("## Drivers");
  out.push(list(input.state.drivers.map((d) => `**${d.name}** (${d.role}) — ${d.detail}`), "_None recorded._"));
  out.push("");

  out.push("## Hot now");
  out.push(list(input.state.hotNow, "_Nothing flagged._"));
  out.push("");

  out.push("## Blockers");
  out.push(list(input.state.blockers, "_None._"));
  out.push("");

  return out.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/monthly.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/reports/monthly.ts projects/pulse/tests/unit/monthly.test.ts
git commit -m "feat(pulse): monthly-review markdown builder"
```

## Task 11: Build-report script (`scripts/build-report.ts`) + integration test

Wires the loaders → `buildMonthlyReview` → writes `docs/playbooks/monthly-review.md`. Closes spec §10.1.

**Files:**
- Create: `projects/pulse/scripts/build-report.ts`
- Test: `projects/pulse/tests/integration/build-report.test.ts`

- [ ] **Step 1: Write the failing integration test**

```ts
// tests/integration/build-report.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, mkdir, writeFile, rm, readFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { gatherMonthlyInput } from "../../scripts/build-report.js";

const FX = path.join(__dirname, "../fixtures");
let root: string;

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "pulse-repo-"));
  await mkdir(path.join(root, "docs/decisions"), { recursive: true });
  await mkdir(path.join(root, "projects/demo"), { recursive: true });
  await mkdir(path.join(root, "projects/community-platform/lib/__generated__"), { recursive: true });
  await mkdir(path.join(root, "community/members"), { recursive: true });
  await mkdir(path.join(root, "community/status/2026-W18"), { recursive: true });

  await cp(path.join(FX, "PROJECTS.sample.md"), path.join(root, "PROJECTS.md"));
  await cp(path.join(FX, "STATE.sample.md"), path.join(root, "STATE.md"));
  await cp(path.join(FX, "decisions-README.sample.md"), path.join(root, "docs/decisions/README.md"));
  await cp(path.join(FX, "CHANGELOG.sample.md"), path.join(root, "projects/demo/CHANGELOG.md"));
  await cp(path.join(FX, "roster.sample.md"), path.join(root, "community/members/roster.md"));
  const gen = path.join(root, "projects/community-platform/lib/__generated__");
  await cp(path.join(FX, "contributions.sample.json"), path.join(gen, "contributions.json"));
  await cp(path.join(FX, "kudos.sample.json"), path.join(gen, "kudos.json"));
  await cp(path.join(FX, "event-rosters.sample.json"), path.join(gen, "event-rosters.json"));
  await writeFile(path.join(root, "community/status/2026-W18/anton-safronov.md"),
    "---\nweek: 2026-W18\nauthor: anton1rsod\n---\nhi");
});
afterAll(async () => { await rm(root, { recursive: true, force: true }); });

describe("gatherMonthlyInput (loader wiring)", () => {
  it("loads every source from a fixture repo into a MonthlyReviewInput", async () => {
    const input = await gatherMonthlyInput(root, "2026-05", "2026-06-01T00:00:00.000Z");
    expect(input.projects.map((p) => p.slug)).toContain("gbrain");
    expect(input.decisions.find((d) => d.adr === "ADR-0017")).toBeTruthy();
    expect(input.releases.find((r) => r.version === "0.10.0.1")).toBeTruthy();
    expect(input.engagement.find((e) => e.handle === "anton1rsod")?.statusStreak).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/build-report.test.ts`
Expected: FAIL — cannot find module `build-report.js`.

- [ ] **Step 3: Write `scripts/build-report.ts`**

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { loadPortfolio } from "../lib/sources/portfolio.js";
import { loadDecisions } from "../lib/sources/decisions.js";
import { loadReleases } from "../lib/sources/shipping.js";
import { loadEngagement } from "../lib/sources/engagement.js";
import { loadRootState } from "../lib/sources/states.js";
import { buildMonthlyReview, type MonthlyReviewInput } from "../lib/reports/monthly.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

export async function gatherMonthlyInput(repoRoot: string, period: string, generatedAt: string): Promise<MonthlyReviewInput> {
  const [projects, decisions, releases, engagement, state] = await Promise.all([
    loadPortfolio(repoRoot),
    loadDecisions(repoRoot),
    loadReleases(repoRoot),
    loadEngagement(repoRoot),
    loadRootState(repoRoot),
  ]);
  return { period, generatedAt, projects, releases, decisions, engagement, state };
}

export async function writeMonthlyReview(repoRoot: string, period: string, generatedAt: string): Promise<string> {
  const md = buildMonthlyReview(await gatherMonthlyInput(repoRoot, period, generatedAt));
  const outDir = path.join(repoRoot, "docs/playbooks");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "monthly-review.md");
  await writeFile(outPath, md, "utf8");
  return outPath;
}

function argOf(flag: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`));
  return hit?.split("=")[1];
}

async function main(): Promise<void> {
  const period = argOf("--period") ?? "monthly";
  if (period === "weekly") throw new Error("weekly digest is deferred (spec O2); only --period=monthly is supported");
  if (period !== "monthly") throw new Error(`unknown --period=${period} (expected monthly)`);
  const now = new Date();
  const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const outPath = await writeMonthlyReview(REPO_ROOT, ym, now.toISOString());
  console.log(`pulse: wrote ${outPath}`);
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  });
}
```

> `console.log`/`console.error` are acceptable here: this is a CLI entry point (not application code), matching the repo's other `scripts/*` conventions.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/build-report.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Run the full suite + coverage gate**

Run (from `projects/pulse/`): `pnpm tsc --noEmit && pnpm lint && pnpm test:coverage`
Expected: `tsc` 0, `eslint` 0, all tests pass, coverage ≥80% on `lib/**` (gate enforced by `vitest.config.ts`).

- [ ] **Step 6: Generate the real monthly review (P1 success criterion §10.1)**

Run (from `projects/pulse/`): `pnpm build-report --period=monthly`
Expected: prints `pulse: wrote .../docs/playbooks/monthly-review.md`; the file exists and contains the Portfolio table populated from the real `PROJECTS.md`, plus Engagement rows for `anton1rsod` / `markspas`. Inspect it.

- [ ] **Step 7: Verify weekly is rejected**

Run: `pnpm build-report --period=weekly`
Expected: non-zero exit, error mentions "deferred (spec O2)".

- [ ] **Step 8: Commit**

```bash
git add projects/pulse/scripts/build-report.ts projects/pulse/tests/integration/build-report.test.ts docs/playbooks/monthly-review.md
git commit -m "feat(pulse): build-report script + monthly review (P1 complete)"
```

> **P1 is now independently shippable.** Pause here for review before P2 (which depends on Anton's one-time Notion setup for live runs — but all P2 code + tests are mock-based and need no live Notion).

---

# PHASE P2 — Notion mirror + Tasks export

> Closes spec §10.2: `pnpm sync-notion` mirrors the 4 context DBs idempotently (re-run = no duplicates); `notion-index.json` maps each row → `{pageId, dataSourceId}`; the Tasks DB is untouched by the mirror token; `pnpm export-tasks` writes `snapshots/tasks-snapshot.json` via the read-only token.
>
> **All P2 code is testable with mocked clients — no live Notion needed.** Live `sync-notion`/`export-tasks` runs require Anton to complete Task 12 first (tokens + DB ids in GitHub secrets).

## Task 12: Notion setup runbook (`SETUP.md`) — Anton-side, no code

Writes the one-time runbook (spec L10). The two-integration split (L3) is the security boundary: the mirror token is physically shared only with the 4 context DBs (cannot touch Tasks); the export token is shared only with Tasks (cannot write anything).

**Files:**
- Create: `projects/pulse/SETUP.md`

- [ ] **Step 1: Write `projects/pulse/SETUP.md`**

````markdown
# Pulse — one-time Notion setup (runbook)

Do this once before the first live `sync-notion` / `export-tasks` run (P2/P3). Everything in P1 (`build-report`) works without it.

## 1. Dedicated Notion space
Create a private teamspace (e.g. "Pulse — Warsaw AI") owned by the founder. Add Yuriy as a member.

## 2. Create 5 databases
Create these databases (manually, or via the Notion connector/MCP interactively). Property types are **locked** — match exactly (see plan Task 16):

- **Projects** — `Name` (title), `Status` (select: Proposed/In design/Building/Live/Archived), `DRI` (select), `Version` (rich text), `Current focus` (rich text), `Next gate` (rich text), `Repo path` (rich text), `External ID` (rich text), `last_synced_at` (date).
- **Decisions** — `ADR` (title), `Title` (rich text), `Status` (select: Proposed/Accepted/Superseded/Deprecated/Rejected), `Date` (date), `Link` (url), `External ID` (rich text), `last_synced_at` (date).
- **Shipping Log** — `Version` (title), `Project` (select), `Date` (date), `Summary` (rich text), `External ID` (rich text), `last_synced_at` (date).
- **Engagement** — `Member` (title), `Contributions` (number), `Kudos` (number), `Status streak` (number), `Events attended` (number), `External ID` (rich text), `last_synced_at` (date).
- **Tasks** — Notion-native; humans define fields (e.g. `Name` title, `Status`, `Assignee`, `Project` relation, `Priority`, `Due`). Never mirrored; only snapshotted.

Also create one plain **Digests** page (a normal page, not a database) — monthly review pages are created as children under it.

## 3. Create TWO internal integrations
In Notion → Settings → Connections → Develop/manage integrations:
- **pulse-mirror** — capabilities: Read + Insert + Update content. (No delete.)
- **pulse-export** — capabilities: Read content ONLY.

## 4. Share databases (the least-privilege boundary)
- Share **Projects, Decisions, Shipping Log, Engagement** with **pulse-mirror** only.
- Share the **Digests** page with **pulse-mirror** (the digest publisher uses the mirror token).
- Share **Tasks** with **pulse-export** only.
- Do NOT share Tasks with pulse-mirror. Do NOT share any context DB or the Digests page with pulse-export.

## 5. Capture secrets → GitHub repo secrets
Settings → Secrets and variables → Actions:
- `NOTION_TOKEN` = pulse-mirror integration token (write).
- `NOTION_READ_TOKEN` = pulse-export integration token (read-only).
- `NOTION_DB_PROJECTS`, `NOTION_DB_DECISIONS`, `NOTION_DB_SHIPPING`, `NOTION_DB_ENGAGEMENT`, `NOTION_DB_TASKS` = each database's id (the 32-char id from the DB URL).
- `NOTION_DIGEST_PAGE` = the **Digests** page id (32-char id from the page URL).

## 6. Seed the index
The first `sync-notion` run resolves each `database_id → data_source_id` and writes `notion-index.json`. No manual seeding needed; commit the resulting file.

## 7. Rotation
Rotate both integration tokens ~every 90 days (ADR-0006). Update the two GitHub secrets after rotating.
````

- [ ] **Step 2: Commit**

```bash
git add projects/pulse/SETUP.md
git commit -m "docs(pulse): Notion one-time setup runbook (two-integration least-privilege)"
```

> **Flag for Anton:** completing steps 1–5 is the only blocker for P2/P3 *live* runs. It does not block writing or testing any P2/P3 code.

## Task 13: Notion client + data-source resolution (`lib/notion/client.ts`)

Thin factory over `@notionhq/client@^5` + `resolveDataSourceId` (L4: `database_id → data_source_id`, asserting exactly one data source — the spec's silent-failure guard). Structural client interfaces let upsert/export be tested with fakes (no `vi.mock`).

**Files:**
- Create: `projects/pulse/lib/notion/client.ts`
- Test: `projects/pulse/tests/unit/notion-client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/notion-client.test.ts
import { describe, it, expect } from "vitest";
import { makeClient, resolveDataSourceId } from "../../lib/notion/client.js";

describe("makeClient", () => {
  it("constructs a client exposing dataSources + pages", () => {
    const c = makeClient("secret_x") as unknown as { dataSources: unknown; pages: unknown };
    expect(c.dataSources).toBeDefined();
    expect(c.pages).toBeDefined();
  });
});

describe("resolveDataSourceId", () => {
  it("returns the single data source id", async () => {
    const client = { databases: { retrieve: async () => ({ data_sources: [{ id: "ds_1" }] }) } };
    expect(await resolveDataSourceId(client, "db_1")).toBe("ds_1");
  });
  it("throws when a database has zero or multiple data sources (L4 guard)", async () => {
    const none = { databases: { retrieve: async () => ({ data_sources: [] }) } };
    const two = { databases: { retrieve: async () => ({ data_sources: [{ id: "a" }, { id: "b" }] }) } };
    await expect(resolveDataSourceId(none, "db")).rejects.toThrow(/exactly one/i);
    await expect(resolveDataSourceId(two, "db")).rejects.toThrow(/exactly one/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/notion-client.test.ts`
Expected: FAIL — cannot find module `client.js`.

- [ ] **Step 3: Write `lib/notion/client.ts`**

```ts
import { Client } from "@notionhq/client";

export interface NotionPage {
  id: string;
}
export interface QueryResult {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

/** Minimal structural shapes so consumers are testable with fakes. */
export interface RetrievableClient {
  databases: { retrieve(args: { database_id: string }): Promise<{ data_sources?: { id: string }[] }> };
}
export interface MirrorClient {
  dataSources: { query(args: Record<string, unknown>): Promise<QueryResult> };
  pages: {
    create(args: Record<string, unknown>): Promise<NotionPage>;
    update(args: Record<string, unknown>): Promise<NotionPage>;
  };
}
export interface ExportClient {
  dataSources: { query(args: Record<string, unknown>): Promise<{ results: unknown[]; has_more: boolean; next_cursor: string | null }> };
}

export function makeClient(token: string): Client {
  return new Client({ auth: token, notionVersion: "2025-09-03" });
}

/** Resolve database_id → data_source_id. Asserts exactly one data source (L4 silent-failure guard). */
export async function resolveDataSourceId(client: RetrievableClient, databaseId: string): Promise<string> {
  const db = await client.databases.retrieve({ database_id: databaseId });
  const sources = db.data_sources ?? [];
  if (sources.length !== 1) {
    throw new Error(`Database ${databaseId} must have exactly one data source, found ${sources.length} (L4)`);
  }
  return (sources[0] as { id: string }).id;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/notion-client.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/notion/client.ts projects/pulse/tests/unit/notion-client.test.ts
git commit -m "feat(pulse): notion v5 client factory + data-source resolution"
```

## Task 14: Throttle + backoff (`lib/notion/throttle.ts`)

`p-limit` concurrency cap (≤2–3) + exponential backoff honoring `Retry-After` on 429/529 (L4). `sleep` is injectable so tests run instantly.

**Files:**
- Create: `projects/pulse/lib/notion/throttle.ts`
- Test: `projects/pulse/tests/unit/throttle.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/throttle.test.ts
import { describe, it, expect, vi } from "vitest";
import { createThrottle, isRateLimited } from "../../lib/notion/throttle.js";

describe("isRateLimited", () => {
  it("detects rate-limit by code or status", () => {
    expect(isRateLimited({ code: "rate_limited" })).toBe(true);
    expect(isRateLimited({ status: 429 })).toBe(true);
    expect(isRateLimited({ status: 529 })).toBe(true);
    expect(isRateLimited({ status: 500 })).toBe(false);
  });
});

describe("createThrottle", () => {
  it("retries a rate-limited call then resolves", async () => {
    const sleep = vi.fn(async () => {});
    const throttle = createThrottle({ concurrency: 2, maxRetries: 3, sleep });
    let calls = 0;
    const result = await throttle(async () => {
      calls++;
      if (calls === 1) throw { status: 429, headers: { "retry-after": "1" } };
      return "ok";
    });
    expect(result).toBe("ok");
    expect(calls).toBe(2);
    expect(sleep).toHaveBeenCalledWith(1000); // honored Retry-After seconds → ms
  });

  it("gives up after maxRetries on persistent rate limiting", async () => {
    const throttle = createThrottle({ maxRetries: 2, sleep: async () => {} });
    await expect(throttle(async () => { throw { status: 429 }; })).rejects.toBeTruthy();
  });

  it("rethrows non-rate-limit errors immediately", async () => {
    const sleep = vi.fn(async () => {});
    const throttle = createThrottle({ maxRetries: 5, sleep });
    await expect(throttle(async () => { throw new Error("boom"); })).rejects.toThrow("boom");
    expect(sleep).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/throttle.test.ts`
Expected: FAIL — cannot find module `throttle.js`.

- [ ] **Step 3: Write `lib/notion/throttle.ts`**

```ts
import pLimit from "p-limit";

export type Throttle = <T>(fn: () => Promise<T>) => Promise<T>;

export interface ThrottleOptions {
  concurrency?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export function isRateLimited(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; status?: unknown };
  if (e.code === "rate_limited") return true;
  return e.status === 429 || e.status === 529;
}

function retryAfterMs(err: unknown, fallbackMs: number): number {
  const headers = (err as { headers?: Record<string, string> }).headers;
  const raw = headers?.["retry-after"];
  const secs = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(secs) ? secs * 1000 : fallbackMs;
}

export function createThrottle(opts: ThrottleOptions = {}): Throttle {
  const concurrency = opts.concurrency ?? 2;
  const maxRetries = opts.maxRetries ?? 5;
  const baseDelayMs = opts.baseDelayMs ?? 1000;
  const sleep = opts.sleep ?? defaultSleep;
  const limit = pLimit(concurrency);

  async function withBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let attempt = 0;
    for (;;) {
      try {
        return await fn();
      } catch (err: unknown) {
        if (!isRateLimited(err) || attempt >= maxRetries) throw err;
        const expo = baseDelayMs * 2 ** attempt;
        await sleep(retryAfterMs(err, expo));
        attempt++;
      }
    }
  }

  return <T>(fn: () => Promise<T>): Promise<T> => limit(() => withBackoff(fn));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/throttle.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/notion/throttle.ts projects/pulse/tests/unit/throttle.test.ts
git commit -m "feat(pulse): p-limit throttle + Retry-After backoff"
```

## Task 15: Index store (`lib/notion/index-store.ts`)

Read/write `notion-index.json` = `{ "<dbKey>:<externalId>": { pageId, dataSourceId } }`. The store encapsulates an accumulator `Map` (a deliberate cache, not domain data) so a sync run records page ids as it goes.

**Files:**
- Create: `projects/pulse/lib/notion/index-store.ts`
- Test: `projects/pulse/tests/unit/index-store.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/index-store.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readIndex, writeIndex, createIndexStore } from "../../lib/notion/index-store.js";

let dir: string;
beforeAll(async () => { dir = await mkdtemp(path.join(tmpdir(), "pulse-idx-")); });
afterAll(async () => { await rm(dir, { recursive: true, force: true }); });

describe("index store", () => {
  it("readIndex returns {} when the file is missing", async () => {
    expect(await readIndex(path.join(dir, "nope.json"))).toEqual({});
  });

  it("store get/set/snapshot, and writeIndex/readIndex round-trip", async () => {
    const store = createIndexStore({});
    expect(store.get("projects:gbrain")).toBeUndefined();
    store.set("projects:gbrain", { pageId: "p1", dataSourceId: "ds1" });
    expect(store.get("projects:gbrain")).toEqual({ pageId: "p1", dataSourceId: "ds1" });

    const file = path.join(dir, "notion-index.json");
    await writeIndex(file, store.snapshot());
    expect(await readIndex(file)).toEqual({ "projects:gbrain": { pageId: "p1", dataSourceId: "ds1" } });
  });

  it("readIndex throws on a malformed file (fail-fast)", async () => {
    const file = path.join(dir, "bad.json");
    await writeIndex(file, {} as never);
    const { writeFile } = await import("node:fs/promises");
    await writeFile(file, JSON.stringify({ k: { pageId: 1 } }));
    await expect(readIndex(file)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/index-store.test.ts`
Expected: FAIL — cannot find module `index-store.js`.

- [ ] **Step 3: Write `lib/notion/index-store.ts`**

```ts
import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";

export const IndexEntrySchema = z.object({ pageId: z.string(), dataSourceId: z.string() });
export type IndexEntry = z.infer<typeof IndexEntrySchema>;

export const NotionIndexSchema = z.record(z.string(), IndexEntrySchema);
export type NotionIndex = z.infer<typeof NotionIndexSchema>;

export async function readIndex(absPath: string): Promise<NotionIndex> {
  let raw: string;
  try {
    raw = await readFile(absPath, "utf8");
  } catch (err: unknown) {
    if (err && typeof err === "object" && (err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }
  return NotionIndexSchema.parse(JSON.parse(raw));
}

export async function writeIndex(absPath: string, index: NotionIndex): Promise<void> {
  await writeFile(absPath, JSON.stringify(index, Object.keys(index).sort(), 2) + "\n", "utf8");
}

export interface IndexStore {
  get(key: string): IndexEntry | undefined;
  set(key: string, entry: IndexEntry): void;
  snapshot(): NotionIndex;
}

export function createIndexStore(initial: NotionIndex): IndexStore {
  const map = new Map<string, IndexEntry>(Object.entries(initial));
  return {
    get: (key) => map.get(key),
    set: (key, entry) => { map.set(key, entry); },
    snapshot: () => Object.fromEntries([...map.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
}
```

> `JSON.stringify(index, Object.keys(index).sort(), 2)` produces a stable key order so the committed `notion-index.json` has minimal diffs run-to-run.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/index-store.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/notion/index-store.ts projects/pulse/tests/unit/index-store.test.ts
git commit -m "feat(pulse): notion-index.json store (stable key order)"
```

## Task 16: Property mappers (`lib/notion/mappers.ts`)

Struct → Notion `properties` payload per DB + the `External ID` idempotency key. **This locks O3** (exact property types). Every row carries `External ID` (rich_text) + `last_synced_at` (date); mirror overwrites all computed fields each run (L8).

**Files:**
- Create: `projects/pulse/lib/notion/mappers.ts`
- Test: `projects/pulse/tests/unit/mappers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/mappers.test.ts
import { describe, it, expect } from "vitest";
import { projectProps, decisionProps, releaseProps, engagementProps } from "../../lib/notion/mappers.js";

const SYNC = "2026-06-09T00:00:00.000Z";

describe("mappers", () => {
  it("projectProps: title=name, externalId=slug, select status/DRI, date sync", () => {
    const { externalId, properties } = projectProps(
      { slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "v0.1.2", currentFocus: "E3", nextGate: "v0.2.0" },
      SYNC,
    );
    expect(externalId).toBe("gbrain");
    expect((properties["Name"] as any).title[0].text.content).toBe("GBrain");
    expect((properties["Status"] as any).select.name).toBe("Building");
    expect((properties["External ID"] as any).rich_text[0].text.content).toBe("gbrain");
    expect((properties["last_synced_at"] as any).date.start).toBe(SYNC);
  });

  it("decisionProps: externalId=ADR-id, url composed from repoUrl", () => {
    const { externalId, properties } = decisionProps(
      { id: "0017", adr: "ADR-0017", title: "Yuriy", status: "Accepted", date: "2026-06-09", path: "docs/decisions/0017-x.md" },
      SYNC, "https://github.com/anton1rsod/warsaw-ai-community",
    );
    expect(externalId).toBe("ADR-0017");
    expect((properties["ADR"] as any).title[0].text.content).toBe("ADR-0017");
    expect((properties["Link"] as any).url).toBe("https://github.com/anton1rsod/warsaw-ai-community/blob/main/docs/decisions/0017-x.md");
  });

  it("releaseProps: title=version, externalId=project@version", () => {
    const { externalId, properties } = releaseProps({ project: "gbrain", version: "0.1.1", date: "2026-04-26", summary: "x" }, SYNC);
    expect(externalId).toBe("gbrain@0.1.1");
    expect((properties["Project"] as any).select.name).toBe("gbrain");
  });

  it("engagementProps: numbers + externalId=handle", () => {
    const { externalId, properties } = engagementProps({ handle: "anton1rsod", name: "Anton", contributions: 385, kudos: 3, statusStreak: 2, eventsAttended: 1 }, SYNC);
    expect(externalId).toBe("anton1rsod");
    expect((properties["Contributions"] as any).number).toBe(385);
    expect((properties["Member"] as any).title[0].text.content).toBe("Anton");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/mappers.test.ts`
Expected: FAIL — cannot find module `mappers.js`.

- [ ] **Step 3: Write `lib/notion/mappers.ts`**

```ts
import type { Adr, Engagement, Project, Release } from "../types.js";

export interface MappedRow {
  externalId: string;
  properties: Record<string, unknown>;
}

const title = (content: string) => ({ title: [{ text: { content } }] });
const richText = (content: string) => ({ rich_text: content ? [{ text: { content } }] : [] });
const select = (name: string) => ({ select: { name } });
const number = (n: number) => ({ number: n });
const date = (start: string) => ({ date: { start } });
const url = (u: string) => ({ url: u });

export function projectProps(p: Project, syncedAt: string): MappedRow {
  return {
    externalId: p.slug,
    properties: {
      Name: title(p.name),
      Status: select(p.status),
      DRI: select(p.dri),
      Version: richText(p.version),
      "Current focus": richText(p.currentFocus),
      "Next gate": richText(p.nextGate),
      "Repo path": richText(p.path),
      "External ID": richText(p.slug),
      last_synced_at: date(syncedAt),
    },
  };
}

export function decisionProps(a: Adr, syncedAt: string, repoUrl = ""): MappedRow {
  const link = repoUrl ? `${repoUrl}/blob/main/${a.path}` : a.path;
  return {
    externalId: a.adr,
    properties: {
      ADR: title(a.adr),
      Title: richText(a.title),
      Status: select(a.status),
      Date: date(a.date),
      Link: url(link),
      "External ID": richText(a.adr),
      last_synced_at: date(syncedAt),
    },
  };
}

export function releaseProps(r: Release, syncedAt: string): MappedRow {
  return {
    externalId: `${r.project}@${r.version}`,
    properties: {
      Version: title(r.version),
      Project: select(r.project),
      Date: date(r.date),
      Summary: richText(r.summary),
      "External ID": richText(`${r.project}@${r.version}`),
      last_synced_at: date(syncedAt),
    },
  };
}

export function engagementProps(e: Engagement, syncedAt: string): MappedRow {
  return {
    externalId: e.handle,
    properties: {
      Member: title(e.name),
      Contributions: number(e.contributions),
      Kudos: number(e.kudos),
      "Status streak": number(e.statusStreak),
      "Events attended": number(e.eventsAttended),
      "External ID": richText(e.handle),
      last_synced_at: date(syncedAt),
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/mappers.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/notion/mappers.ts projects/pulse/tests/unit/mappers.test.ts
git commit -m "feat(pulse): notion property mappers (O3 field types locked)"
```

## Task 17: Idempotent upsert (`lib/notion/upsert.ts`)

`query-by-external-id → update | create`, index-cached, throttled. The idempotency contract (spec §10.2: re-run = no duplicates).

**Files:**
- Create: `projects/pulse/lib/notion/upsert.ts`
- Test: `projects/pulse/tests/unit/upsert.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/upsert.test.ts
import { describe, it, expect, vi } from "vitest";
import { upsertMany } from "../../lib/notion/upsert.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import { createIndexStore } from "../../lib/notion/index-store.js";
import type { MirrorClient } from "../../lib/notion/client.js";

function fakeClient(queryResults: { id: string }[] = []) {
  return {
    dataSources: { query: vi.fn(async () => ({ results: queryResults, has_more: false, next_cursor: null })) },
    pages: {
      create: vi.fn(async () => ({ id: "created-1" })),
      update: vi.fn(async () => ({ id: "updated" })),
    },
  } satisfies MirrorClient;
}

const throttle = createThrottle({ sleep: async () => {} });
const rows = [{ externalId: "gbrain", properties: { Name: { title: [] } } }];

describe("upsertMany", () => {
  it("creates when absent (index empty + query empty)", async () => {
    const client = fakeClient([]);
    const store = createIndexStore({});
    await upsertMany(client, throttle, store, "projects", "ds1", rows);
    expect(client.pages.create).toHaveBeenCalledTimes(1);
    expect(client.pages.update).not.toHaveBeenCalled();
    expect(store.get("projects:gbrain")).toEqual({ pageId: "created-1", dataSourceId: "ds1" });
  });

  it("updates via index without querying", async () => {
    const client = fakeClient([]);
    const store = createIndexStore({ "projects:gbrain": { pageId: "p9", dataSourceId: "ds1" } });
    await upsertMany(client, throttle, store, "projects", "ds1", rows);
    expect(client.dataSources.query).not.toHaveBeenCalled();
    expect(client.pages.update).toHaveBeenCalledWith(expect.objectContaining({ page_id: "p9" }));
    expect(client.pages.create).not.toHaveBeenCalled();
  });

  it("updates via query when found but not indexed", async () => {
    const client = fakeClient([{ id: "found-7" }]);
    const store = createIndexStore({});
    await upsertMany(client, throttle, store, "projects", "ds1", rows);
    expect(client.pages.update).toHaveBeenCalledWith(expect.objectContaining({ page_id: "found-7" }));
    expect(client.pages.create).not.toHaveBeenCalled();
  });

  it("re-run produces no duplicate create", async () => {
    const client = fakeClient([]);
    const store = createIndexStore({});
    await upsertMany(client, throttle, store, "projects", "ds1", rows); // creates
    await upsertMany(client, throttle, store, "projects", "ds1", rows); // index hit → update
    expect(client.pages.create).toHaveBeenCalledTimes(1);
    expect(client.pages.update).toHaveBeenCalledTimes(1);
  });

  it("queries by the External ID filter and the data_source_id parent on create", async () => {
    const client = fakeClient([]);
    await upsertMany(client, throttle, createIndexStore({}), "projects", "ds1", rows);
    expect(client.dataSources.query).toHaveBeenCalledWith(expect.objectContaining({
      data_source_id: "ds1",
      filter: { property: "External ID", rich_text: { equals: "gbrain" } },
    }));
    expect(client.pages.create).toHaveBeenCalledWith(expect.objectContaining({
      parent: { type: "data_source_id", data_source_id: "ds1" },
    }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/upsert.test.ts`
Expected: FAIL — cannot find module `upsert.js`.

- [ ] **Step 3: Write `lib/notion/upsert.ts`**

```ts
import type { MirrorClient } from "./client.js";
import type { Throttle } from "./throttle.js";
import type { IndexStore } from "./index-store.js";
import type { MappedRow } from "./mappers.js";

export async function upsertRow(
  client: MirrorClient,
  throttle: Throttle,
  store: IndexStore,
  dbKey: string,
  dataSourceId: string,
  row: MappedRow,
): Promise<string> {
  const sourceKey = `${dbKey}:${row.externalId}`;
  const cached = store.get(sourceKey);

  if (cached?.pageId) {
    await throttle(() => client.pages.update({ page_id: cached.pageId, properties: row.properties }));
    store.set(sourceKey, { pageId: cached.pageId, dataSourceId });
    return cached.pageId;
  }

  const found = await throttle(() =>
    client.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "External ID", rich_text: { equals: row.externalId } },
    }),
  );

  let pageId: string;
  if (found.results.length > 0) {
    pageId = (found.results[0] as { id: string }).id;
    await throttle(() => client.pages.update({ page_id: pageId, properties: row.properties }));
  } else {
    const created = await throttle(() =>
      client.pages.create({
        parent: { type: "data_source_id", data_source_id: dataSourceId },
        properties: row.properties,
      }),
    );
    pageId = created.id;
  }

  store.set(sourceKey, { pageId, dataSourceId });
  return pageId;
}

export async function upsertMany(
  client: MirrorClient,
  throttle: Throttle,
  store: IndexStore,
  dbKey: string,
  dataSourceId: string,
  rows: readonly MappedRow[],
): Promise<string[]> {
  return Promise.all(rows.map((row) => upsertRow(client, throttle, store, dbKey, dataSourceId, row)));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/upsert.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/notion/upsert.ts projects/pulse/tests/unit/upsert.test.ts
git commit -m "feat(pulse): idempotent query-by-external-id upsert"
```

## Task 18: Read-only Tasks export (`lib/notion/export-tasks.ts`)

Paginates the Tasks data source and returns raw rows. Uses the `ExportClient` type, which has **no `pages` member** — a write is impossible by capability (L3/L9). Schema-agnostic raw dump.

**Files:**
- Create: `projects/pulse/lib/notion/export-tasks.ts`
- Test: `projects/pulse/tests/unit/export-tasks.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/export-tasks.test.ts
import { describe, it, expect, vi } from "vitest";
import { exportTasks } from "../../lib/notion/export-tasks.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import type { ExportClient } from "../../lib/notion/client.js";

const throttle = createThrottle({ sleep: async () => {} });

describe("exportTasks", () => {
  it("concatenates all pages following next_cursor", async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ results: [{ id: "a" }], has_more: true, next_cursor: "c1" })
      .mockResolvedValueOnce({ results: [{ id: "b" }], has_more: false, next_cursor: null });
    const client: ExportClient = { dataSources: { query } };

    const rows = await exportTasks(client, "ds_tasks", throttle);
    expect(rows.map((r: any) => r.id)).toEqual(["a", "b"]);
    expect(query).toHaveBeenNthCalledWith(2, expect.objectContaining({ start_cursor: "c1", data_source_id: "ds_tasks" }));
  });

  it("never invokes a write method (read-only by capability)", async () => {
    const create = vi.fn();
    const update = vi.fn();
    const client = {
      dataSources: { query: vi.fn(async () => ({ results: [], has_more: false, next_cursor: null })) },
      pages: { create, update },
    };
    await exportTasks(client as unknown as ExportClient, "ds", throttle);
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/export-tasks.test.ts`
Expected: FAIL — cannot find module `export-tasks.js`.

- [ ] **Step 3: Write `lib/notion/export-tasks.ts`**

```ts
import type { ExportClient } from "./client.js";
import type { Throttle } from "./throttle.js";

/** Dump every row of the Tasks data source. Read-only: ExportClient has no write surface. */
export async function exportTasks(client: ExportClient, dataSourceId: string, throttle: Throttle): Promise<unknown[]> {
  const rows: unknown[] = [];
  let cursor: string | null = null;
  for (;;) {
    const args: Record<string, unknown> = { data_source_id: dataSourceId, page_size: 100 };
    if (cursor) args.start_cursor = cursor;
    const page = await throttle(() => client.dataSources.query(args));
    rows.push(...page.results);
    if (!page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return rows;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/export-tasks.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add projects/pulse/lib/notion/export-tasks.ts projects/pulse/tests/unit/export-tasks.test.ts
git commit -m "feat(pulse): read-only Tasks export (paginated, write-incapable)"
```

## Task 19: Sync script (`scripts/sync-notion.ts`)

Mirrors the 4 context DBs. `runSync` is the testable core (clients + data in; no fs/env); `main()` does env + loaders + index io + graceful no-op when unconfigured (L8).

**Files:**
- Create: `projects/pulse/scripts/sync-notion.ts`
- Test: `projects/pulse/tests/integration/sync-notion.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/sync-notion.test.ts
import { describe, it, expect, vi } from "vitest";
import { runSync } from "../../scripts/sync-notion.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import { createIndexStore } from "../../lib/notion/index-store.js";

function fakeClient() {
  return {
    databases: { retrieve: vi.fn(async () => ({ data_sources: [{ id: "ds" }] })) },
    dataSources: { query: vi.fn(async () => ({ results: [], has_more: false, next_cursor: null })) },
    pages: { create: vi.fn(async () => ({ id: "new" })), update: vi.fn(async () => ({ id: "u" })) },
  };
}

describe("runSync", () => {
  it("resolves a data source per DB and creates one page per row", async () => {
    const client = fakeClient();
    const store = createIndexStore({});
    await runSync({
      mirrorClient: client as never,
      dbIds: { projects: "p", decisions: "d", shipping: "s", engagement: "e" },
      data: {
        projects: [{ slug: "gbrain", name: "GBrain", path: "projects/gbrain/", status: "Building", dri: "Anton", version: "v0.1", currentFocus: "x", nextGate: "y" }],
        decisions: [{ id: "0001", adr: "ADR-0001", title: "t", status: "Accepted", date: "2026-04-24", path: "docs/decisions/0001-x.md" }],
        releases: [{ project: "gbrain", version: "0.1.0", date: "2026-04-26", summary: "s" }],
        engagement: [{ handle: "anton1rsod", name: "Anton", contributions: 1, kudos: 0, statusStreak: 0, eventsAttended: 0 }],
      },
      store,
      throttle: createThrottle({ sleep: async () => {} }),
      syncedAt: "2026-06-09T00:00:00.000Z",
      repoUrl: "https://github.com/x/y",
    });
    expect(client.databases.retrieve).toHaveBeenCalledTimes(4);
    expect(client.pages.create).toHaveBeenCalledTimes(4);
    expect(Object.keys(store.snapshot())).toEqual(
      expect.arrayContaining(["projects:gbrain", "decisions:ADR-0001", "shipping:gbrain@0.1.0", "engagement:anton1rsod"]),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/sync-notion.test.ts`
Expected: FAIL — cannot find module `sync-notion.js`.

- [ ] **Step 3: Write `scripts/sync-notion.ts`**

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Adr, Engagement, Project, Release } from "../lib/types.js";
import { makeClient, resolveDataSourceId, type MirrorClient, type RetrievableClient } from "../lib/notion/client.js";
import { createThrottle, type Throttle } from "../lib/notion/throttle.js";
import { readIndex, writeIndex, createIndexStore, type IndexStore } from "../lib/notion/index-store.js";
import { projectProps, decisionProps, releaseProps, engagementProps } from "../lib/notion/mappers.js";
import { upsertMany } from "../lib/notion/upsert.js";
import { loadPortfolio } from "../lib/sources/portfolio.js";
import { loadDecisions } from "../lib/sources/decisions.js";
import { loadReleases } from "../lib/sources/shipping.js";
import { loadEngagement } from "../lib/sources/engagement.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

export interface SyncDeps {
  mirrorClient: MirrorClient & RetrievableClient;
  dbIds: { projects: string; decisions: string; shipping: string; engagement: string };
  data: { projects: Project[]; decisions: Adr[]; releases: Release[]; engagement: Engagement[] };
  store: IndexStore;
  throttle: Throttle;
  syncedAt: string;
  repoUrl: string;
}

export async function runSync(deps: SyncDeps): Promise<void> {
  const { mirrorClient, dbIds, data, store, throttle, syncedAt, repoUrl } = deps;

  const [dsProjects, dsDecisions, dsShipping, dsEngagement] = await Promise.all([
    resolveDataSourceId(mirrorClient, dbIds.projects),
    resolveDataSourceId(mirrorClient, dbIds.decisions),
    resolveDataSourceId(mirrorClient, dbIds.shipping),
    resolveDataSourceId(mirrorClient, dbIds.engagement),
  ]);

  await upsertMany(mirrorClient, throttle, store, "projects", dsProjects, data.projects.map((p) => projectProps(p, syncedAt)));
  await upsertMany(mirrorClient, throttle, store, "decisions", dsDecisions, data.decisions.map((a) => decisionProps(a, syncedAt, repoUrl)));
  await upsertMany(mirrorClient, throttle, store, "shipping", dsShipping, data.releases.map((r) => releaseProps(r, syncedAt)));
  await upsertMany(mirrorClient, throttle, store, "engagement", dsEngagement, data.engagement.map((e) => engagementProps(e, syncedAt)));
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

async function main(): Promise<void> {
  const token = env("NOTION_TOKEN");
  const dbIds = {
    projects: env("NOTION_DB_PROJECTS"),
    decisions: env("NOTION_DB_DECISIONS"),
    shipping: env("NOTION_DB_SHIPPING"),
    engagement: env("NOTION_DB_ENGAGEMENT"),
  };
  if (!token || !dbIds.projects || !dbIds.decisions || !dbIds.shipping || !dbIds.engagement) {
    console.log("pulse: NOTION_TOKEN or a DB id is unset — skipping mirror (graceful no-op).");
    return;
  }

  const indexPath = path.join(REPO_ROOT, "projects/pulse/notion-index.json");
  const store = createIndexStore(await readIndex(indexPath));
  const [projects, decisions, releases, engagement] = await Promise.all([
    loadPortfolio(REPO_ROOT), loadDecisions(REPO_ROOT), loadReleases(REPO_ROOT), loadEngagement(REPO_ROOT),
  ]);

  await runSync({
    mirrorClient: makeClient(token) as unknown as MirrorClient & RetrievableClient,
    dbIds: dbIds as { projects: string; decisions: string; shipping: string; engagement: string },
    data: { projects, decisions, releases, engagement },
    store,
    throttle: createThrottle({ concurrency: 2 }),
    syncedAt: new Date().toISOString(),
    repoUrl: env("GITHUB_REPO_URL") ?? "",
  });

  await writeIndex(indexPath, store.snapshot());
  console.log("pulse: mirror complete; notion-index.json updated.");
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => { console.error(err); process.exitCode = 1; });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/sync-notion.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Verify the unconfigured no-op (L8 graceful degrade)**

Run (from `projects/pulse/`, with no Notion env set): `pnpm sync-notion`
Expected: prints `pulse: ... unset — skipping mirror (graceful no-op).`, exit 0 (no throw).

- [ ] **Step 6: Commit**

```bash
git add projects/pulse/scripts/sync-notion.ts projects/pulse/tests/integration/sync-notion.test.ts
git commit -m "feat(pulse): sync-notion mirror script (runSync core + graceful no-op)"
```

## Task 20: Export script (`scripts/export-tasks.ts`)

Snapshots the Notion Tasks board to `snapshots/tasks-snapshot.json` (overwritten; git history = audit, L9) via the read-only token. `runTaskExport` is the testable core.

**Files:**
- Create: `projects/pulse/scripts/export-tasks.ts`
- Test: `projects/pulse/tests/integration/export-tasks-script.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/integration/export-tasks-script.test.ts
import { describe, it, expect, vi, afterAll } from "vitest";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { runTaskExport } from "../../scripts/export-tasks.js";
import { createThrottle } from "../../lib/notion/throttle.js";

let dir: string;
afterAll(async () => { if (dir) await rm(dir, { recursive: true, force: true }); });

describe("runTaskExport", () => {
  it("resolves the data source, dumps rows, writes the snapshot file", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "pulse-snap-"));
    const out = path.join(dir, "tasks-snapshot.json");
    const client = {
      databases: { retrieve: vi.fn(async () => ({ data_sources: [{ id: "ds_tasks" }] })) },
      dataSources: { query: vi.fn(async () => ({ results: [{ id: "t1" }, { id: "t2" }], has_more: false, next_cursor: null })) },
    };
    const rows = await runTaskExport({
      exportClient: client as never,
      retrievableClient: client as never,
      tasksDbId: "db_tasks",
      throttle: createThrottle({ sleep: async () => {} }),
      outPath: out,
    });
    expect(rows).toHaveLength(2);
    const written = JSON.parse(await readFile(out, "utf8"));
    expect(written.count).toBe(2);
    expect(written.rows.map((r: any) => r.id)).toEqual(["t1", "t2"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/integration/export-tasks-script.test.ts`
Expected: FAIL — cannot find module `export-tasks.js`.

- [ ] **Step 3: Write `scripts/export-tasks.ts`**

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { makeClient, resolveDataSourceId, type ExportClient, type RetrievableClient } from "../lib/notion/client.js";
import { createThrottle, type Throttle } from "../lib/notion/throttle.js";
import { exportTasks } from "../lib/notion/export-tasks.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

export interface TaskExportDeps {
  exportClient: ExportClient;
  retrievableClient: RetrievableClient;
  tasksDbId: string;
  throttle: Throttle;
  outPath: string;
}

export async function runTaskExport(deps: TaskExportDeps): Promise<unknown[]> {
  const dsId = await resolveDataSourceId(deps.retrievableClient, deps.tasksDbId);
  const rows = await exportTasks(deps.exportClient, dsId, deps.throttle);
  await mkdir(path.dirname(deps.outPath), { recursive: true });
  await writeFile(deps.outPath, JSON.stringify({ count: rows.length, rows }, null, 2) + "\n", "utf8");
  return rows;
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

async function main(): Promise<void> {
  const token = env("NOTION_READ_TOKEN");
  const tasksDbId = env("NOTION_DB_TASKS");
  if (!token || !tasksDbId) {
    console.log("pulse: NOTION_READ_TOKEN or NOTION_DB_TASKS unset — skipping export (graceful no-op).");
    return;
  }
  const client = makeClient(token);
  const rows = await runTaskExport({
    exportClient: client as unknown as ExportClient,
    retrievableClient: client as unknown as RetrievableClient,
    tasksDbId,
    throttle: createThrottle({ concurrency: 2 }),
    outPath: path.join(REPO_ROOT, "projects/pulse/snapshots/tasks-snapshot.json"),
  });
  console.log(`pulse: exported ${rows.length} tasks → snapshots/tasks-snapshot.json`);
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => { console.error(err); process.exitCode = 1; });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/integration/export-tasks-script.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Full P2 verification**

Run (from `projects/pulse/`): `pnpm tsc --noEmit && pnpm lint && pnpm test:coverage`
Expected: all green; coverage ≥80% on `lib/**`.

- [ ] **Step 6: Commit**

```bash
git add projects/pulse/scripts/export-tasks.ts projects/pulse/tests/integration/export-tasks-script.test.ts
git commit -m "feat(pulse): export-tasks snapshot script (read-only, P2 complete)"
```

## Task 21: Notion monthly digest page (`lib/notion/digest.ts` + `scripts/publish-digest.ts`)

Closes the L5 requirement "monthly review → … + a Notion digest page." Creates (or reuses) one child page per month under the **Digests** page and (over)writes its body with the monthly markdown. Idempotent via the index key `digest:<period>` (reuses the same `notion-index.json`). Uses the mirror token.

**Files:**
- Create: `projects/pulse/lib/notion/digest.ts`
- Create: `projects/pulse/scripts/publish-digest.ts`
- Test: `projects/pulse/tests/unit/digest.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/digest.test.ts
import { describe, it, expect, vi } from "vitest";
import { publishDigest } from "../../lib/notion/digest.js";
import { createThrottle } from "../../lib/notion/throttle.js";
import { createIndexStore } from "../../lib/notion/index-store.js";

const throttle = createThrottle({ sleep: async () => {} });
const fake = () => ({ pages: { create: vi.fn(async () => ({ id: "page-1" })), updateMarkdown: vi.fn(async () => ({})) } });

describe("publishDigest", () => {
  it("creates the page then writes markdown when absent", async () => {
    const client = fake();
    const store = createIndexStore({});
    const id = await publishDigest(client, throttle, store, "parent", "2026-06", "Monthly Review — June 2026", "# hi");
    expect(id).toBe("page-1");
    expect(client.pages.create).toHaveBeenCalledTimes(1);
    expect(client.pages.updateMarkdown).toHaveBeenCalledWith({ page_id: "page-1", markdown: "# hi" });
    expect(store.get("digest:2026-06")).toEqual({ pageId: "page-1", dataSourceId: "parent" });
  });

  it("reuses the indexed page on re-run (no duplicate create)", async () => {
    const client = fake();
    const store = createIndexStore({ "digest:2026-06": { pageId: "p-existing", dataSourceId: "parent" } });
    await publishDigest(client, throttle, store, "parent", "2026-06", "x", "# again");
    expect(client.pages.create).not.toHaveBeenCalled();
    expect(client.pages.updateMarkdown).toHaveBeenCalledWith({ page_id: "p-existing", markdown: "# again" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/digest.test.ts`
Expected: FAIL — cannot find module `digest.js`.

- [ ] **Step 3: Write `lib/notion/digest.ts`**

```ts
import type { Throttle } from "./throttle.js";
import type { IndexStore } from "./index-store.js";

export interface DigestClient {
  pages: {
    create(args: Record<string, unknown>): Promise<{ id: string }>;
    updateMarkdown(args: { page_id: string; markdown: string }): Promise<unknown>;
  };
}

/** Create-or-reuse a Notion page for `period` under `parentPageId`, then (over)write its body. */
export async function publishDigest(
  client: DigestClient,
  throttle: Throttle,
  store: IndexStore,
  parentPageId: string,
  period: string,
  label: string,
  markdown: string,
): Promise<string> {
  const key = `digest:${period}`;
  let pageId = store.get(key)?.pageId;

  if (!pageId) {
    const created = await throttle(() =>
      client.pages.create({
        parent: { type: "page_id", page_id: parentPageId },
        properties: { title: { title: [{ text: { content: label } }] } },
      }),
    );
    pageId = created.id;
  }

  await throttle(() => client.pages.updateMarkdown({ page_id: pageId, markdown }));
  store.set(key, { pageId, dataSourceId: parentPageId }); // container id reused in the dataSourceId slot
  return pageId;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/digest.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `scripts/publish-digest.ts`**

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makeClient } from "../lib/notion/client.js";
import { createThrottle } from "../lib/notion/throttle.js";
import { readIndex, writeIndex, createIndexStore } from "../lib/notion/index-store.js";
import { publishDigest, type DigestClient } from "../lib/notion/digest.js";
import { buildMonthlyReview } from "../lib/reports/monthly.js";
import { gatherMonthlyInput } from "./build-report.js";
import { REPO_ROOT } from "../lib/sources/repo-io.js";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

async function main(): Promise<void> {
  const token = env("NOTION_TOKEN");
  const parent = env("NOTION_DIGEST_PAGE");
  if (!token || !parent) {
    console.log("pulse: NOTION_TOKEN or NOTION_DIGEST_PAGE unset — skipping digest page (graceful no-op).");
    return;
  }
  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const markdown = buildMonthlyReview(await gatherMonthlyInput(REPO_ROOT, period, now.toISOString()));
  const label = /^#\s+(.+)$/m.exec(markdown)?.[1] ?? `Monthly Review — ${period}`;

  const indexPath = path.join(REPO_ROOT, "projects/pulse/notion-index.json");
  const store = createIndexStore(await readIndex(indexPath));
  await publishDigest(makeClient(token) as unknown as DigestClient, createThrottle({ concurrency: 2 }), store, parent, period, label, markdown);
  await writeIndex(indexPath, store.snapshot());
  console.log("pulse: digest page published.");
}

const isMain = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((err: unknown) => { console.error(err); process.exitCode = 1; });
}
```

- [ ] **Step 6: Verify the no-op + commit**

Run (from `projects/pulse/`, no Notion env): `pnpm publish-digest`
Expected: prints `... unset — skipping digest page (graceful no-op).`, exit 0.

```bash
git add projects/pulse/lib/notion/digest.ts projects/pulse/scripts/publish-digest.ts projects/pulse/tests/unit/digest.test.ts
git commit -m "feat(pulse): Notion monthly digest page (closes L5)"
```

> **P2 code complete.** Live `pnpm sync-notion` / `pnpm export-tasks` / `pnpm publish-digest` runs require Anton's Task 12 setup (tokens + DB ids + Digests page). Once set, verify §10.2 manually: run `sync-notion` twice and confirm Notion shows no duplicate rows + `notion-index.json` is populated; run `export-tasks` and confirm `snapshots/tasks-snapshot.json` appears; run `publish-digest` and confirm a "Monthly Review — <month>" page appears under Digests.

---

# PHASE P3 — Automation

> Closes spec §10.3: `pulse.yml` runs on path-filtered push + cron + `workflow_dispatch`; concurrency queues (never cancels mid-write); `GITHUB_TOKEN` write-back causes no loop; nightly Tasks snapshot is committed; `last_synced_at` visible in Notion; a forced failure fires the notification.

## Task 22: GitHub Actions workflow (`.github/workflows/pulse.yml`) + structural test

Additive — `ci.yml` / `gbrain-ci.yml` untouched (L6). Three event-gated jobs (mirror / digest / snapshot) + a failure-notify job. The committed write-back targets (`notion-index.json`, `monthly-review.md`, `tasks-snapshot.json`) are **outside** the push `paths:` filter, so write-back cannot loop; `[skip ci]` is belt-and-suspenders.

**Files:**
- Create: `.github/workflows/pulse.yml`
- Test: `projects/pulse/tests/unit/workflow.test.ts`

- [ ] **Step 1: Write the failing structural test**

```ts
// tests/unit/workflow.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const yml = readFileSync(path.join(__dirname, "../../../../.github/workflows/pulse.yml"), "utf8");

describe("pulse.yml structural invariants (spec L6/§10.3)", () => {
  it("queues, never cancels in-progress (no partial writes)", () => {
    expect(yml).toMatch(/group:\s*pulse/);
    expect(yml).toMatch(/cancel-in-progress:\s*false/);
  });
  it("all crons run at :30 (off the top-of-hour peak)", () => {
    const crons = [...yml.matchAll(/cron:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
    expect(crons.length).toBeGreaterThanOrEqual(2);
    for (const c of crons) expect(c.startsWith("30 ")).toBe(true);
  });
  it("is push-triggered with a data-file path filter and workflow_dispatch", () => {
    expect(yml).toMatch(/workflow_dispatch:/);
    expect(yml).toMatch(/PROJECTS\.md/);
    expect(yml).toMatch(/docs\/decisions\//);
    expect(yml).toMatch(/lib\/__generated__/);
  });
  it("write-back commits carry [skip ci] (no self-trigger loop)", () => {
    expect(yml).toContain("[skip ci]");
  });
  it("uses two separate tokens (least-privilege)", () => {
    expect(yml).toContain("NOTION_TOKEN");
    expect(yml).toContain("NOTION_READ_TOKEN");
  });
  it("notifies on failure", () => {
    expect(yml).toMatch(/if:\s*failure\(\)/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/unit/workflow.test.ts`
Expected: FAIL — ENOENT `.github/workflows/pulse.yml`.

- [ ] **Step 3: Write `.github/workflows/pulse.yml`**

```yaml
name: pulse

# Additive automation for the pulse sub-project. ci.yml / gbrain-ci.yml are untouched.
#
# Injection safety: no user-controlled inputs are interpolated into any run: command.
# workflow_dispatch `task` is a constrained choice used only in if: expressions.
# Write-back targets (notion-index.json, monthly-review.md, tasks-snapshot.json) are
# outside the push paths filter, so GITHUB_TOKEN commits cannot re-trigger this workflow;
# [skip ci] is added as defense-in-depth.

on:
  push:
    branches: [main]
    paths:
      - 'PROJECTS.md'
      - 'STATE.md'
      - 'projects/*/STATE.md'
      - 'projects/*/CHANGELOG.md'
      - 'docs/decisions/**'
      - 'community/status/**'
      - 'community/events/**'
      - 'community/members/roster.md'
      - 'projects/community-platform/lib/__generated__/**'
      - '.github/workflows/pulse.yml'
  schedule:
    - cron: '30 9 1 * *'   # monthly digest — 1st of the month, 09:30 UTC
    - cron: '30 4 * * *'   # nightly Tasks snapshot — 04:30 UTC
  workflow_dispatch:
    inputs:
      task:
        description: 'Which job to run'
        type: choice
        options: [all, mirror, digest, snapshot]
        default: all

# Queue, never cancel — a cancelled run could leave Notion half-written.
concurrency:
  group: pulse
  cancel-in-progress: false

permissions:
  contents: write   # commit generated files back
  issues: write     # failure notification

jobs:
  mirror:
    name: Mirror context DBs → Notion
    if: >-
      github.event_name == 'push' ||
      (github.event_name == 'workflow_dispatch' && (inputs.task == 'mirror' || inputs.task == 'all'))
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # full history + tags (shipping parser cross-check)
      - uses: pnpm/action-setup@v4
        with: { version: 10, run_install: false }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: projects/pulse/pnpm-lock.yaml
      - name: Install
        working-directory: projects/pulse
        run: pnpm install --frozen-lockfile
      - name: Sync Notion
        working-directory: projects/pulse
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_DB_PROJECTS: ${{ secrets.NOTION_DB_PROJECTS }}
          NOTION_DB_DECISIONS: ${{ secrets.NOTION_DB_DECISIONS }}
          NOTION_DB_SHIPPING: ${{ secrets.NOTION_DB_SHIPPING }}
          NOTION_DB_ENGAGEMENT: ${{ secrets.NOTION_DB_ENGAGEMENT }}
          GITHUB_REPO_URL: ${{ github.server_url }}/${{ github.repository }}
        run: pnpm sync-notion
      - name: Commit index
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add projects/pulse/notion-index.json
          if git diff --cached --quiet; then
            echo "no index changes"
          else
            git commit -m "chore(pulse): update notion-index.json [skip ci]"
            git push
          fi

  digest:
    name: Monthly review digest
    if: >-
      (github.event_name == 'schedule' && github.event.schedule == '30 9 1 * *') ||
      (github.event_name == 'workflow_dispatch' && (inputs.task == 'digest' || inputs.task == 'all'))
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v4
        with: { version: 10, run_install: false }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: projects/pulse/pnpm-lock.yaml
      - name: Install
        working-directory: projects/pulse
        run: pnpm install --frozen-lockfile
      - name: Build monthly review
        working-directory: projects/pulse
        run: pnpm build-report --period=monthly
      - name: Publish digest to Notion
        working-directory: projects/pulse
        env:
          NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
          NOTION_DIGEST_PAGE: ${{ secrets.NOTION_DIGEST_PAGE }}
        run: pnpm publish-digest
      - name: Commit review
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add docs/playbooks/monthly-review.md projects/pulse/notion-index.json
          if git diff --cached --quiet; then
            echo "no review changes"
          else
            git commit -m "chore(pulse): monthly review [skip ci]"
            git push
          fi

  snapshot:
    name: Nightly Tasks snapshot
    if: >-
      (github.event_name == 'schedule' && github.event.schedule == '30 4 * * *') ||
      (github.event_name == 'workflow_dispatch' && (inputs.task == 'snapshot' || inputs.task == 'all'))
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10, run_install: false }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: projects/pulse/pnpm-lock.yaml
      - name: Install
        working-directory: projects/pulse
        run: pnpm install --frozen-lockfile
      - name: Export Tasks
        working-directory: projects/pulse
        env:
          NOTION_READ_TOKEN: ${{ secrets.NOTION_READ_TOKEN }}
          NOTION_DB_TASKS: ${{ secrets.NOTION_DB_TASKS }}
        run: pnpm export-tasks
      - name: Commit snapshot
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add projects/pulse/snapshots/tasks-snapshot.json
          if git diff --cached --quiet; then
            echo "no snapshot changes"
          else
            git commit -m "chore(pulse): nightly Tasks snapshot [skip ci]"
            git push
          fi

  notify-failure:
    name: Notify on failure
    needs: [mirror, digest, snapshot]
    if: failure()
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read
    steps:
      - name: Open or comment a failure issue
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RUN_URL: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
        run: |
          title="pulse: workflow run failed"
          existing=$(gh issue list --repo "$GITHUB_REPOSITORY" --search "$title in:title state:open" --json number --jq '.[0].number // empty')
          if [ -n "$existing" ]; then
            gh issue comment "$existing" --repo "$GITHUB_REPOSITORY" --body "Another failed pulse run: $RUN_URL"
          else
            gh issue create --repo "$GITHUB_REPOSITORY" --title "$title" --body "A pulse run failed. Logs: $RUN_URL"
          fi
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/unit/workflow.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Validate the YAML parses**

Run (from repo root): `pnpm dlx js-yaml .github/workflows/pulse.yml > /dev/null && echo "yaml ok"`
Expected: prints `yaml ok` (no parse error).

- [ ] **Step 6: Full pulse suite**

Run (from `projects/pulse/`): `pnpm tsc --noEmit && pnpm lint && pnpm test:coverage`
Expected: all green; coverage ≥80% on `lib/**`.

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/pulse.yml projects/pulse/tests/unit/workflow.test.ts
git commit -m "feat(pulse): GitHub Actions automation (mirror + digest + snapshot, P3 complete)"
```

- [ ] **Step 8: Live smoke (after Anton's Task 12 setup; §10.3)**

1. Push a trivial change to a data file (e.g. touch a `STATE.md`) → confirm the `mirror` job runs and Notion shows `last_synced_at` updated; confirm the `notion-index.json` write-back commit carries `[skip ci]` and does NOT re-trigger the workflow.
2. `gh workflow run pulse.yml -f task=digest` → confirm `docs/playbooks/monthly-review.md` is committed.
3. `gh workflow run pulse.yml -f task=snapshot` → confirm `projects/pulse/snapshots/tasks-snapshot.json` is committed.
4. Temporarily set a bad `NOTION_TOKEN` and dispatch `task=mirror` → confirm the `notify-failure` job opens a "pulse: workflow run failed" issue. Restore the token.

---

## Phase closeout (per-phase doc updates)

At each phase boundary, in the same commit as the final task:

- **After P1:** set `projects/pulse/STATE.md` → "What just happened: P1 shipped (parsers + monthly review)"; add a `## [0.1.0]` entry to `projects/pulse/CHANGELOG.md`; update the `PROJECTS.md` pulse row → "Building — P1 shipped, P2 next".
- **After P2:** `STATE.md` → "P2 shipped (Notion mirror + Tasks export + digest page); live runs pending Anton's Notion setup (SETUP.md)"; `CHANGELOG.md` `## [0.2.0]`; `PROJECTS.md` row Next gate → "P3 automation".
- **After P3:** `STATE.md` → "P3 shipped (workflow live)"; `CHANGELOG.md` `## [0.3.0]`; `PROJECTS.md` row Status → "Live"; flip the **root** `STATE.md` "Hot now" to note pulse shipped. No ADR required (sub-project build, not a governance/reversibility decision — the design spec is the contract). Open a PR per the repo's PR policy for code touching CI-triggered paths.

---

## Self-review (run against the spec)

**1. Spec coverage** — every spec element maps to a task:

| Spec | Tasks |
|---|---|
| L1 standalone + deps + reads committed JSON | T1, T9 |
| L2 split SoT / two one-way flows | T17 (mirror) + T18/T20 (export) |
| L3 5 DBs + two integrations least-privilege | T12 (setup) + T16/T17 (mirror) + T18 (export, write-incapable) |
| L4 v5 `data_source_id` + upsert + index + p-limit + backoff | T13, T14, T15, T17 |
| L5 monthly review → markdown **+ Notion digest page** | T10, T11 (markdown) + **T21 (digest page — gap found in self-review, task added)** |
| L6 additive workflow, path filter, `:30` crons, `workflow_dispatch`, concurrency-no-cancel, `GITHUB_TOKEN` + `[skip ci]` | T22 |
| L7 two scoped tokens + DB id secrets | T12, T22 |
| L8 Zod fail-fast + `last_synced_at` + overwrite + graceful no-op | T2 + every parser + T16 + T17 + T19/T20/T21 |
| L9 nightly read-only Tasks backup | T18, T20, T22 |
| L10 setup runbook | T12 |
| L11 phasing P1→P2→P3 | section structure |
| §2 component design | T2–T21 (one file per unit) |
| §3 schemas + O3 field types | T16 (locked) + T12 (setup) |
| §5 TDD + ≥80% coverage on `lib/` | T1 config + per-task tests |
| §10.1 / §10.2 / §10.3 success criteria | T11 / T17+T19+T20 / T22 |

**2. Placeholder scan** — no `TBD`/`implement later`/"add error handling"/"similar to Task N"/"write tests for the above". Every code step contains complete, compilable code; every test step contains real assertions.

**3. Type consistency** — names verified across tasks: `Project/Adr/Release/Engagement/Driver/RepoState/Member` (T2) used identically in parsers + mappers; `Member.slug` added in T2 and consumed in T9; `Release` has no `tagged` field (dropped in T2; `parseTagSet` is a separate pure helper in T8); `MappedRow` (T16) consumed by `upsertRow`/`upsertMany` (T17) and `runSync` (T19); `MirrorClient`/`ExportClient`/`RetrievableClient`/`QueryResult` (T13) used by T17/T18/T19/T20; `Throttle` (T14), `IndexStore`/`NotionIndex`/`IndexEntry` (T15), `DigestClient` (T21), `gatherMonthlyInput` (T11) reused by T21. Notion property payloads use the v5 `parent: { type: "data_source_id", data_source_id }` create shape (L4) and the `External ID` rich_text filter consistently.

**Coverage note:** `scripts/*` are excluded from the coverage `include` (only `lib/**` is gated), but each script's testable core (`gatherMonthlyInput`, `runSync`, `runTaskExport`) has an integration test, and every `lib/**` module has a unit test — so the ≥80% `lib/` gate is met without chasing CLI-glue coverage.

---

## Execution handoff

**Plan complete and saved to `docs/specs/2026-06-09-pulse-implementation-plan.md`.** 22 tasks across P1 (1–11), P2 (12–21), P3 (22).

Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration (`superpowers:subagent-driven-development`). Best fit here: tasks are small and independent within a phase.
2. **Inline Execution** — execute tasks in this session with checkpoints (`superpowers:executing-plans`).

Per the founder's instruction, build **Phase 1 only** first (Tasks 1–11 — repo parsers + monthly review, zero Notion dependency), then pause for review before P2/P3. P2/P3 *code* needs no live Notion; only live *runs* depend on Anton completing `SETUP.md` (Task 12).
