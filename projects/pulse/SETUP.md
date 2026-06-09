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

## 8. Appendix — exact DB schema as DDL (scripted recreation)
The 5 databases were first built via the claude.ai Notion connector. The schema is **account-independent** — to recreate on a new workspace: authorize the connector (`/mcp` → "claude.ai Notion") against that workspace, create a parent page ("Pulse — Warsaw AI"), then create each DB **under that page** with the DDL below, then create a plain "Digests" page under it. Finally regenerate `.env.local` with the new database/page ids (the ids are workspace-specific; the schema is not). Property names/types must stay matched to `lib/notion/mappers.ts`.

```sql
-- Projects
CREATE TABLE ("Name" TITLE, "Status" SELECT('Proposed':gray, 'In design':blue, 'Building':yellow, 'Live':green, 'Archived':default), "DRI" SELECT('Anton':blue, 'Yuriy':orange), "Version" RICH_TEXT, "Current focus" RICH_TEXT, "Next gate" RICH_TEXT, "Repo path" RICH_TEXT, "External ID" RICH_TEXT, "last_synced_at" DATE)
-- Decisions
CREATE TABLE ("ADR" TITLE, "Title" RICH_TEXT, "Status" SELECT('Proposed':gray, 'Accepted':green, 'Superseded':orange, 'Deprecated':red, 'Rejected':default), "Date" DATE, "Link" URL, "External ID" RICH_TEXT, "last_synced_at" DATE)
-- Shipping Log
CREATE TABLE ("Version" TITLE, "Project" SELECT('community-platform':blue, 'gbrain':green, 'pulse':purple, 'persona-builder':pink), "Date" DATE, "Summary" RICH_TEXT, "External ID" RICH_TEXT, "last_synced_at" DATE)
-- Engagement
CREATE TABLE ("Member" TITLE, "Contributions" NUMBER, "Kudos" NUMBER, "Status streak" NUMBER, "Events attended" NUMBER, "External ID" RICH_TEXT, "last_synced_at" DATE)
-- Tasks (human-owned; pulse only snapshots it — schema is illustrative, adjust freely)
CREATE TABLE ("Name" TITLE, "Status" STATUS, "Assignee" PEOPLE, "Priority" SELECT('High':red, 'Medium':yellow, 'Low':green), "Due" DATE)
```

> `External ID` (rich_text) is the idempotency key; `last_synced_at` (date) is overwritten each sync. Selects auto-extend on write, so option lists need not be exhaustive. Connect `pulse-mirror` to the 4 context DBs + Digests page, `pulse-export` to Tasks only (§4).
