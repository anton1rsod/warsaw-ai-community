import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import OnboardNotFound from "@/app/onboard/not-found";

afterEach(cleanup);

describe("/onboard not-found page — warm reskin parity with /error (H112)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/onboard/not-found.tsx"),
    "utf8",
  );
  const errorSrc = readFileSync(
    resolve(__dirname, "../../app/onboard/error/page.tsx"),
    "utf8",
  );

  it("renders the generic invitation-failure message", () => {
    render(<OnboardNotFound />);
    expect(
      screen.getByText(/this invitation can.?t be completed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/reach out to a community organizer/i),
    ).toBeInTheDocument();
  });

  it("does not enumerate failure modes (info-leak prevention)", () => {
    const { container } = render(<OnboardNotFound />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/expired/i);
    expect(text).not.toMatch(/replayed/i);
    expect(text).not.toMatch(/already.*member/i);
    expect(text).not.toMatch(/invalid signature/i);
  });

  it("no dark: variants", () => expect(src).not.toMatch(/\bdark:/));

  it("no neutral-*/gray-* tokens", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });

  it("no rounded scaffolding", () => expect(src).not.toMatch(/\brounded\b/));

  it("uses the same warm-system tokens as /onboard/error/page.tsx", () => {
    for (const token of [
      "// onboard",
      "font-display",
      "font-semibold",
      "text-[40px]",
      "leading-[0.95]",
      "tracking-tight",
      "text-ink",
      "font-body",
      "text-dust",
      "MonoLabel",
    ] as const) {
      expect(src, `not-found.tsx must contain "${token}"`).toContain(token);
      expect(errorSrc, `error/page.tsx must contain "${token}"`).toContain(token);
    }
  });
});
