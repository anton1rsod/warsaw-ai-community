import type { Throttle } from "./throttle.js";
import type { IndexStore } from "./index-store.js";

export interface DigestClient {
  pages: {
    create(args: Record<string, unknown>): Promise<{ id: string }>;
    // Mirrors @notionhq/client v5 `pages.updateMarkdown`: the body is a discriminated
    // union (no top-level `markdown` field). `replace_content` overwrites the page body.
    updateMarkdown(args: {
      page_id: string;
      type: "replace_content";
      replace_content: { new_str: string; allow_deleting_content?: boolean };
    }): Promise<unknown>;
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

  // bind const after narrowing so the closure sees string, not string | undefined
  const resolvedPageId: string = pageId;
  await throttle(() =>
    client.pages.updateMarkdown({
      page_id: resolvedPageId,
      type: "replace_content",
      replace_content: { new_str: markdown, allow_deleting_content: true },
    }),
  );
  store.set(key, { pageId: resolvedPageId, dataSourceId: parentPageId });
  return resolvedPageId;
}
