import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { MeetingInviteForm } from "@/app/components/MeetingInviteForm";

describe("MeetingInviteForm", () => {
  it("mints, shows the URL + QR img, then reveals an inline Revoke (H135)", async () => {
    const mint = vi.fn().mockResolvedValue({ url: "https://x.test/onboard?token=a.b", qrDataUrl: "data:image/png;base64,AAAA", jti: "11111111-2222-4333-8444-555555555555" });
    const revoke = vi.fn().mockResolvedValue({ ok: true });
    render(<MeetingInviteForm mintAction={mint} revokeAction={revoke} />);
    fireEvent.submit(screen.getByTestId("meeting-mint-form"));
    await waitFor(() => expect(screen.getByDisplayValue(/onboard\?token=/)).toBeInTheDocument());
    expect(screen.getByRole("img", { name: /qr/i })).toHaveAttribute("src", "data:image/png;base64,AAAA");
    fireEvent.click(screen.getByText(/revoke/i));
    await waitFor(() => expect(revoke).toHaveBeenCalled());
  });
  it("surfaces a mint error", async () => {
    const mint = vi.fn().mockResolvedValue({ error: "Not authorized." });
    render(<MeetingInviteForm mintAction={mint} revokeAction={vi.fn()} />);
    fireEvent.submit(screen.getByTestId("meeting-mint-form"));
    await waitFor(() => expect(screen.getByText(/not authorized/i)).toBeInTheDocument());
  });
});
