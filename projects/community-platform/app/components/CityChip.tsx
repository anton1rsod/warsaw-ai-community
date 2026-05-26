import type { JSX } from "react";

interface CityChipProps {
  city: string;
}

/**
 * Chrome variant of the §4.3 city stamp — used in the platform Header
 * adjacent to the master wordmark. Per `community/brand/brand.md` §4.3
 * "Chrome variant":
 *
 *   - Format: CITY only (no `PSA ·` prefix — PSA is implied by the adjacent
 *     master wordmark; doubling reads redundant)
 *   - Typography: JetBrains Mono (font-voice), weight 500, all caps,
 *     letter-spacing 0.18em
 *   - Background: amber `#f59e0b` (bg-accent-500)
 *   - Text color: ink `#1a1a2e` (text-ink)
 *   - Padding: 3px 8px (small chrome footprint)
 *   - Border-radius: 0
 *   - Rotation: 0° (upright — chrome's upright grid would read tilt as a
 *     rendering bug; the standalone §4.3 variant elsewhere keeps the -1.5°
 *     tilt for decks / landing pages / posters)
 *
 * H94: server-rendered + inline-styled. No client hydration, no animations.
 */
export function CityChip({ city }: CityChipProps): JSX.Element {
  return (
    <span
      className="bg-accent-500 text-ink font-voice font-medium uppercase inline-block"
      style={{
        padding: "3px 8px",
        fontSize: "9px",
        letterSpacing: "0.18em",
        borderRadius: 0,
      }}
    >
      {city}
    </span>
  );
}
