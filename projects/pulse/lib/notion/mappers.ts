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
