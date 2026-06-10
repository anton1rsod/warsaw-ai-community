/**
 * v0.12 — split a tag-stripped persona body (ParsedPersona.body) into the
 * known persona-builder heading skeleton (design doc §4.1).
 *
 * H148 posture: this parser NEVER throws and NEVER drops content. Anything
 * that doesn't match the known skeleton lands verbatim (original order) in
 * `unrecognized`, which the page renders as .prose-warm markdown exactly as
 * pre-v0.12. All-null + everything-in-unrecognized is a valid result.
 */

export interface PersonaSections {
  oneLineBio: string | null;
  careerArc: string | null;
  hardWonKnowledge: string | null;
  recurringPatterns: string | null;
  bullish: string | null;
  skeptical: string | null;
  failurePatterns: string | null;
  successPatterns: string | null;
  firstQuestion: string | null;
  buyerContexts: string | null;
  builderContexts: string | null;
  competitorContexts: string | null;
  verifiableEvidence: string | null;
  unrecognized: string;
}

type NarrativeKey = Exclude<keyof PersonaSections, "unrecognized">;

/**
 * Normalize a heading for comparison: lowercase, typographic apostrophe
 * (U+2019) → ASCII apostrophe, collapse whitespace runs. Production
 * .public.md files write "I've" with U+2019.
 */
function normalizeHeading(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** H2 sections captured as a single whole-section string. */
const WHOLE_SECTION_MAP: ReadonlyMap<string, NarrativeKey> = new Map<
  string,
  NarrativeKey
>([["verifiable evidence", "verifiableEvidence"]]);

/** Recognized container H2s → their H3 subsection → field maps. */
const H3_MAPS: ReadonlyMap<string, ReadonlyMap<string, NarrativeKey>> = new Map<
  string,
  ReadonlyMap<string, NarrativeKey>
>([
  [
    "background",
    new Map<string, NarrativeKey>([
      ["one-line bio", "oneLineBio"],
      ["career arc", "careerArc"],
      ["domains of hard-won knowledge", "hardWonKnowledge"],
      ["recurring patterns i see", "recurringPatterns"],
    ]),
  ],
  [
    "evaluation posture",
    new Map<string, NarrativeKey>([
      ["what makes me bullish", "bullish"],
      ["what makes me skeptical", "skeptical"],
      ["patterns of failure i've seen recur", "failurePatterns"],
      ["patterns of success i've seen recur", "successPatterns"],
      ["my typical first question", "firstQuestion"],
    ]),
  ],
  [
    "role dispositions",
    new Map<string, NarrativeKey>([
      ["buyer contexts", "buyerContexts"],
      ["builder contexts", "builderContexts"],
      // The slash IS part of the production heading.
      ["competitor / substitute contexts", "competitorContexts"],
    ]),
  ],
]);

interface Heading {
  readonly title: string;
  readonly start: number;
  readonly contentStart: number;
}

function matchHeadings(src: string, re: RegExp): Heading[] {
  return [...src.matchAll(re)].map((m) => ({
    /* v8 ignore next 3 -- noUncheckedIndexedAccess: capture group + index always defined in matchAll */
    title: (m[1] ?? "").trim(),
    start: m.index ?? 0,
    contentStart: (m.index ?? 0) + m[0].length,
  }));
}

export function parsePersonaSections(strippedBody: string): PersonaSections {
  const acc: PersonaSections = {
    oneLineBio: null,
    careerArc: null,
    hardWonKnowledge: null,
    recurringPatterns: null,
    bullish: null,
    skeptical: null,
    failurePatterns: null,
    successPatterns: null,
    firstQuestion: null,
    buyerContexts: null,
    builderContexts: null,
    competitorContexts: null,
    verifiableEvidence: null,
    unrecognized: "",
  };
  const unrecognizedParts: string[] = [];

  const h2s = matchHeadings(strippedBody, /^##\s+(.+?)\s*$/gm);

  // Preamble = everything before the first H2. Drop the leading "# Name" H1
  // line; any H1-level leftovers go to `unrecognized` verbatim.
  const preambleEnd = h2s[0]?.start ?? strippedBody.length;
  const preamble = strippedBody
    .slice(0, preambleEnd)
    .replace(/^#\s+[^\n]*$/m, "");
  if (preamble.trim() !== "") unrecognizedParts.push(preamble.trim());

  for (let i = 0; i < h2s.length; i += 1) {
    const h2 = h2s[i];
    /* v8 ignore next -- noUncheckedIndexedAccess: array iterated by own bounds */
    if (!h2) continue;
    const next = h2s[i + 1];
    const sectionEnd = next ? next.start : strippedBody.length;
    const content = strippedBody.slice(h2.contentStart, sectionEnd);
    const norm = normalizeHeading(h2.title);

    const wholeKey = WHOLE_SECTION_MAP.get(norm);
    if (wholeKey) {
      const trimmed = content.trim();
      acc[wholeKey] = trimmed === "" ? null : trimmed;
      continue;
    }

    const subMap = H3_MAPS.get(norm);
    if (!subMap) {
      // Unknown H2 → unrecognized verbatim (heading line + content).
      unrecognizedParts.push(strippedBody.slice(h2.start, sectionEnd).trim());
      continue;
    }

    // Recognized container H2 → split content into H3 subsections.
    const h3s = matchHeadings(content, /^###\s+(.+?)\s*$/gm);
    const preH3End = h3s[0]?.start ?? content.length;
    const preH3 = content.slice(0, preH3End);
    if (preH3.trim() !== "") unrecognizedParts.push(preH3.trim());

    for (let j = 0; j < h3s.length; j += 1) {
      const h3 = h3s[j];
      /* v8 ignore next -- noUncheckedIndexedAccess: array iterated by own bounds */
      if (!h3) continue;
      const nextH3 = h3s[j + 1];
      const subEnd = nextH3 ? nextH3.start : content.length;
      const key = subMap.get(normalizeHeading(h3.title));
      if (key) {
        const sub = content.slice(h3.contentStart, subEnd).trim();
        acc[key] = sub === "" ? null : sub;
      } else {
        // Unknown H3 inside a recognized H2 → unrecognized (lossless).
        unrecognizedParts.push(content.slice(h3.start, subEnd).trim());
      }
    }
  }

  return { ...acc, unrecognized: unrecognizedParts.join("\n\n") };
}
