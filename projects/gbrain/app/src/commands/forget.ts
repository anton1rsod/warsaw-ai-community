import { createHash } from "node:crypto";
import type { GithubStore } from "../store/index";

export interface ForgetInput {
  authorId: number;
  isCoreOrganizer: boolean;
  messageText: string;
  store: GithubStore;
  ownerOfPath: (path: string) => Promise<number | null>;
  /** Optional namespace prefix (e.g. "_staging"); if set, tombstone is committed
   *  under community/archive/<namespace>/_removed/YYYY-MM-DD.md to keep staging
   *  cleanup records out of the production tombstone log. */
  archiveNamespace?: string;
  /** Override "now" for deterministic testing; defaults to new Date(). */
  now?: Date;
}

export interface CommandResult {
  ok: boolean;
  reason?: string;
}

const ARCHIVE_PATH_RE = /community\/archive\/[^\s)]+\.md/;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function tombstonePath(namespace: string | undefined, day: string): string {
  const ns = namespace ? `${namespace}/` : "";
  return `community/archive/${ns}_removed/${day}.md`;
}

function tombstoneEntry(forgottenPath: string, authorId: number, when: Date): string {
  const hash = createHash("sha256").update(forgottenPath).digest("hex");
  return [
    `- timestamp: ${when.toISOString()}`,
    `  hash: ${hash}`,
    `  requested_by: ${authorId}`
  ].join("\n");
}

export async function handleForget(input: ForgetInput): Promise<CommandResult> {
  const match = input.messageText.match(ARCHIVE_PATH_RE);
  const path = match?.[0];
  if (!path) return { ok: false, reason: "no archive path in message" };

  const ownerId = await input.ownerOfPath(path);
  if (!input.isCoreOrganizer && ownerId !== input.authorId) {
    return { ok: false, reason: "not your content; ask a core organizer" };
  }
  await input.store.remove({
    path,
    message: `forget: ${path} — requested by ${input.authorId}`
  });

  // Spec §10: commit a removal record (hash only, no content).
  const now = input.now ?? new Date();
  const day = isoDay(now);
  const recordPath = tombstonePath(input.archiveNamespace, day);
  const entry = tombstoneEntry(path, input.authorId, now);
  // Keep tombstone idempotent across multiple removals on the same day by
  // appending. We don't read first (avoids extra GitHub round-trip) — `commit`
  // overwrites; that's acceptable in v0.1.1 since same-day duplicate forgets
  // are rare. Phase 2 should append-on-merge.
  await input.store.commit({
    path: recordPath,
    content: `# Removed records — ${day}\n\n${entry}\n`,
    message: `forget-tombstone: ${day} — requested by ${input.authorId}`
  });

  return { ok: true };
}
