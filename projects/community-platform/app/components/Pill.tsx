import React from "react";

export type PillVariant = "going" | "dashed" | "solid";

interface PillCommon {
  variant: PillVariant;
  children: React.ReactNode;
}

export type PillProps = PillCommon &
  (
    | { href: string; external?: boolean; type?: never; onClick?: never; disabled?: never }
    | { type: "button" | "submit"; href?: never; external?: never; onClick?: () => void; disabled?: boolean }
  );

const BASE = "px-[11px] py-[4px] inline-block font-voice font-bold text-[10px] transition-colors duration-150";

const VARIANT: Record<PillVariant, string> = {
  going:  "bg-ink text-cream hover:bg-accent-500 hover:text-ink focus-visible:bg-accent-500 focus-visible:text-ink",
  dashed: "border-[1.5px] border-dashed border-ink text-ink bg-transparent hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream",
  solid:  "border-[1.5px] border-solid border-ink text-ink bg-transparent hover:bg-ink hover:text-cream focus-visible:bg-ink focus-visible:text-cream",
};

export function Pill(props: PillProps): React.JSX.Element {
  const cls = `${BASE} ${VARIANT[props.variant]}`;
  if ("href" in props && props.href !== undefined) {
    if (props.external) {
      return (
        <a
          className={cls}
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.children}
        </a>
      );
    }
    return <a className={cls} href={props.href}>{props.children}</a>;
  }
  return (
    <button
      className={cls}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}
