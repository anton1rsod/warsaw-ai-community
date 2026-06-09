import { describe, it, expect } from "vitest";
import { renderQrDataUrl } from "@/lib/qr";

describe("H132: renderQrDataUrl", () => {
  it("returns a PNG data-URI encoding the URL (ECC Q, quiet zone)", async () => {
    const dataUrl = await renderQrDataUrl("https://warsaw-ai-community-platform.vercel.app/onboard?token=abc.def");
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});
