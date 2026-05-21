import React from "react";

interface AmberTagProps {
  children: React.ReactNode;
  className?: string;
}

export function AmberTag({ children, className = "" }: AmberTagProps): React.JSX.Element {
  return (
    <span className={`bg-accent-500 px-[5px] -rotate-[1.5deg] inline-block ${className}`}>
      {children}
    </span>
  );
}
