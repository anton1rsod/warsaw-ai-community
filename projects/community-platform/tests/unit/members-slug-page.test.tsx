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
  listEventsFromSnapshot: vi.fn(() => []),
}));
vi.mock("@/lib/__generated__/kudos.json", () => ({ default: {} }));
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
import { findMemberBySlug, listEventsFromSnapshot } from "@/lib/content-snapshot";
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

// Valid event slug for testing (matches EventSlugSchema YYYY-MM-DD-kebab pattern).
const KNOWN_EVENT_SLUG = "2026-06-01-summer-meetup";
const ORPHAN_EVENT_SLUG = "2026-07-15-unknown-event";

const ANTON_WITH_EVENTS = {
  ...ANTON_MEMBER,
  profile: {
    data: {
      name: "Anton Safronov",
      github_handle: "anton1rsod",
      events_going: [KNOWN_EVENT_SLUG, ORPHAN_EVENT_SLUG],
      events_interested: [] as string[],
    },
    body: "Hello world prose.",
  },
};

const ANTON_WITH_INTERESTED = {
  ...ANTON_MEMBER,
  profile: {
    data: {
      name: "Anton Safronov",
      github_handle: "anton1rsod",
      events_going: [] as string[],
      events_interested: [KNOWN_EVENT_SLUG],
    },
    body: "Hello world prose.",
  },
};

const ANTON_ORPHAN_ONLY = {
  ...ANTON_MEMBER,
  profile: {
    data: {
      name: "Anton Safronov",
      github_handle: "anton1rsod",
      events_going: [ORPHAN_EVENT_SLUG],
      events_interested: [] as string[],
    },
    body: "Hello world prose.",
  },
};

describe("H34, H39 + D19: /members/[slug] v0.3 additions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ githubHandle: "someone-else" } as never);
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      {
        slug: KNOWN_EVENT_SLUG,
        date: "2026-06-01",
        title: "Summer Meetup",
        status: "scheduled",
        body: "",
      },
    ] as never);
  });

  it("renders valid going event slug and filters orphan (H34, H39)", async () => {
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_WITH_EVENTS as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    // Valid slug appears as a link
    expect(screen.getByRole("link", { name: new RegExp(KNOWN_EVENT_SLUG) })).toBeInTheDocument();
    // Orphan slug is filtered out
    expect(screen.queryByText(new RegExp(ORPHAN_EVENT_SLUG))).toBeNull();
  });

  it("renders valid interested event slug (H34)", async () => {
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_WITH_INTERESTED as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    expect(
      screen.getByRole("link", { name: new RegExp(KNOWN_EVENT_SLUG) }),
    ).toBeInTheDocument();
  });

  it("does NOT render Events section when all slugs are orphans (H39)", async () => {
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_ORPHAN_ONLY as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    expect(screen.queryByText(/^events$/i)).toBeNull();
    expect(screen.queryByText(new RegExp(ORPHAN_EVENT_SLUG))).toBeNull();
  });

  it("does NOT render Events section when profile has no v0.3 fields", async () => {
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_MEMBER as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    // ANTON_MEMBER.profile.data has no events_going — defaults to []; section hidden.
    expect(screen.queryByRole("link", { name: /Going/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /Interested/i })).toBeNull();
  });

  it("renders KudosCount empty state when member has no kudos entry (D19)", async () => {
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_MEMBER as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    expect(screen.getByText(/no thanks yet/i)).toBeInTheDocument();
  });

  it("renders the KudosCount section for every member (D19)", async () => {
    // kudos.json is mocked as {} (empty), so the empty-state message appears.
    // This asserts the section is always rendered — the KudosCount component
    // handles the "no entry" → "No thanks yet." display internally.
    vi.mocked(findMemberBySlug).mockReturnValue(ANTON_MEMBER as never);

    const tree = await MemberPage({
      params: Promise.resolve({ slug: "anton-safronov" }),
    });
    render(tree);

    expect(screen.getByText(/no thanks yet/i)).toBeInTheDocument();
  });
});
