import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EventSlugSchema } from "../lib/events";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface DirEntry {
  name: string;
  isDirectory: boolean;
}

export interface ValidationResult {
  validFolders: string[];
  errors: string[];
}

export function validateEventsFolders(entries: readonly DirEntry[]): ValidationResult {
  const validFolders: string[] = [];
  const errors: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory) continue;
    if (e.name.startsWith("_") || e.name.startsWith(".")) continue;
    const parsed = EventSlugSchema.safeParse(e.name);
    if (parsed.success) {
      validFolders.push(e.name);
    } else {
      errors.push(
        `Invalid event folder "${e.name}": ${parsed.error.errors[0]?.message ?? "format"}`,
      );
    }
  }
  return { validFolders, errors };
}

export function main(): number {
  const eventsDir = path.resolve(__dirname, "..", "..", "..", "community", "events");
  if (!existsSync(eventsDir)) {
    console.log("[validate-events-folders] no community/events/ directory — skip");
    return 0;
  }
  const entries: DirEntry[] = readdirSync(eventsDir, { withFileTypes: true }).map((f) => ({
    name: f.name,
    isDirectory: f.isDirectory(),
  }));
  const r = validateEventsFolders(entries);
  if (r.errors.length > 0) {
    for (const err of r.errors) console.error(`[validate-events-folders] ${err}`);
    return 1;
  }
  console.log(`[validate-events-folders] OK — ${r.validFolders.length} valid event folders`);
  return 0;
}

if (process.argv[1]?.endsWith("validate-events-folders.ts")) {
  process.exit(main());
}
