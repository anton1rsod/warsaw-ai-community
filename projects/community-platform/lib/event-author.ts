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

export function deriveEventSlug(_date: string, _title: string): string {
  throw new Error("deriveEventSlug not implemented");
}
