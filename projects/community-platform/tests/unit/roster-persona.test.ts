import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readMemberPersona } from "@/lib/roster";
import { parsePersona } from "@/lib/persona";

let root: string;
beforeEach(async () => { root = await mkdtemp(path.join(tmpdir(), "persona-")); });
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

async function seed(slug: string, files: Record<string, string>) {
  const dir = path.join(root, "persona-builder/personas", slug);
  await mkdir(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await writeFile(path.join(dir, name), content, "utf8");
  }
}

describe("readMemberPersona (H138/H139)", () => {
  it("prefers .public.md over the full .md", async () => {
    await seed("x", {
      "persona-x.md": "---\n---\n# X\n\n## Tags\n\nFULL ONLY — private\n",
      "persona-x.public.md": "---\nlanguages: [en]\n---\n# X\n\n## Tags\n\n### Industries\n- ai — expert\n",
    });
    const got = await readMemberPersona(root, "x");
    expect(got).toContain("### Industries");
    expect(got).not.toContain("FULL ONLY");
  });

  it("returns full content (frontmatter + body) — no truncation at ##", async () => {
    await seed("y", {
      "persona-y.public.md": "---\n---\n# Y\n\n## Tags\n\n### Industries\n- ai — expert\n\n## Background\n\nbio here\n",
    });
    const got = await readMemberPersona(root, "y");
    expect(got).toContain("## Background");
    expect(got).toContain("bio here");
  });

  it("H139: returns null when only the full .md exists (fail-closed)", async () => {
    await seed("z", { "persona-z.md": "---\n---\n# Z\n\n## Tags\nprivate\n" });
    expect(await readMemberPersona(root, "z")).toBeNull();
  });

  it("returns content with frontmatter so parsePersona reads languages (R5)", async () => {
    await seed("lang", {
      "persona-lang.public.md": "---\nlanguages: [en, pl]\npersona_id: lang\n---\n# L\n\n## Tags\n\n### Industries\n- ai — expert\n",
    });
    const got = await readMemberPersona(root, "lang");
    expect(got).not.toBeNull();
    expect(parsePersona(got as string).languages).toEqual(["en", "pl"]);
    expect(parsePersona(got as string).tags.industries).toEqual([{ label: "ai", depth: "expert" }]);
  });
});
