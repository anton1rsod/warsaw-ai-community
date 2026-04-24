import type { AuthorPreferences } from "../types";

export interface PreferencesStore {
  get(authorId: number): Promise<AuthorPreferences>;
  optOut(authorId: number): Promise<void>;
  optIn(authorId: number): Promise<void>;
}

export function createInMemoryPreferences(): PreferencesStore {
  const state = new Map<number, AuthorPreferences>();
  const touch = (authorId: number, optedOut: boolean) => {
    state.set(authorId, { authorId, optedOut, updatedAt: new Date() });
  };
  return {
    async get(authorId) {
      return state.get(authorId) ?? { authorId, optedOut: false, updatedAt: new Date(0) };
    },
    async optOut(authorId) {
      touch(authorId, true);
    },
    async optIn(authorId) {
      touch(authorId, false);
    }
  };
}
