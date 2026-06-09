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
