/**
 * In-memory mock for persona content. Active only when
 * NEXT_PUBLIC_E2E_MODE === "1" AND NODE_ENV !== "production".
 * State on globalThis for the Next 16 "use server" bundling split.
 */
interface MockPersonaShared {
  personas: Map<string, string>; // slug -> .public.md content
}
const G = globalThis as { __waicMockPersonaStore?: MockPersonaShared };
function shared(): MockPersonaShared {
  if (!G.__waicMockPersonaStore) G.__waicMockPersonaStore = { personas: new Map() };
  return G.__waicMockPersonaStore;
}
export const mockPersonaStore = {
  get(slug: string): string | null {
    return shared().personas.get(slug) ?? null;
  },
  write(slug: string, content: string): void {
    shared().personas.set(slug, content);
  },
  remove(slug: string): void {
    shared().personas.delete(slug);
  },
  reset(): void {
    shared().personas.clear();
  },
};
