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
  const sorted = Object.fromEntries(Object.keys(index).sort().map((k) => [k, index[k]]));
  await writeFile(absPath, JSON.stringify(sorted, null, 2) + "\n", "utf8");
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
