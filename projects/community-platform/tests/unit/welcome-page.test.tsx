import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/env", () => ({ env: { COMMUNITY_NAME: "Professional Subploters Association" } }));

import WelcomePage from "@/app/welcome/page";

describe("H131: /welcome page", () => {
  it("renders the celebratory landing with public-surface links", () => {
    render(<WelcomePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/you.?re in/i);
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: /events/i })).toHaveAttribute("href", "/events");
  });
});
