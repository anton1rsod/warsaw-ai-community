import { describe, expect, it } from "vitest";
import {
  sanitizeShippingLogBody,
  STATUS_MODES,
  STATUS_BODY_MAX_RICH,
  STATUS_BODY_MAX_SHIPPING_LOG,
  parseStatusMode,
} from "@/lib/shipping-log";

describe("sanitizeShippingLogBody (H116)", () => {
  it("strips < and > characters", () => {
    expect(sanitizeShippingLogBody("hello <script>alert(1)</script>")).toBe(
      "hello scriptalert(1)/script",
    );
  });

  it("strips Markdown control chars [*`#_~]", () => {
    expect(sanitizeShippingLogBody("**bold** _emph_ `code` # heading ~strike~")).toBe(
      "bold emph code heading strike",
    );
  });

  it("preserves regular text + punctuation + emoji", () => {
    expect(sanitizeShippingLogBody("Shipped v0.9.1.1 today! 🚀")).toBe(
      "Shipped v0.9.1.1 today! 🚀",
    );
  });

  it("preserves slashes, hyphens, parens, colons", () => {
    expect(sanitizeShippingLogBody("docs/specs/2026-05-28-x.md (chat-51): done")).toBe(
      "docs/specs/2026-05-28-x.md (chat-51): done",
    );
  });

  it("collapses trailing whitespace", () => {
    expect(sanitizeShippingLogBody("ok   ")).toBe("ok");
  });
});

describe("STATUS_BODY_MAX_SHIPPING_LOG = 280", () => {
  it("exposes the 280-char cap", () => {
    expect(STATUS_BODY_MAX_SHIPPING_LOG).toBe(280);
  });
});

describe("STATUS_BODY_MAX_RICH = 4000", () => {
  it("preserves the existing rich-mode 4000-char cap", () => {
    expect(STATUS_BODY_MAX_RICH).toBe(4000);
  });
});

describe("STATUS_MODES = ['rich', 'shipping-log']", () => {
  it("exposes both modes", () => {
    expect(STATUS_MODES).toEqual(["rich", "shipping-log"]);
  });
});

describe("parseStatusMode (H117)", () => {
  it('returns "rich" for undefined (forward-compat default)', () => {
    expect(parseStatusMode(undefined)).toBe("rich");
  });

  it('returns "rich" for the string "rich"', () => {
    expect(parseStatusMode("rich")).toBe("rich");
  });

  it('returns "shipping-log" for the string "shipping-log"', () => {
    expect(parseStatusMode("shipping-log")).toBe("shipping-log");
  });

  it("throws on unknown mode (H117 write-time enforcement)", () => {
    expect(() => parseStatusMode("garbage")).toThrow(/unknown status mode/i);
  });
});
