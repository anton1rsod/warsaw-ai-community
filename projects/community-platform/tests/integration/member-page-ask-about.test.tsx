/**
 * v0.12 Phase 3.3 — ask-about affordance on the member-page actions row.
 * O2: roster Telegram handle → https://t.me/<handle-sans-@> deep link;
 * no Telegram → CopyHandle fallback (GitHub handle). Not session-gated.
 */
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const h = vi.hoisted(() => {
  const persona = (slug: string, name: string): string => `---
persona_id: ${slug}
display_name: ${name}
languages: [en]
schema_version: 1.0
---
# ${name}

## Tags

### Industries
- fintech — expert

## Background

### One-line bio

Test persona.
`;

  const MEMBERS = [
    {
      name: "Nadia K",
      githubHandle: "nadiak",
      slug: "nadia-k",
      telegram: "@nadia_k",
      link: null,
      focus: null,
      profile: null,
      persona: persona("nadia-k", "Nadia K"),
    },
    {
      name: "Mark Spasonov",
      githubHandle: "markspas",
      slug: "mark-spasonov",
      telegram: null,
      link: null,
      focus: null,
      profile: null,
      persona: persona("mark-spasonov", "Mark Spasonov"),
    },
  ];
  return { MEMBERS, authMock: vi.fn() };
});

vi.mock("@/lib/auth", () => ({ auth: () => h.authMock() }));
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
beforeEach(() => h.authMock.mockReset().mockResolvedValue(null));

async function renderMemberPage(slug: string): Promise<void> {
  render(await MemberPage({ params: Promise.resolve({ slug }) }));
}

describe("member page — ask-about affordance (O2)", () => {
  it("roster Telegram present → t.me deep link with @ stripped", async () => {
    await renderMemberPage("nadia-k");
    const link = screen.getByRole("link", { name: "ask Nadia K about… →" });
    expect(link).toHaveAttribute("href", "https://t.me/nadia_k");
  });

  it("no Telegram → CopyHandle fallback with the GitHub handle", async () => {
    await renderMemberPage("mark-spasonov");
    expect(screen.queryByRole("link", { name: /ask .* about/i })).toBeNull();
    expect(
      screen.getByRole("button", { name: "copy @markspas" }),
    ).toBeInTheDocument();
  });
});
