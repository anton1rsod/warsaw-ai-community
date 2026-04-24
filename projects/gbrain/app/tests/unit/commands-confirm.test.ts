import { describe, it, expect, vi } from "vitest";
import { handleConfirm } from "../../src/commands/confirm";

function makeStore(entries: Array<{ id: string }>) {
  return {
    enqueue: vi.fn(),
    cancel: vi.fn(),
    remove: vi.fn(),
    listReady: vi.fn(),
    all: vi.fn(() => entries)
  };
}

describe("handleConfirm", () => {
  it("cancels the pending entry when decision=no", async () => {
    const pending = makeStore([{ id: "abc" }]);
    const res = await handleConfirm({ decision: "no", entryId: "abc", pending: pending as never });
    expect(res).toEqual({ ok: true, action: "cancelled" });
    expect(pending.cancel).toHaveBeenCalledWith("abc");
  });

  it("reports committed-on-flush when decision=yes and entry still pending", async () => {
    const pending = makeStore([{ id: "abc" }]);
    const res = await handleConfirm({ decision: "yes", entryId: "abc", pending: pending as never });
    expect(res).toEqual({ ok: true, action: "committed-on-flush" });
    expect(pending.cancel).not.toHaveBeenCalled();
  });

  it("reports unknown when decision=yes and entry already flushed/cancelled", async () => {
    const pending = makeStore([]);
    const res = await handleConfirm({ decision: "yes", entryId: "abc", pending: pending as never });
    expect(res).toEqual({ ok: false, action: "unknown" });
  });
});
