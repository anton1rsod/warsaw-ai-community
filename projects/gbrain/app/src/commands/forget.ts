import type { GithubStore } from "../store/index";

export interface ForgetInput {
  authorId: number;
  isCoreOrganizer: boolean;
  messageText: string;
  store: GithubStore;
  ownerOfPath: (path: string) => Promise<number | null>;
}

export interface CommandResult {
  ok: boolean;
  reason?: string;
}

const ARCHIVE_PATH_RE = /community\/archive\/[^\s)]+\.md/;

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
  return { ok: true };
}
