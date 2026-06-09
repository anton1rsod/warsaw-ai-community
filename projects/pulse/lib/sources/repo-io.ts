import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

// repo-io.ts lives at projects/pulse/lib/sources → repo root is four levels up.
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = process.env.PULSE_REPO_ROOT ?? path.resolve(HERE, "../../../..");

export async function readFileOrNull(absPath: string): Promise<string | null> {
  try {
    return await readFile(absPath, "utf8");
  } catch (err: unknown) {
    if (err && typeof err === "object" && (err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function readJson(absPath: string): Promise<unknown> {
  const raw = await readFile(absPath, "utf8");
  return JSON.parse(raw) as unknown;
}

/** Absolute paths of every markdown status file under community/status/<week>/. */
export async function listStatusFiles(repoRoot = REPO_ROOT): Promise<string[]> {
  const base = path.join(repoRoot, "community/status");
  let weeks: string[];
  try {
    weeks = await readdir(base);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const week of weeks) {
    const dir = path.join(base, week);
    let entries: string[];
    try {
      entries = await readdir(dir);
    } catch {
      continue; // not a directory
    }
    for (const name of entries) {
      if (name.endsWith(".md")) out.push(path.join(dir, name));
    }
  }
  return out.sort();
}
