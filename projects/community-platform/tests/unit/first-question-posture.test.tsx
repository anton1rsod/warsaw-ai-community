import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { FirstQuestionQuote } from "@/app/components/FirstQuestionQuote";
import { PostureLedger } from "@/app/components/PostureLedger";

afterEach(cleanup);

describe("FirstQuestionQuote (D5 — the one expressive moment)", () => {
  it("renders the question inside a <blockquote> within the hanging-mark <figure>", () => {
    const { container } = render(
      <FirstQuestionQuote question="What breaks first?" askHref={null} />,
    );
    const figure = container.querySelector("figure");
    expect(figure?.className).toContain("mt-16");
    expect(figure?.className).toContain("pl-9");
    const quote = figure?.querySelector("blockquote");
    expect(quote?.textContent).toBe("“What breaks first?”");
    expect(quote?.className).toContain("font-voice");
    expect(quote?.className).toContain("text-[19px]");
  });

  it("hanging amber asterisk is decorative (aria-hidden, font-display, accent-500)", () => {
    const { container } = render(
      <FirstQuestionQuote question="What breaks first?" askHref={null} />,
    );
    const mark = [...container.querySelectorAll('span[aria-hidden="true"]')].find(
      (el) => el.textContent === "*",
    );
    expect(mark).toBeDefined();
    expect(mark?.className).toContain("absolute");
    expect(mark?.className).toContain("font-display");
    expect(mark?.className).toContain("text-accent-500");
  });

  it("renders the mono caption in the figcaption", () => {
    const { container } = render(
      <FirstQuestionQuote question="What breaks first?" askHref={null} />,
    );
    const caption = container.querySelector("figcaption");
    expect(caption?.textContent).toContain("the first question I ask");
    expect(caption?.className).toContain("uppercase");
    expect(caption?.className).toContain("text-dust");
  });

  it("renders the ask-yours link with a ≥24px hit-area box when askHref is set (H159)", () => {
    render(
      <FirstQuestionQuote question="What breaks first?" askHref="https://t.me/anton" />,
    );
    const link = screen.getByRole("link", { name: /ask yours/ });
    expect(link).toHaveAttribute("href", "https://t.me/anton");
    expect(link.className).toContain("inline-flex");
    expect(link.className).toContain("min-h-[24px]");
    expect(link.className).toContain("items-center");
  });

  it("renders no link when askHref is null", () => {
    render(<FirstQuestionQuote question="What breaks first?" askHref={null} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("returns null for a whitespace-only question", () => {
    const { container } = render(<FirstQuestionQuote question="   " askHref={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("PostureLedger (D7 — bullish/skeptical ledger rows)", () => {
  it("renders the h2 kicker 'Evaluation posture' plus both dt/dd rows (H157)", () => {
    render(
      <PostureLedger
        bullish="clear ICP"
        skeptical="no users yet"
        failurePatterns={null}
        successPatterns={null}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Evaluation posture" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bullish when")).toBeInTheDocument();
    expect(screen.getByText("Skeptical when")).toBeInTheDocument();
    expect(screen.getByText("clear ICP")).toBeInTheDocument();
    expect(screen.getByText("no users yet")).toBeInTheDocument();
  });

  it("returns null when both bullish and skeptical are null — failure/success props alone render nothing (they live in StorySection)", () => {
    const { container } = render(
      <PostureLedger
        bullish={null}
        skeptical={null}
        failurePatterns="- ships too late"
        successPatterns="- talks to users"
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders a single row when only one side is present", () => {
    render(
      <PostureLedger
        bullish="clear ICP"
        skeptical={null}
        failurePatterns={null}
        successPatterns={null}
      />,
    );
    expect(screen.getByText("Bullish when")).toBeInTheDocument();
    expect(screen.queryByText("Skeptical when")).toBeNull();
  });

  it("plainLines: collapses paragraph breaks and renders posture as escaped TEXT, not HTML", () => {
    const { container } = render(
      <PostureLedger
        bullish={"First line.\n\n\nSecond line with <em>markup</em>."}
        skeptical={null}
        failurePatterns={null}
        successPatterns={null}
      />,
    );
    const dd = container.querySelector("dd");
    expect(dd?.textContent).toBe("First line.\nSecond line with <em>markup</em>.");
    expect(dd?.querySelector("em")).toBeNull();
    expect(dd?.className).toContain("whitespace-pre-line");
  });
});
