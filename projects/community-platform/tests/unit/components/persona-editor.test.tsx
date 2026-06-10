import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { PersonaEditor } from "@/app/components/PersonaEditor";

vi.mock("@/app/actions/save-persona", () => ({ savePersona: vi.fn(async () => ({ ok: true, savedAt: "now" })) }));
afterEach(cleanup);

describe("PersonaEditor", () => {
  it("renders consent + data-minimization copy (H144/H145)", () => {
    render(<PersonaEditor initialContent="" slug="x" />);
    expect(screen.getByText(/public git repository/i)).toBeInTheDocument();
    expect(screen.getByText(/do not include/i)).toBeInTheDocument();
  });
  it("disables Attach when empty", () => {
    render(<PersonaEditor initialContent="" slug="x" />);
    expect(screen.getByRole("button", { name: /attach persona/i })).toBeDisabled();
  });
  it("H141: too-large error past 64KB without enabling Attach", () => {
    render(<PersonaEditor initialContent="" slug="x" />);
    fireEvent.change(screen.getByLabelText(/persona markdown/i), { target: { value: "a".repeat(65_537) } });
    expect(screen.getByText(/too large/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /attach persona/i })).toBeDisabled();
  });
});
