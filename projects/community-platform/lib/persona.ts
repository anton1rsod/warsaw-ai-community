import { parseMarkdown } from "./markdown";

export type Depth = "expert" | "practitioner" | "familiar";

export interface PersonaTag {
  label: string;
  depth: Depth | null;
}

export interface PersonaTags {
  industries: PersonaTag[];
  functionalRoles: PersonaTag[];
  companyStages: PersonaTag[];
  niche: string[];
}

export interface ParsedPersona {
  languages: string[];
  tags: PersonaTags;
  /** Full markdown body with the `## Tags` block removed (chips replace it). */
  body: string;
}

const DEPTHS: ReadonlySet<string> = new Set(["expert", "practitioner", "familiar"]);

/** Slice the body into top-level `## ` sections keyed by heading text. */
function splitH2Sections(body: string): Map<string, string> {
  const out = new Map<string, string>();
  const heads = [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => ({
    title: (m[1] ?? "").trim(),
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));
  for (let i = 0; i < heads.length; i += 1) {
    const h = heads[i];
    if (!h) continue;
    const next = heads[i + 1];
    out.set(h.title, body.slice(h.end, next ? next.start : body.length));
  }
  return out;
}

/** Parse `- label — depth` list items under a `### ` subsection of the Tags block. */
function parseTagSubsection(tagsBody: string, subTitle: string): PersonaTag[] {
  const re = new RegExp(`^###\\s+${escapeRe(subTitle)}\\s*$`, "m");
  const start = tagsBody.search(re);
  if (start === -1) return [];
  const afterHeading = tagsBody.slice(start).replace(re, "");
  const nextSub = afterHeading.search(/^###\s+/m);
  const block = nextSub === -1 ? afterHeading : afterHeading.slice(0, nextSub);
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => {
      const item = l.slice(2).trim();
      const [labelPart, depthPart] = splitOnEmDash(item);
      const depth = depthPart && DEPTHS.has(depthPart) ? (depthPart as Depth) : null;
      return { label: labelPart, depth };
    });
}

function parseNiche(tagsBody: string): string[] {
  const re = /^###\s+Niche expertise\s*$/m;
  const start = tagsBody.search(re);
  if (start === -1) return [];
  const afterHeading = tagsBody.slice(start).replace(re, "");
  const nextSub = afterHeading.search(/^###\s+/m);
  const block = nextSub === -1 ? afterHeading : afterHeading.slice(0, nextSub);
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim())
    .filter((l) => l.length > 0);
}

function splitOnEmDash(item: string): [string, string | null] {
  const idx = item.indexOf("—");
  if (idx === -1) return [item.trim(), null];
  return [item.slice(0, idx).trim(), item.slice(idx + 1).trim()];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePersona(src: string): ParsedPersona {
  const { data, body } = parseMarkdown(src);
  const langRaw = (data as Record<string, unknown>).languages;
  const languages = Array.isArray(langRaw) ? langRaw.map(String) : [];

  const sections = splitH2Sections(body);
  const tagsBody = sections.get("Tags") ?? "";

  const tags: PersonaTags = {
    industries: parseTagSubsection(tagsBody, "Industries"),
    functionalRoles: parseTagSubsection(tagsBody, "Functional roles"),
    companyStages: parseTagSubsection(tagsBody, "Company stages"),
    niche: parseNiche(tagsBody),
  };

  const strippedBody = stripTagsSection(body);
  return { languages, tags, body: strippedBody };
}

function stripTagsSection(body: string): string {
  const re = /^##\s+Tags\s*$/m;
  const start = body.search(re);
  if (start === -1) return body.trim();
  const after = body.slice(start).replace(re, "");
  const nextH2 = after.search(/^##\s+/m);
  const tail = nextH2 === -1 ? "" : after.slice(nextH2);
  return (body.slice(0, start) + tail).replace(/\n{3,}/g, "\n\n").trim();
}
