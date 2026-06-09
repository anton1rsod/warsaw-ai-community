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
