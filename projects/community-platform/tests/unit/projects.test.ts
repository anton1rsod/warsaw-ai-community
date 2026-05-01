import path from "node:path";
import { describe, expect, it } from "vitest";
import { listProjects, readProject } from "@/lib/projects";

const FIXTURE_ROOT = path.resolve(
  import.meta.dirname,
  "../fixtures/repo",
);

describe("listProjects", () => {
  it("finds project directories under projects/", async () => {
    const projects = await listProjects(FIXTURE_ROOT);
    const slugs = projects.map((p) => p.slug);
    expect(slugs).toContain("example-project");
  });

  it("excludes directories starting with _", async () => {
    const projects = await listProjects(FIXTURE_ROOT);
    const slugs = projects.map((p) => p.slug);
    expect(slugs).not.toContain("_template");
  });

  it("excludes directories starting with .", async () => {
    const projects = await listProjects(FIXTURE_ROOT);
    const slugs = projects.map((p) => p.slug);
    expect(slugs).not.toContain(".hidden");
  });

  it("returns empty array when projects/ directory does not exist", async () => {
    const projects = await listProjects("/nonexistent-root-xyz");
    expect(projects).toEqual([]);
  });

  it("falls back to slug as title when README has no H1", async () => {
    const projects = await listProjects(FIXTURE_ROOT);
    const noH1 = projects.find((p) => p.slug === "no-h1-project");
    expect(noH1).not.toBeUndefined();
    expect(noH1?.title).toBe("no-h1-project");
  });

  it("falls back to slug as title when project has no README", async () => {
    const projects = await listProjects(FIXTURE_ROOT);
    const noReadme = projects.find((p) => p.slug === "no-readme-project");
    expect(noReadme).not.toBeUndefined();
    expect(noReadme?.title).toBe("no-readme-project");
  });
});

describe("readProject", () => {
  it("loads README.md and spec.md for an existing project", async () => {
    const detail = await readProject(FIXTURE_ROOT, "example-project");
    expect(detail).not.toBeNull();
    expect(detail?.readme).toContain("A test project for the platform.");
    expect(detail?.spec).toContain("This is the spec.");
    expect(detail?.plan).toBeNull();
    expect(detail?.changelog).toBeNull();
  });

  it("returns null for an unknown slug", async () => {
    const detail = await readProject(FIXTURE_ROOT, "no-such-project");
    expect(detail).toBeNull();
  });

  it("extracts title from first H1 of README", async () => {
    const detail = await readProject(FIXTURE_ROOT, "example-project");
    expect(detail?.title).toBe("Example Project");
  });

  it("returns null for slug starting with _", async () => {
    expect(await readProject(FIXTURE_ROOT, "_template")).toBeNull();
  });

  it("returns null for slug containing ..", async () => {
    expect(await readProject(FIXTURE_ROOT, "../something")).toBeNull();
  });

  it("returns null for slug containing /", async () => {
    expect(await readProject(FIXTURE_ROOT, "a/b")).toBeNull();
  });

  it("falls back to slug as title when README is absent", async () => {
    const detail = await readProject(FIXTURE_ROOT, "no-readme-project");
    expect(detail).not.toBeNull();
    expect(detail?.readme).toBeNull();
    expect(detail?.title).toBe("no-readme-project");
  });
});
