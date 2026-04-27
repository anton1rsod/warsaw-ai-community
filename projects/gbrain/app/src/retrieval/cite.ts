/**
 * Validates citation markers in `text` against the in-context excerpt
 * id range [1..maxId]. Out-of-range or zero ids are replaced with the
 * literal "(citation pruned)". Malformed tags are left as literal text.
 *
 * Per spec §6.1 — defense against citation hallucination.
 */
export function validateAndPruneCitations(text: string, maxId: number): string {
  const citationRe = /<citation\s+id="(\d+)"\s*\/>/gi;
  return text.replace(citationRe, (match, idStr: string) => {
    const id = Number.parseInt(idStr, 10);
    if (id >= 1 && id <= maxId) return match;
    return "(citation pruned)";
  });
}

export interface BlobLinkInput {
  owner: string;
  repo: string;
  branch: string;
  sourcePath: string;
  lineRange: [number, number];
}

export function buildGitHubBlobLink(input: BlobLinkInput): string {
  const { owner, repo, branch, sourcePath, lineRange } = input;
  const [start, end] = lineRange;
  const fragment = start === end ? `L${start}` : `L${start}-L${end}`;
  return `https://github.com/${owner}/${repo}/blob/${branch}/${sourcePath}#${fragment}`;
}
