/**
 * Runtime environment predicate used by the E2E mock-store double-guard
 * pattern: `!isProductionRuntime() && isE2EMode()`. Returns true on
 * `next start` / Vercel production runtime, false in `next dev` / `next
 * test` / preview / local. The pair is the second half of the chat-48
 * v0.9.1 E2E mock-fork safety contract — even if NEXT_PUBLIC_E2E_MODE
 * leaks into a production bundle, the runtime guard short-circuits the
 * fork before any mock store is touched.
 *
 * Extracted from 4 local copies (rsvp-event.ts, thank-status.ts,
 * status.ts, event-rsvp-state/route.ts) post-v0.9.1 ship per the
 * chat-49 followup. The four local copies were sanctioned by the v0.9.1
 * plan to land the feature atomically; this is the planned DRY pass.
 */
export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}
