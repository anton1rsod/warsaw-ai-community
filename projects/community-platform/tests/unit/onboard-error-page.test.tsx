import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import OnboardErrorPage from "@/app/onboard/error/page";

afterEach(cleanup);

describe("/onboard/error page", () => {
  it("renders the generic error message (no enumeration of failure modes)", () => {
    render(<OnboardErrorPage />);
    expect(
      screen.getByText(/this invitation can.?t be completed/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/reach out to a community organizer/i),
    ).toBeInTheDocument();
  });
  it("does not include any of the specific-failure keywords (info-leak prevention)", () => {
    const { container } = render(<OnboardErrorPage />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/expired/i);
    expect(text).not.toMatch(/replayed/i);
    expect(text).not.toMatch(/already.*member/i);
    expect(text).not.toMatch(/invalid signature/i);
  });
});
