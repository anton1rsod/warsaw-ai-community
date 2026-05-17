import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { AddToCalendarButton } from "@/app/components/AddToCalendarButton";

interface UrlBlobApi {
  createObjectURL?: (b: Blob) => string;
  revokeObjectURL?: (u: string) => void;
}

const FAKE_ICS = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n";

describe("AddToCalendarButton (D16)", () => {
  let originalCreate: UrlBlobApi["createObjectURL"];
  let originalRevoke: UrlBlobApi["revokeObjectURL"];
  let createCalls = 0;
  let revokeCalls = 0;
  beforeEach(() => {
    originalCreate = (URL as unknown as UrlBlobApi).createObjectURL;
    originalRevoke = (URL as unknown as UrlBlobApi).revokeObjectURL;
    createCalls = 0;
    revokeCalls = 0;
    (URL as unknown as UrlBlobApi).createObjectURL = () => {
      createCalls++;
      return "blob:mock";
    };
    (URL as unknown as UrlBlobApi).revokeObjectURL = () => {
      revokeCalls++;
    };
  });
  afterEach(() => {
    (URL as unknown as UrlBlobApi).createObjectURL = originalCreate;
    (URL as unknown as UrlBlobApi).revokeObjectURL = originalRevoke;
    cleanup();
  });

  it("renders a button labeled 'Add to Calendar'", () => {
    render(<AddToCalendarButton ics={FAKE_ICS} filename="x.ics" />);
    expect(screen.getByRole("button", { name: /Add to Calendar/i })).toBeInTheDocument();
  });

  it("on click, creates an object URL and revokes it (no leak)", () => {
    render(<AddToCalendarButton ics={FAKE_ICS} filename="x.ics" />);
    fireEvent.click(screen.getByRole("button"));
    expect(createCalls).toBe(1);
    expect(revokeCalls).toBe(1);
  });

  it("attaches and detaches the download anchor (no DOM leak)", () => {
    render(<AddToCalendarButton ics={FAKE_ICS} filename="x.ics" />);
    fireEvent.click(screen.getByRole("button"));
    // After click, no stray <a download> should remain attached to body.
    expect(document.querySelectorAll("a[download]").length).toBe(0);
  });
});
