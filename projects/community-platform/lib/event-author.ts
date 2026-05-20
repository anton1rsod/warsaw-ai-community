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

export function composeEventReadme(_input: EventAuthorInput): string {
  throw new Error("composeEventReadme not implemented");
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
