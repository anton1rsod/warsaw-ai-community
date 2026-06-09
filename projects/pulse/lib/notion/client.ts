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
  return sources[0]!.id; // length checked === 1 above
}
