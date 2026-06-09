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
