import React from "react";

type MonoLabelTag = "p" | "div" | "span";

interface MonoLabelProps {
  children: React.ReactNode;
  as?: MonoLabelTag;
}

const CLASSES = "font-voice text-[10px] uppercase tracking-[1.5px] text-dust";

export function MonoLabel({ children, as = "p" }: MonoLabelProps): React.JSX.Element {
  if (as === "div") return <div className={CLASSES}>{children}</div>;
  if (as === "span") return <span className={CLASSES}>{children}</span>;
  return <p className={CLASSES}>{children}</p>;
}
