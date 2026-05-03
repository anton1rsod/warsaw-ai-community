/**
 * §6.1 storage classification rule.
 * Durable / audit-worthy → git. Ephemeral / social / high-frequency → DB or KV.
 * v0.1: dormant (all data is git). v0.2+: live policy. New data kinds require ADR.
 */

export type DataKind =
  | "roster"
  | "adr"
  | "meeting_note"
  | "project_spec"
  | "persona"
  | "profile_prose"
  | "status_update"
  | "session_token"
  | "draft"
  | "rate_limit_counter"
  | "ephemeral_notification"
  | "search_index"
  | "high_frequency_reaction";

export type Classification = "git" | "db_or_kv";

const GIT_KINDS: ReadonlySet<DataKind> = new Set([
  "roster",
  "adr",
  "meeting_note",
  "project_spec",
  "persona",
  "profile_prose",
  "status_update",
]);

const DB_OR_KV_KINDS: ReadonlySet<DataKind> = new Set([
  "session_token",
  "draft",
  "rate_limit_counter",
  "ephemeral_notification",
  "search_index",
  "high_frequency_reaction",
]);

export function classifyData(kind: DataKind): Classification {
  if (GIT_KINDS.has(kind)) return "git";
  if (DB_OR_KV_KINDS.has(kind)) return "db_or_kv";
  throw new Error(
    `Unknown data kind '${kind}'. New kinds require an ADR per spec §6.1 before classification.`,
  );
}
