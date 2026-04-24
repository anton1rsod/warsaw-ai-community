import type { PreferencesStore } from "../consent/preferences";

export interface StatusInput {
  authorId: number;
  prefs: PreferencesStore;
}
export interface StatusResult {
  optedOut: boolean;
  message: string;
}

export async function handleStatus(input: StatusInput): Promise<StatusResult> {
  const p = await input.prefs.get(input.authorId);
  const msg = p.optedOut
    ? "You are opted out of GBrain. Nothing you post can be archived. Use /gbrain-optin to reverse."
    : "You are opted in. Messages in formal topics are archive-eligible (48h #skip window). Casual topics require your confirmation per message.";
  return { optedOut: p.optedOut, message: msg };
}
