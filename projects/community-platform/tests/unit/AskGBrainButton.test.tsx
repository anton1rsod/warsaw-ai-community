import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AskGBrainButton } from "@/app/components/AskGBrainButton";

afterEach(cleanup);

describe("AskGBrainButton", () => {
  describe("H28: env-gated rendering", () => {
    it("returns null when baseUrl is null", () => {
      const { container } = render(
        <AskGBrainButton projectSlug="community-platform" baseUrl={null} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("returns null when baseUrl is empty string", () => {
      const { container } = render(
        <AskGBrainButton projectSlug="community-platform" baseUrl="" />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders the link when baseUrl is set", () => {
      render(
        <AskGBrainButton
          projectSlug="community-platform"
          baseUrl="https://gbrain.example.com"
        />,
      );
      const link = screen.getByRole("link", { name: /ask gbrain/i });
      expect(link).toBeInTheDocument();
    });
  });

  describe("H27: Referer not leaked to GBrain", () => {
    it("link has rel='noopener noreferrer' and target='_blank'", () => {
      render(
        <AskGBrainButton
          projectSlug="community-platform"
          baseUrl="https://gbrain.example.com"
        />,
      );
      const link = screen.getByRole("link", { name: /ask gbrain/i });
      expect(link.getAttribute("rel")).toContain("noopener");
      expect(link.getAttribute("rel")).toContain("noreferrer");
      expect(link.getAttribute("target")).toBe("_blank");
    });

    it("URL-encodes the project slug in href", () => {
      render(
        <AskGBrainButton
          projectSlug="a project with spaces"
          baseUrl="https://gbrain.example.com"
        />,
      );
      const link = screen.getByRole("link", { name: /ask gbrain/i });
      expect(link.getAttribute("href")).toContain(
        encodeURIComponent("a project with spaces"),
      );
    });
  });
});
