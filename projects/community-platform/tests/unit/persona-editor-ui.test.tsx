import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PersonaEditor } from "@/app/components/PersonaEditor";
import { s } from "@/lib/i18n/strings";

vi.mock("@/app/actions/save-persona", () => ({ savePersona: vi.fn() }));

afterEach(cleanup);

describe("PersonaEditor — H152 byte-accurate client cap", () => {
  it("flags multi-byte content whose BYTE length exceeds 64KB even when .length does not", () => {
    render(<PersonaEditor initialContent="" slug="jane-d" />);
    const textarea = screen.getByLabelText(/persona markdown/i);
    const cjk = "字".repeat(22_000); // .length 22,000 < 65,536; bytes 66,000 > 65,536
    fireEvent.change(textarea, { target: { value: cjk } });
    expect(screen.getByText(s("persona.editor.tooLarge"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: s("persona.editor.attach") })).toBeDisabled();
  });

  it("does not flag 64KB of ASCII", () => {
    render(<PersonaEditor initialContent="" slug="jane-d" />);
    const textarea = screen.getByLabelText(/persona markdown/i);
    fireEvent.change(textarea, { target: { value: "a".repeat(65_536) } });
    expect(screen.queryByText(s("persona.editor.tooLarge"))).toBeNull();
  });
});
