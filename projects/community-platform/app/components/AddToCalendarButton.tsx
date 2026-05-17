"use client";

import { useCallback } from "react";

interface AddToCalendarButtonProps {
  ics: string;
  filename: string;
}

export function AddToCalendarButton({
  ics,
  filename,
}: AddToCalendarButtonProps): React.JSX.Element {
  const handleClick = useCallback(() => {
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [ics, filename]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
    >
      Add to Calendar
    </button>
  );
}
