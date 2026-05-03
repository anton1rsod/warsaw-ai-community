/**
 * Cookie name shared between the consent action layer (`app/actions/consent.ts`)
 * and the proxy gate (`proxy.ts`). Lives in `lib/` (not in a `"use server"`
 * file) because Next 16 requires `"use server"` modules to export only async
 * functions — exporting a string constant from there blocks the whole module
 * from importing.
 *
 * Locked per execution-plan §6.4 risk: any drift between the two consumers
 * will either trap consented users in a /consent redirect loop or admit
 * unconsented ones to /home.
 */
export const CONSENT_COOKIE = "waic-consented";
