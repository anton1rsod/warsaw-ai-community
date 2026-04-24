import type { PreferencesStore } from "../consent/preferences";

export interface OptInput {
  authorId: number;
  prefs: PreferencesStore;
}
export interface CommandResult {
  ok: boolean;
  reason?: string;
}

export async function handleOptOut(input: OptInput): Promise<CommandResult> {
  await input.prefs.optOut(input.authorId);
  return { ok: true };
}

export async function handleOptIn(input: OptInput): Promise<CommandResult> {
  await input.prefs.optIn(input.authorId);
  return { ok: true };
}
