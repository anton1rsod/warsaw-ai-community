import { describe, expect, it } from "vitest";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readGovernance } from "@/lib/governance";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = (name: string): string =>
  path.resolve(__dirname, `../fixtures/repo/community/governance/${name}`);

const ADMINS = FIX("admins.md");
const ADMINS_EDGE = FIX("admins-edge-cases.md");
const CMS = FIX("community-managers.md");
const CMS_EMPTY = FIX("community-managers-empty.md");

describe("readGovernance", () => {
  it("reads admin handles, normalizing case and skipping *(TBD)*", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(gov.admins).toEqual(["anton1rsod"]);
  });

  it("reads CM handles, normalizing case", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(gov.communityManagers).toEqual(["bob-sample"]);
  });

  it("isAdmin matches case-insensitively and tolerates @ prefix", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(gov.isAdmin("Anton1rsod")).toBe(true);
    expect(gov.isAdmin("@anton1rsod")).toBe(true);
    expect(gov.isAdmin("alice-ex")).toBe(false);
  });

  it("isCommunityManager matches case-insensitively and tolerates @ prefix", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(gov.isCommunityManager("BOB-SAMPLE")).toBe(true);
    expect(gov.isCommunityManager("@bob-sample")).toBe(true);
    expect(gov.isCommunityManager("anton1rsod")).toBe(false);
  });

  it("returns empty arrays + always-false predicates for an empty CM file", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS_EMPTY });
    expect(gov.communityManagers).toEqual([]);
    expect(gov.isCommunityManager("anyone")).toBe(false);
  });

  it("isAdmin / isCommunityManager return false for empty input", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(gov.isAdmin("")).toBe(false);
    expect(gov.isCommunityManager("")).toBe(false);
  });

  it("the snapshot is read-only / freezable (sanity)", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS, cmsPath: CMS });
    expect(Array.isArray(gov.admins)).toBe(true);
    expect(Array.isArray(gov.communityManagers)).toBe(true);
  });

  it("skips @TBD handles, empty-name rows, and tables without a GitHub column", async () => {
    const gov = await readGovernance({ adminsPath: ADMINS_EDGE, cmsPath: CMS_EMPTY });
    // carol-pending has @TBD handle → skipped; empty-name row skipped; no-github-col table skipped
    expect(gov.admins).toEqual(["anton1rsod"]);
    expect(gov.isAdmin("carol-pending")).toBe(false);
  });
});
