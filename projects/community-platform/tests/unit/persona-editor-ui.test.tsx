import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PersonaEditor } from "@/app/components/PersonaEditor";
import { s } from "@/lib/i18n/strings";

const saveMock = vi.fn();
const resyncMock = vi.fn();
vi.mock("@/app/actions/save-persona", () => ({ savePersona: (f: FormData) => saveMock(f) }));
vi.mock("@/app/actions/resync-persona", () => ({ resyncPersona: () => resyncMock() }));

afterEach(cleanup);
beforeEach(() => {
  saveMock.mockReset();
  resyncMock.mockReset();
});

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

describe("PersonaEditor — URL attach (v0.12)", () => {
  it("renders the URL field labelled from i18n", () => {
    render(<PersonaEditor initialContent="" slug="jane-d" />);
    expect(screen.getByLabelText(s("persona.editor.urlLabel"))).toBeInTheDocument();
  });

  it("Fetch & attach is disabled while the URL field is empty", () => {
    render(<PersonaEditor initialContent="" slug="jane-d" />);
    expect(screen.getByRole("button", { name: s("persona.editor.fetchAttach") })).toBeDisabled();
  });

  it("posts source_url (and no content) to savePersona, then shows the i18n attached message", async () => {
    saveMock.mockResolvedValue({ ok: true, savedAt: "2026-06-10T00:00:00.000Z" });
    render(<PersonaEditor initialContent="" slug="jane-d" />);
    const url = "https://raw.githubusercontent.com/jane/p/main/persona-jane-d.public.md";
    fireEvent.change(screen.getByLabelText(s("persona.editor.urlLabel")), {
      target: { value: url },
    });
    fireEvent.click(screen.getByRole("button", { name: s("persona.editor.fetchAttach") }));
    expect(await screen.findByText(s("persona.editor.attached"))).toBeInTheDocument();
    const fd = saveMock.mock.calls[0]?.[0] as FormData;
    expect(fd.get("source_url")).toBe(url);
    expect(fd.get("content")).toBeNull();
  });

  it.each([
    ["invalid_url", "persona.editor.errInvalidUrl"],
    ["fetch_failed", "persona.editor.errFetch"],
    ["fetch_too_large", "persona.editor.errTooLarge"],
    ["id_mismatch", "persona.editor.errGeneric"],
  ] as const)("renders the per-kind message for %s", async (error, key) => {
    saveMock.mockResolvedValue({ ok: false, error });
    render(<PersonaEditor initialContent="" slug="jane-d" />);
    fireEvent.change(screen.getByLabelText(s("persona.editor.urlLabel")), {
      target: { value: "https://raw.githubusercontent.com/x/y/main/z.md" },
    });
    fireEvent.click(screen.getByRole("button", { name: s("persona.editor.fetchAttach") }));
    expect(await screen.findByText(s(key))).toBeInTheDocument();
  });
});

describe("PersonaEditor — Re-sync (v0.12)", () => {
  it("hides the Re-sync pill without initialSourceUrl", () => {
    render(<PersonaEditor initialContent="" slug="jane-d" />);
    expect(screen.queryByRole("button", { name: s("persona.editor.resync") })).toBeNull();
  });

  it("shows the Re-sync pill with initialSourceUrl and calls resyncPersona", async () => {
    resyncMock.mockResolvedValue({ ok: true, savedAt: "2026-06-10T00:00:00.000Z" });
    render(
      <PersonaEditor
        initialContent=""
        slug="jane-d"
        initialSourceUrl="https://raw.githubusercontent.com/jane/p/main/persona-jane-d.public.md"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: s("persona.editor.resync") }));
    expect(await screen.findByText(s("persona.editor.attached"))).toBeInTheDocument();
    expect(resyncMock).toHaveBeenCalledTimes(1);
  });
});

describe("PersonaEditor — no hardcoded status strings (v0.12 i18n flip)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/PersonaEditor.tsx"),
    "utf8",
  );
  it("v0.11.1 literals are gone; status strings route through s()", () => {
    expect(src).not.toMatch(/Attached — your card/);
    expect(src).not.toMatch(/Couldn&apos;t attach/);
    expect(src).not.toMatch(/"Attaching…"/);
    expect(src).toMatch(/s\("persona\.editor\.attached"\)/);
    expect(src).toMatch(/s\("persona\.editor\.attaching"\)/);
    expect(src).toMatch(/s\("persona\.editor\.errInvalidUrl"\)/);
    expect(src).toMatch(/s\("persona\.editor\.errGeneric"\)/);
  });
});
