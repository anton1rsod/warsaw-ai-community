"use client";

import { useCallback } from "react";
import { Pill } from "@/app/components/Pill";

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
    <Pill type="button" variant="dashed" onClick={handleClick}>
      Add to Calendar
    </Pill>
  );
}
