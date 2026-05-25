# Subploters brand assets — export kit

Production-ready brand assets, brand v1.2 (locked 2026-05-25). Every asset is generated from the canonical sources in `../assets/` + the path-drawing pipeline in `../scripts/` / `../.scratch/`. All vector text is **path-drawn** (Geist SemiBold, Geist Medium Italic, JetBrains Mono) so the SVGs render identically without any font installed.

**License:** CC0 1.0 Universal (see `../LICENSE.md`). Use, remix, fork, or commercialize freely.

To regenerate this whole folder: `node community/brand/.scratch/build-exports.js` (needs the gitignored `.scratch/node_modules` — see `../scripts/build-lockup.js` header for setup, plus `npm install pdfkit svg-to-pdfkit @fontsource/jetbrains-mono`).

---

## What's the mark vs the symbol

- **Wordmark / master lockup** — `Subploters` with the amber **PL** monogram fused inline (replacing the "pl" letters) + trailing amber `*`. This is the primary identity. The PL only ever appears **inline inside this wordmark** — never as a standalone symbol.
- **Standalone symbol** — the amber-field **S** (`symbol/`). This is what shows up small and on its own: favicon, app icon, social avatar, Telegram photo. Substack lineage (first letter of the wordmark as a bold solid-field glyph).

---

## Folder map

| Folder | Asset | Use |
|---|---|---|
| `lockup/` | Master wordmark lockup (light + dark), inline PL + trailing `*` | Headers, deck covers, marketing, anywhere the wordmark reads at size |
| `symbol/` | Amber-field **S** standalone symbol + `favicon.ico` | Favicon, app icon, avatar, any compact standalone mark |
| `wordmark/` | Secondary plain Geist wordmark (no inline PL) | SVG-only contexts where the full lockup is too expressive |
| `city-stamp/` | `psa-warsaw` (standalone, −1.5° tilt) + `warsaw-chip` (chrome, upright) | Location identification; tilted on decks/social, upright in app chrome |
| `location-submark/` | `subploters-warsaw` — lockup + `PSA · WARSAW` stamp, stacked | Local landing pages, city deck covers, `@subploters_warsaw` social |
| `og/` | `og-light` + `og-dark`, 1200×630 | Open Graph / Twitter link-preview cards |
| `telegram/` | `telegram-group-photo.png`, 512×512 | Telegram group photo (Telegram circle-crops it) |

## Formats

- **SVG** — vector source, path-drawn, font-independent. Primary format; scale to anything.
- **PNG** — raster at multiple widths. Wide marks: 600 / 1200 / 1800 / 2400 px. Symbol: 16 / 32 / 48 / 180 / 192 / 256 / 512 / 1024 / 2048 px.
- **PDF** — vector, for print (posters, merch, decks).
- **favicon.ico** — multi-resolution (16/32/48), in `symbol/`.

## Colors

| Role | Hex |
|---|---|
| Amber (accent + symbol field) | `#f59e0b` |
| Cream (field) | `#fef6e6` |
| Ink (text / symbol letter) | `#1a1a2e` |
| Dust (captions / metadata) | `#886c37` |

## Quick picks

- **Website favicon** → `symbol/favicon.ico` + `symbol/subploters-symbol-{16,32,180,192,512}.png`
- **Telegram group photo** → `telegram/telegram-group-photo.png` (upload as-is)
- **Social link preview** → `og/og-light-1200x630.png` (or `og-dark` for higher feed contrast)
- **Slide deck cover** → `lockup/subploters-lockup-2400.png` or the `.pdf`
- **Print / merch** → the `.pdf` in any folder (vector, scales to any size)

## Multi-location

Warsaw only for now (brand v1.2 is Polish-only). Other PL cities (Kraków, Gdańsk, Wrocław, Poznań, Łódź) are stamp-replaceable: change `CITY` in `../.scratch/build-exports.js` and re-run to generate `city-stamp/` + `location-submark/` for that city.
