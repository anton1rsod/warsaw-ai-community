export interface EventAuthorInput {
  readonly date: string;
  readonly slug: string;
  readonly title: string;
  readonly startTime?: string;
  readonly durationMinutes?: number;
  readonly location?: string;
  readonly host?: string;
  readonly url?: string;
  readonly status: "scheduled" | "cancelled" | "completed";
  readonly body: string;
}

function quoteYamlString(s: string): string {
  const escaped = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export function composeEventReadme(input: EventAuthorInput): string {
  const lines: string[] = ["---"];
  lines.push(`date: ${input.date}`);
  lines.push(`slug: "${input.slug}"`);
  lines.push(`title: ${quoteYamlString(input.title)}`);
  if (input.startTime) lines.push(`start_time: "${input.startTime}"`);
  if (input.durationMinutes !== undefined) {
    lines.push(`duration_minutes: ${input.durationMinutes}`);
  }
  if (input.location) {
    lines.push(`location: ${quoteYamlString(input.location)}`);
  }
  if (input.host) lines.push(`host: "${input.host}"`);
  if (input.url) lines.push(`url: "${input.url}"`);
  lines.push(`status: "${input.status}"`);
  lines.push("---");
  lines.push("");
  lines.push(input.body);
  return lines.join("\n");
}

export function deriveEventSlug(date: string, title: string): string {
  const titleSlug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${date}-${titleSlug}`;
}
