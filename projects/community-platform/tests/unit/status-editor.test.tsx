import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  StatusEditor,
  type StatusEditorActions,
} from "@/app/components/StatusEditor";

afterEach(() => {
  cleanup();
});

function fakeActions(): StatusEditorActions {
  return {
    postStatus: vi.fn(async () => ({ ok: true as const, sha: "newsha" })),
    editStatus: vi.fn(async () => ({ ok: true as const, sha: "updated" })),
    deleteStatus: vi.fn(async () => ({ ok: true as const, sha: "" })),
  };
}

describe("StatusEditor", () => {
  it("renders empty input when no current status (Quick mode default)", () => {
    render(
      <StatusEditor week="2026-W18" current={null} actions={fakeActions()} />,
    );
    // New posts default to Quick (shipping-log) mode — single-line input
    const input = screen.getByLabelText(/shipping log/i) as HTMLInputElement;
    expect(input.value).toBe("");
    expect(
      screen.getByRole("button", { name: /post/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("renders current body + Update + Delete when editing", () => {
    render(
      <StatusEditor
        week="2026-W18"
        current={{ body: "Existing", sha: "s1" }}
        actions={fakeActions()}
      />,
    );
    const textarea = screen.getByLabelText(
      /what are you working on/i,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("Existing");
    expect(
      screen.getByRole("button", { name: /update/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /delete/i }),
    ).toBeInTheDocument();
  });

  it("calls postStatus when no current status and form submitted (Quick mode)", async () => {
    const actions = fakeActions();
    render(
      <StatusEditor week="2026-W18" current={null} actions={actions} />,
    );
    // New posts default to Quick mode — use the shipping-log input
    fireEvent.change(screen.getByLabelText(/shipping log/i), {
      target: { value: "New status" },
    });
    fireEvent.click(screen.getByRole("button", { name: /post/i }));
    await screen.findByText(/posted/i);
    expect(actions.postStatus).toHaveBeenCalledWith({
      week: "2026-W18",
      body: "New status",
      mode: "shipping-log",
    });
  });

  it("calls editStatus with SHA when current present", async () => {
    const actions = fakeActions();
    render(
      <StatusEditor
        week="2026-W18"
        current={{ body: "Existing", sha: "s1" }}
        actions={actions}
      />,
    );
    fireEvent.change(screen.getByLabelText(/what are you working on/i), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await screen.findByText(/updated/i);
    expect(actions.editStatus).toHaveBeenCalledWith({
      week: "2026-W18",
      body: "Updated",
      mode: "rich",
      sha: "s1",
    });
  });

  it("shows refresh prompt on sha_conflict", async () => {
    const actions = fakeActions();
    actions.editStatus = vi.fn(async () => ({
      ok: false as const,
      error: "sha_conflict" as const,
    }));
    render(
      <StatusEditor
        week="2026-W18"
        current={{ body: "x", sha: "s1" }}
        actions={actions}
      />,
    );
    fireEvent.change(screen.getByLabelText(/what are you working on/i), {
      target: { value: "y" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await screen.findByText(/refresh/i);
  });

  it("shows generic error message for non-conflict failures", async () => {
    const actions = fakeActions();
    actions.postStatus = vi.fn(async () => ({
      ok: false as const,
      error: "forbidden" as const,
    }));
    render(
      <StatusEditor week="2026-W18" current={null} actions={actions} />,
    );
    // New posts default to Quick mode — use the shipping-log input
    fireEvent.change(screen.getByLabelText(/shipping log/i), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: /post/i }));
    await screen.findByText(/forbidden/i);
  });

  it("calls deleteStatus and clears the form on success", async () => {
    const actions = fakeActions();
    render(
      <StatusEditor
        week="2026-W18"
        current={{ body: "to delete", sha: "s1" }}
        actions={actions}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await screen.findByText(/deleted/i);
    expect(actions.deleteStatus).toHaveBeenCalledWith({
      week: "2026-W18",
      sha: "s1",
    });
    // After successful delete, form is back to "Post" mode (no Update/Delete).
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /delete/i }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /post/i }),
    ).toBeInTheDocument();
    expect(
      (screen.getByLabelText(/what are you working on/i) as HTMLTextAreaElement)
        .value,
    ).toBe("");
  });

  it("shows error on delete failure", async () => {
    const actions = fakeActions();
    actions.deleteStatus = vi.fn(async () => ({
      ok: false as const,
      error: "not_found" as const,
    }));
    render(
      <StatusEditor
        week="2026-W18"
        current={{ body: "x", sha: "s1" }}
        actions={actions}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await screen.findByText(/not_found/i);
  });

  it("disables submit button when textarea is empty", () => {
    render(
      <StatusEditor week="2026-W18" current={null} actions={fakeActions()} />,
    );
    expect(screen.getByRole("button", { name: /post/i })).toBeDisabled();
  });

  it("renders the week prompt with the provided week token", () => {
    render(
      <StatusEditor week="2026-W42" current={null} actions={fakeActions()} />,
    );
    expect(screen.getByLabelText(/2026-W42/i)).toBeInTheDocument();
  });
});

describe("StatusEditor v0.9.1 — consumes Pill (H104)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/StatusEditor.tsx"),
    "utf8",
  );
  it("H104: uses Pill, not hand-rolled button classes", () => {
    expect(src).toMatch(/from "@\/app\/components\/Pill"/);
    expect(src).not.toMatch(/border-\[1\.5px\] border-(solid|dashed) border-ink/);
  });
});

describe("StatusEditor mode toggle (v0.10.0 Phase C)", () => {
  it('exposes Quick (shipping-log) + Rich (markdown) toggle Pills', () => {
    render(
      <StatusEditor
        week="2026-W22"
        current={null}
        actions={fakeActions()}
      />,
    );
    expect(screen.getByRole("button", { name: /quick/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rich/i })).toBeInTheDocument();
  });

  it("defaults to Quick mode for a fresh post (no current entry)", () => {
    render(
      <StatusEditor
        week="2026-W22"
        current={null}
        actions={fakeActions()}
      />,
    );
    // Quick mode = single-line input
    expect(screen.getByLabelText(/shipping log/i)).toBeInTheDocument();
    // Rich textarea is not visible by default
    expect(screen.queryByRole("textbox", { name: /what are you working on/i })).not.toBeInTheDocument();
  });

  it("switches to Rich mode when Rich Pill is clicked", () => {
    render(
      <StatusEditor
        week="2026-W22"
        current={null}
        actions={fakeActions()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /rich/i }));
    expect(screen.getByLabelText(/what are you working on/i)).toBeInTheDocument();
  });

  it("caps Quick input at 280 chars", () => {
    render(
      <StatusEditor
        week="2026-W22"
        current={null}
        actions={fakeActions()}
      />,
    );
    const input = screen.getByLabelText(/shipping log/i) as HTMLInputElement;
    expect(input.maxLength).toBe(280);
  });

  it("renders Rich mode when current entry exists (legacy edit case)", () => {
    render(
      <StatusEditor
        week="2026-W22"
        current={{ body: "Existing rich-mode body", sha: "abc" }}
        actions={fakeActions()}
      />,
    );
    expect(screen.getByLabelText(/what are you working on/i)).toBeInTheDocument();
  });
});

describe("StatusEditor v0.9 — warm-aesthetic, no dark:/scaffolding (H99)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/components/StatusEditor.tsx"),
    "utf8",
  );
  it("uses no Tailwind `dark:` variants", () => { expect(src).not.toMatch(/\bdark:/); });
  it("uses no neutral-* / gray-* color scale", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("uses no rounded-border scaffolding", () => { expect(src).not.toMatch(/\brounded\b/); });
  it("uses warm tokens on the form (bg-paper / font-body / text-ink / text-alert)", () => {
    expect(src).toMatch(/bg-paper|bg-cream-deep/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
});
