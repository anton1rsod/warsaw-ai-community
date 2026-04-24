export function renderFrontmatter(values: Record<string, unknown>): string {
  const lines: string[] = ["---"];
  for (const [k, v] of Object.entries(values)) {
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) lines.push(`  - ${String(item)}`);
    } else if (v instanceof Date) {
      lines.push(`${k}: ${v.toISOString()}`);
    } else {
      lines.push(`${k}: ${String(v)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}
