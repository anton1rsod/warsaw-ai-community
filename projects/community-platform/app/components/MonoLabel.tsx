import React from "react";

type MonoLabelTag = "p" | "div" | "span" | "h2" | "h3";

interface MonoLabelProps {
  children: React.ReactNode;
  as?: MonoLabelTag;
}

const CLASSES = "font-voice text-[10px] uppercase tracking-[1.5px] text-dust";

export function MonoLabel({ children, as = "p" }: MonoLabelProps): React.JSX.Element {
  if (as === "div") return <div className={CLASSES}>{children}</div>;
  if (as === "span") return <span className={CLASSES}>{children}</span>;
  if (as === "h2") return <h2 className={CLASSES}>{children}</h2>;
  if (as === "h3") return <h3 className={CLASSES}>{children}</h3>;
  return <p className={CLASSES}>{children}</p>;
}
