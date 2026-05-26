import type { JSX } from "react";

interface BrandStarProps {
  /**
   * Optional override for the asterisk color. Defaults to brand amber `#f59e0b`.
   * Override when rendering on an amber background (rare — the brand-signature
   * `*` is typically rendered on cream or ink fields where amber holds contrast).
   */
  color?: string;
}

/**
 * Brand-signature `*` — renders the trailing asterisk next to plain-text
 * "Subploters" mentions per `community/brand/brand.md` §3.
 *
 * The master lockup SVG already bakes the `*` into its path data — this
 * component is for plain-text contexts only (footer copyright, formal entity,
 * masthead headline / subtitle, body copy).
 *
 * H93: `aria-hidden="true"` because the `*` is decorative brand signature;
 * screen readers should hear "Subploters", not "Subploters star".
 *
 * Per §3 typography:
 *   - Color: amber `#f59e0b`
 *   - Size: 0.55em of surrounding text
 *   - Position: superscript (`vertical-align: 0.55em`)
 *   - Spacing: `margin-left: 0.05em` from preceding letter
 *   - Weight: inherits from surrounding text
 */
export function BrandStar({ color = "#f59e0b" }: BrandStarProps = {}): JSX.Element {
  return (
    <sup
      aria-hidden="true"
      style={
        {
          "--brand-star-color": color,
          color: "var(--brand-star-color)",
          fontSize: "0.55em",
          lineHeight: 0,
          verticalAlign: "0.55em",
          marginLeft: "0.05em",
          fontWeight: "inherit",
        } as React.CSSProperties
      }
    >
      *
    </sup>
  );
}
