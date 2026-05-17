import { z } from "zod";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const TimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const CommunityDefaultsSchema = z.object({
  timezone: z.string().min(1),
  meetings: z.object({
    defaultStartTime: z.string().regex(TimeRegex),
    defaultDurationMinutes: z.number().int().positive(),
    defaultLocation: z.string(),
  }),
  events: z.object({
    defaultStartTime: z.string().regex(TimeRegex),
    defaultDurationMinutes: z.number().int().positive(),
    defaultLocation: z.string(),
  }),
});

export type CommunityDefaults = z.infer<typeof CommunityDefaultsSchema>;

// Build-time read; module-level cache (defaults change at deploy time, not request time).
let cached: CommunityDefaults | null = null;

export function getDefaults(): CommunityDefaults {
  if (cached) return cached;
  const path = join(process.cwd(), "..", "..", "community", "community-defaults.json");
  const raw = readFileSync(path, "utf-8");
  const parsed = CommunityDefaultsSchema.parse(JSON.parse(raw));
  cached = parsed;
  return parsed;
}
