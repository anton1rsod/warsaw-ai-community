import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberBySlug: vi.fn(),
  getContributions: vi.fn(() => ({
    projectCommits: 0,
    adrsFiled: 0,
    meetingsAttended: 0,
    statusPosts: 0,
  })),
  listMembers: vi.fn(() => []),
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("__notFound__");
  }),
}));

// Mock child components to keep this test focused on the new edit-link logic.
vi.mock("@/app/components/ContributionCard", () => ({
  ContributionCard: () => <div data-testid="contribution-card" />,
}));
vi.mock("@/app/components/PersonaPanel", () => ({
  PersonaPanel: () => <div data-testid="persona-panel" />,
}));
vi.mock("@/app/components/GdprPanel", () => ({
  GdprPanel: () => <div data-testid="gdpr-panel" />,
}));
vi.mock("@/app/components/SafeHtml", () => ({
  // SafeHtml already sanitizes in prod; this stub renders a testid for targeting.
  SafeHtml: ({ html }: { html: string }) => (
     
    <div data-testid="safehtml" dangerouslySetInnerHTML={{ __html: html }} />
  ),
}));

import { auth } from "@/lib/auth";
import { findMemberBySlug } from "@/lib/content-snapshot";
import MemberPage from "@/app/members/[slug]/page";

const ANTON_MEMBER = {
  name: "Anton Safronov",
  githubHandle: "anton1rsod",
  slug: "anton-safronov",
  profile: {
    data: { name: "Anton Safronov", github_handle: "anton1rsod" },
    body: "Hello world prose.",
  },
  persona: null,
};

const ANTON_NO_PROFILE = {
  ...ANTON_MEMBER,
  profile: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(cleanup);

describe("/members/[slug] — Edit profile link", () => {
  it("renders 'Edit profile →' link when isSelf and profile present", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_MEMBER as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    const link = screen.getByRole("link", { name: /edit profile/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/me/edit");
  });

  it("renders 'Edit your profile →' link when isSelf and profile absent", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_NO_PROFILE as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    const link = screen.getByRole("link", { name: /edit your profile/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/me/edit");
  });

  it("does NOT render edit link when not isSelf (profile present)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "someone-else" } as never);
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_MEMBER as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    expect(screen.queryByRole("link", { name: /edit profile/i })).toBeNull();
    // The non-self view still shows the profile (rendered via SafeHtml stub).
    expect(screen.getByTestId("safehtml")).toBeInTheDocument();
  });

  it("does NOT render edit link when not isSelf (profile absent — shows fallback text)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "someone-else" } as never);
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_NO_PROFILE as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    expect(screen.queryByRole("link", { name: /edit/i })).toBeNull();
    expect(screen.getByText(/hasn't filled out a profile yet/i)).toBeInTheDocument();
  });
});
