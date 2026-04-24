export interface PendingEntry {
  id: string;
  messagePath: string; // target archive path
  content: string; // markdown to commit
  commitMessage: string;
  enqueuedAt: Date;
  // NOTE: In-memory store — acceptable for v0.1; migrate to Vercel KV in Phase 2.
}

const RELEASE_MS = 48 * 60 * 60 * 1000;

export interface PendingStore {
  enqueue(entry: PendingEntry): void;
  cancel(id: string): void;
  remove(id: string): void;
  listReady(now: Date): PendingEntry[];
  all(): PendingEntry[];
}

export function createInMemoryPendingStore(): PendingStore {
  const entries = new Map<string, PendingEntry>();
  return {
    enqueue(entry) {
      entries.set(entry.id, entry);
    },
    cancel(id) {
      entries.delete(id);
    },
    remove(id) {
      entries.delete(id);
    },
    listReady(now) {
      return [...entries.values()].filter(
        (e) => now.getTime() - e.enqueuedAt.getTime() >= RELEASE_MS
      );
    },
    all() {
      return [...entries.values()];
    }
  };
}
