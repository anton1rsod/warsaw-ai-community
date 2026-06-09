import { z } from "zod";

export const PROJECT_STATUSES = ["Proposed", "In design", "Building", "Live", "Archived"] as const;
export const ADR_STATUSES = ["Proposed", "Accepted", "Superseded", "Deprecated", "Rejected"] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");

export const ProjectSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  status: z.enum(PROJECT_STATUSES),
  dri: z.string().min(1),
  version: z.string(),       // may be "" when none declared
  currentFocus: z.string(),
  nextGate: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const AdrSchema = z.object({
  id: z.string().regex(/^\d{4}$/),
  adr: z.string().regex(/^ADR-\d{4}$/),
  title: z.string().min(1),
  status: z.enum(ADR_STATUSES),
  date: isoDate,
  path: z.string().min(1),
});
export type Adr = z.infer<typeof AdrSchema>;

export const ReleaseSchema = z.object({
  project: z.string().min(1),
  version: z.string().min(1),
  date: isoDate,
  summary: z.string(),
});
export type Release = z.infer<typeof ReleaseSchema>;

export const EngagementSchema = z.object({
  handle: z.string().min(1),
  name: z.string().min(1),
  contributions: z.number().int().nonnegative(),
  kudos: z.number().int().nonnegative(),
  statusStreak: z.number().int().nonnegative(),
  eventsAttended: z.number().int().nonnegative(),
});
export type Engagement = z.infer<typeof EngagementSchema>;

export const DriverSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  detail: z.string(),
});
export type Driver = z.infer<typeof DriverSchema>;

export const RepoStateSchema = z.object({
  lastUpdated: z.string(),
  drivers: z.array(DriverSchema),
  hotNow: z.array(z.string()),
  blockers: z.array(z.string()),
});
export type RepoState = z.infer<typeof RepoStateSchema>;

export interface Member {
  name: string;
  handle: string;
  slug: string; // profile slug, e.g. "anton-safronov" (used to match event rosters)
}
