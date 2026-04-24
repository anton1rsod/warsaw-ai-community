import type { ParsedMessage, ConsentDecision, AuthorPreferences } from "../types";

export interface EvaluateInput {
  message: ParsedMessage;
  prefs: AuthorPreferences;
  taggerIsAuthor: boolean;
  now: Date;
}

const DEFER_MS = 48 * 60 * 60 * 1000;

export function evaluate(input: EvaluateInput): ConsentDecision {
  const { message, prefs, taggerIsAuthor, now } = input;

  if (prefs.optedOut) {
    return { kind: "deny", reason: "author opted out via /gbrain-optout" };
  }

  if (message.tags.has("skip")) {
    return { kind: "deny", reason: "message tagged #skip" };
  }

  if (message.topicId === null) {
    return { kind: "deny", reason: "unknown topic" };
  }

  const kbTagged = message.tags.has("kb") || message.tags.has("archive");

  if (message.topicClass === "formal") {
    if (kbTagged) return { kind: "allow", reason: "formal topic + #kb (immediate)" };
    return {
      kind: "defer_48h",
      reason: "formal topic pre-consent; #skip window open",
      deferUntil: new Date(now.getTime() + DEFER_MS)
    };
  }

  // casual topic
  if (!kbTagged) return { kind: "deny", reason: "casual topic + no archive tag" };
  if (taggerIsAuthor) return { kind: "allow", reason: "casual topic + #kb + author is tagger" };
  return {
    kind: "require_confirm",
    reason: "casual topic + #kb + third-party tagger",
    confirmFrom: message.raw.from.id
  };
}
