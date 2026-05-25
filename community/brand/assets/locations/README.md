# Location sub-marks (brand.md §4.5)

Standalone, ready-to-use location sub-mark assets — the master lockup (v1.1: PL inline + trailing `*`) above the amber `PSA · CITY` city stamp at the §4.3 standard size and −1.5° tilt. For non-chrome surfaces: city landing pages, local deck covers, per-city social profiles (`@subploters_warsaw`), signage.

| File | City | Status |
|---|---|---|
| `subploters-warsaw.png` | Warsaw | Live |
| `subploters-krakow.png` | Kraków | Future-city example (system demo) |
| `subploters-gdansk.png` | Gdańsk | Future-city example (system demo) |

1339×436 px, cream field. **Stamp-replaceable:** same lockup, swap the city — regenerate any city via `../explorations/chat-41/scripts/build-location-assets.js <out-dir>` then screenshot the `#mark` element (the stamp uses the JetBrains Mono web font, so these are raster exports; a vector SVG export would need the JetBrains Mono TTF to path the stamp text).

The master lockup itself is at `../subploters-lockup.svg` (+ `-dark`); the standalone PL mark at `../subploters-mark.svg`.
