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
  it("renders empty textarea when no current status", () => {
    render(
      <StatusEditor week="2026-W18" current={null} actions={fakeActions()} />,
    );
    const textarea = screen.getByLabelText(
      /what are you working on/i,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");
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

  it("calls postStatus when no current status and form submitted", async () => {
    const actions = fakeActions();
    render(
      <StatusEditor week="2026-W18" current={null} actions={actions} />,
    );
    fireEvent.change(screen.getByLabelText(/what are you working on/i), {
      target: { value: "New status" },
    });
    fireEvent.click(screen.getByRole("button", { name: /post/i }));
    await screen.findByText(/posted/i);
    expect(actions.postStatus).toHaveBeenCalledWith({
      week: "2026-W18",
      body: "New status",
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
    fireEvent.change(screen.getByLabelText(/what are you working on/i), {
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
