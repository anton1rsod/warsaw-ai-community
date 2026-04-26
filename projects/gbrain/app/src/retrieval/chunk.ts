import { createHash } from "node:crypto";

const CHUNK_CHARS = 1920;       // ~480 tokens at 4 chars/tok
const OVERLAP_CHARS = 200;      // ~50 tokens

export interface Chunk {
  content: string;              // trimmed UTF-8
  hash: string;                 // sha256 hex of content
  lineRange: [number, number];  // 1-indexed line numbers in source file
}

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/;

export function chunkMarkdown(source: string): Chunk[] {
  // Strip YAML frontmatter
  const fm = source.match(FRONTMATTER_RE);
  const body = fm ? source.slice(fm[0].length) : source;
  const fmLineCount = fm ? fm[0].split("\n").length - 1 : 0;

  const lineForBodyIndex = (idx: number): number => {
    let n = 0;
    for (let i = 0; i < idx && i < body.length; i++) {
      if (body[i] === "\n") n++;
    }
    return fmLineCount + 1 + n;
  };

  if (body.trim().length === 0) return [];

  const chunks: Chunk[] = [];
  let pos = 0;
  while (pos < body.length) {
    const end = Math.min(pos + CHUNK_CHARS, body.length);
    const window = body.slice(pos, end);
    const trimmed = window.trim();
    if (trimmed.length > 0) {
      const hash = createHash("sha256").update(trimmed, "utf8").digest("hex");
      chunks.push({
        content: trimmed,
        hash,
        lineRange: [lineForBodyIndex(pos), lineForBodyIndex(end - 1)]
      });
    }
    if (end >= body.length) break;
    pos = end - OVERLAP_CHARS;
    if (pos <= 0) pos = end;
  }
  return chunks;
}
