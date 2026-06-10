/**
 * v0.12 Phase 3.2 — overlap-lens gating on /members/[slug].
 *
 * The lens renders ONLY when (all four): a session exists · the viewer has a
 * persona · viewer.slug !== member.slug · the computed overlap has content.
 *
 * NOTE: the @/lib/content-snapshot mock factory must export every name
 * page.tsx imports from that module — extend it if the import list grows.
 */
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => {
  const SUBJECT_PERSONA = `---
persona_id: nadia-k
display_name: Nadia K
languages: [en]
schema_version: 1.0
---
# Nadia K

## Tags

### Industries
- fintech — expert
- b2b-saas — expert

### Functional roles
- product-manager — practitioner

### Niche expertise
- chargeback dispute automation

## Background

### One-line bio

Payments PM who has watched every dispute flow fail.
`;

  const VIEWER_PERSONA = `---
persona_id: viktor-o
display_name: Viktor O
languages: [en]
schema_version: 1.0
---
# Viktor O

## Tags

### Industries
- fintech — practitioner

## Background

### One-line bio

Platform engineer.
`;

  // Zero overlap content vs VIEWER_PERSONA: disjoint labels, no expert
  // depth, no "### Niche expertise" items → shared/complementary/starters
  // all empty.
  const BARE_PERSONA = `---
persona_id: bare-m
display_name: Bare M
languages: [en]
schema_version: 1.0
---
# Bare M

## Tags

### Industries
- legaltech — practitioner

## Background

### One-line bio

Quiet profile.
`;

  interface FixtureMember {
    name: string;
    githubHandle: string;
    slug: string;
    telegram: string | null;
    link: string | null;
    focus: string | null;
    profile: null;
    persona: string | null;
  }

  function member(
    overrides: Partial<FixtureMember> &
      Pick<FixtureMember, "name" | "githubHandle" | "slug">,
  ): FixtureMember {
    return {
      telegram: null,
      link: null,
      focus: null,
      profile: null,
      persona: null,
      ...overrides,
    };
  }

  const MEMBERS = [
    member({ name: "Nadia K", githubHandle: "nadiak", slug: "nadia-k", persona: SUBJECT_PERSONA }),
    member({ name: "Viktor O", githubHandle: "viktoro", slug: "viktor-o", persona: VIEWER_PERSONA }),
    member({ name: "Pat Q", githubHandle: "patq", slug: "pat-q" }),
    member({ name: "Bare M", githubHandle: "barem", slug: "bare-m", persona: BARE_PERSONA }),
  ];

  return { MEMBERS, authMock: vi.fn() };
});

vi.mock("@/lib/auth", () => ({ auth: () => h.authMock() }));
// GdprPanel carries client/server-action wiring irrelevant to lens gating.
vi.mock("@/app/components/GdprPanel", () => ({ GdprPanel: (): null => null }));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberBySlug: (slug: string) => h.MEMBERS.find((m) => m.slug === slug),
  findMemberByHandle: (handle: string) =>
    h.MEMBERS.find(
      (m) => m.githubHandle === handle.replace(/^@/, "").toLowerCase().trim(),
    ),
  getContributions: () => ({
    projectCommits: 0,
    adrsFiled: 0,
    meetingsAttended: 0,
    statusPosts: 0,
  }),
  listMembers: () => h.MEMBERS,
  listEventsFromSnapshot: () => [],
}));

import MemberPage from "@/app/members/[slug]/page";

afterEach(cleanup);
beforeEach(() => h.authMock.mockReset());

async function renderMemberPage(slug: string): Promise<void> {
  render(await MemberPage({ params: Promise.resolve({ slug }) }));
}

const LENS_NAME = /overlap: you and/i;

describe("member page — overlap lens gating (v0.12 §4.2)", () => {
  it("gate 1: anon viewer → no lens", async () => {
    h.authMock.mockResolvedValue(null);
    await renderMemberPage("nadia-k");
    expect(screen.queryByRole("heading", { level: 2, name: LENS_NAME })).toBeNull();
  });

  it("gate 2: signed-in viewer without a persona → no lens", async () => {
    h.authMock.mockResolvedValue({ githubHandle: "patq" });
    await renderMemberPage("nadia-k");
    expect(screen.queryByRole("heading", { level: 2, name: LENS_NAME })).toBeNull();
  });

  it("gate 3: viewing your own page → no lens", async () => {
    h.authMock.mockResolvedValue({ githubHandle: "nadiak" });
    await renderMemberPage("nadia-k");
    expect(screen.queryByRole("heading", { level: 2, name: LENS_NAME })).toBeNull();
  });

  it("gate 4: overlap with zero content → no lens", async () => {
    h.authMock.mockResolvedValue({ githubHandle: "viktoro" });
    await renderMemberPage("bare-m");
    expect(screen.queryByRole("heading", { level: 2, name: LENS_NAME })).toBeNull();
  });

  it("all four gates pass → lens renders with the computed starters", async () => {
    h.authMock.mockResolvedValue({ githubHandle: "viktoro" });
    await renderMemberPage("nadia-k");
    expect(
      screen.getByRole("heading", { level: 2, name: "overlap: you and Nadia K" }),
    ).toBeInTheDocument();
    // shared(fintech) + complementary(fintech) + subject niche → 3 starters.
    expect(screen.getByText(/3 conversation starters/)).toBeInTheDocument();
  });
});
