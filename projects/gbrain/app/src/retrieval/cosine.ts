import type { IndexEntry } from "./schema";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`vector length mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface RankedEntry {
  entry: IndexEntry;
  score: number;
}

export function topK(query: number[], entries: IndexEntry[], k: number): RankedEntry[] {
  const scored: RankedEntry[] = entries.map((entry) => ({
    entry,
    score: cosineSimilarity(query, entry.embedding)
  }));
  scored.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    return x.entry.id.localeCompare(y.entry.id);
  });
  return scored.slice(0, k);
}
