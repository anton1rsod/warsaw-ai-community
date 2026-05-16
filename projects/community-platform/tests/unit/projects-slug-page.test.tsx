import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/content-snapshot", () => ({
  findProjectBySlug: vi.fn(),
  listProjectDetails: vi.fn(() => []),
  getProjectContributions: vi.fn(),
  findMemberByHandle: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("__notFound__");
  }),
}));
vi.mock("@/app/components/SafeHtml", () => ({
   
  SafeHtml: ({ html }: { html: string }) => (
    // nosec: test mock only — content is controlled fixture data
    <div data-testid="safehtml" dangerouslySetInnerHTML={{ __html: html }} />
  ),
}));

import {
  findProjectBySlug,
  getProjectContributions,
  findMemberByHandle,
} from "@/lib/content-snapshot";
import ProjectPage from "@/app/projects/[slug]/page";

const BASE_PROJECT = {
  slug: "community-platform",
  title: "Community Platform",
  readme: "# Hello\nProject README.",
  spec: null,
  plan: null,
  changelog: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("/projects/[slug] — TopContributors integration", () => {
  it("renders the TopContributors section with @handles from getProjectContributions", async () => {
    vi.mocked(findProjectBySlug).mockReturnValue(BASE_PROJECT as never);
    vi.mocked(getProjectContributions).mockReturnValue([
      { handle: "anton1rsod", commits: 42 },
      { handle: "markspas", commits: 3 },
    ]);
    vi.mocked(findMemberByHandle).mockImplementation((handle: string) => {
      if (handle === "anton1rsod") {
        return { slug: "anton-safronov", githubHandle: "anton1rsod", name: "A", profile: null, persona: null } as never;
      }
      return undefined;
    });

    const tree = await ProjectPage({
      params: Promise.resolve({ slug: "community-platform" }),
    });
    render(tree);

    expect(screen.getByText(/Top contributors/i)).toBeInTheDocument();
    expect(screen.getByText("@anton1rsod")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();

    // anton1rsod's handle resolves to slug "anton-safronov"
    const antonLink = screen.getByRole("link", { name: /anton1rsod/i });
    expect(antonLink.getAttribute("href")).toBe("/members/anton-safronov");

    // markspas has no roster match — fall back to handle in the link
    const markLink = screen.getByRole("link", { name: /markspas/i });
    expect(markLink.getAttribute("href")).toBe("/members/markspas");
  });

  it("renders the 'No contributors yet' placeholder when getProjectContributions returns empty", async () => {
    vi.mocked(findProjectBySlug).mockReturnValue(BASE_PROJECT as never);
    vi.mocked(getProjectContributions).mockReturnValue([]);

    const tree = await ProjectPage({
      params: Promise.resolve({ slug: "community-platform" }),
    });
    render(tree);

    expect(screen.getByText(/no contributors yet/i)).toBeInTheDocument();
  });

  it("calls notFound when findProjectBySlug returns undefined", async () => {
    vi.mocked(findProjectBySlug).mockReturnValue(undefined);
    await expect(
      ProjectPage({ params: Promise.resolve({ slug: "unknown" }) }),
    ).rejects.toThrow(/__notFound__/);
  });
});
