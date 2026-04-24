import type { PendingStore } from "../pending/index";

export interface ConfirmInput {
  decision: "yes" | "no";
  entryId: string;
  pending: PendingStore;
}

export interface CommandResult {
  ok: boolean;
  action: "committed-on-flush" | "cancelled" | "unknown";
}

export async function handleConfirm(input: ConfirmInput): Promise<CommandResult> {
  if (input.decision === "no") {
    input.pending.cancel(input.entryId);
    return { ok: true, action: "cancelled" };
  }
  // "yes" leaves the entry in place; flush job will commit it.
  const present = input.pending.all().some((e) => e.id === input.entryId);
  return present
    ? { ok: true, action: "committed-on-flush" }
    : { ok: false, action: "unknown" };
}
