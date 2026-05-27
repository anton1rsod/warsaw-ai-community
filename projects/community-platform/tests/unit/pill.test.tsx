import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pill } from "@/app/components/Pill";

const pillSrc = readFileSync(resolve(__dirname, "../../app/components/Pill.tsx"), "utf8");

afterEach(cleanup);

describe("H101: Pill meets WCAG 2.2 SC 2.5.8 target size (>=24px)", () => {
  const src = readFileSync(resolve(__dirname, "../../app/components/Pill.tsx"), "utf8");
  it("declares a >=24px min target height", () => {
    expect(src).toMatch(/min-h-\[24px\]/);
  });
  it("centers content so the visible chip stays compact", () => {
    expect(src).toMatch(/inline-flex/);
    expect(src).toMatch(/items-center/);
  });
});

describe("Pill", () => {
  describe("variant=going", () => {
    it("renders as <a> with ink bg + cream text in anchor mode", () => {
      render(<Pill variant="going" href="/x">✓ going</Pill>);
      const el = screen.getByRole("link", { name: "✓ going" });
      expect(el.tagName).toBe("A");
      expect(el).toHaveAttribute("href", "/x");
      expect(el).toHaveClass("bg-ink");
      expect(el).toHaveClass("text-cream");
      expect(el).toHaveClass("font-voice");
    });

    it("renders as <button> with type when type prop provided", () => {
      const onClick = vi.fn();
      render(<Pill variant="going" type="button" onClick={onClick}>✓ going</Pill>);
      const el = screen.getByRole("button", { name: "✓ going" });
      expect(el.tagName).toBe("BUTTON");
      expect(el).toHaveAttribute("type", "button");
      fireEvent.click(el);
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  describe("variant=dashed", () => {
    it("renders with dashed ink border + transparent bg", () => {
      render(<Pill variant="dashed" href="/x">+ rsvp</Pill>);
      const el = screen.getByText("+ rsvp");
      expect(el.className).toMatch(/border-\[1\.5px\]/);
      expect(el).toHaveClass("border-dashed");
      expect(el).toHaveClass("border-ink");
      expect(el).toHaveClass("text-ink");
    });
  });

  describe("variant=solid", () => {
    it("renders with solid ink border + transparent bg", () => {
      render(<Pill variant="solid" href="/x">+ calendar</Pill>);
      const el = screen.getByText("+ calendar");
      expect(el).toHaveClass("border-solid");
      expect(el).toHaveClass("border-ink");
    });
  });

  describe("disabled", () => {
    it("forwards disabled prop on button mode", () => {
      render(<Pill variant="going" type="submit" disabled>send</Pill>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("H91: focus-visible parity", () => {
    it("includes focus-visible classes mirroring hover (going variant)", () => {
      render(<Pill variant="going" href="/x">go</Pill>);
      const el = screen.getByRole("link");
      expect(el.className).toMatch(/focus-visible:bg-accent-500/);
      expect(el.className).toMatch(/focus-visible:text-ink/);
    });
  });
});

describe("v0.9.1 H104: Pill disabled visual + danger variant", () => {
  it("BASE includes a disabled-opacity treatment", () => {
    expect(pillSrc).toMatch(/disabled:opacity-50/);
  });
  it("exposes a `danger` variant (alert border/text)", () => {
    const { container } = render(<Pill variant="danger" type="button">Delete</Pill>);
    const cls = container.querySelector("button")?.className ?? "";
    expect(cls).toMatch(/border-alert/);
    expect(cls).toMatch(/text-alert/);
    expect(cls).toMatch(/hover:bg-alert/);
  });
  it("renders a disabled button when disabled", () => {
    const { container } = render(<Pill variant="solid" type="button" disabled>X</Pill>);
    expect(container.querySelector("button")?.disabled).toBe(true);
  });
});
