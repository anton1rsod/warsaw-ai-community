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

  // FIX 1: bind const after narrowing so the closure sees string, not string | undefined
  const resolvedPageId: string = pageId;
  await throttle(() => client.pages.updateMarkdown({ page_id: resolvedPageId, markdown }));
  store.set(key, { pageId: resolvedPageId, dataSourceId: parentPageId });
  return resolvedPageId;
}
