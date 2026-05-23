// build-lockup.js — chat-38 Path A
// Path-draws the Subploters wordmark in Geist SemiBold (600) with the PL monogram
// (chat-37 Concept 11) inline replacing the "pl" letters + trailing * qualifier.
//
// Setup (one-time per checkout):
//   mkdir -p community/brand/.scratch && cd community/brand/.scratch
//   npm init -y && npm install opentype.js geist png-to-ico
//
// Run from anywhere (paths resolve via __dirname):
//   node community/brand/scripts/build-lockup.js
//
// Outputs both variants to community/brand/assets/:
//   subploters-lockup.svg       — ink letters (cream/light backgrounds)
//   subploters-lockup-dark.svg  — cream letters (ink/dark backgrounds, e.g. platform header)
//
// To rebuild favicons (community/brand/assets/subploters-mark-*.png), see the inline
// sharp script invocation in brand.md §3 / community/brand/explorations/chat-38/README.md.

const fs = require('fs');
const path = require('path');

// node_modules lives in ../.scratch/ (gitignored). Resolve absolute paths so the script
// works regardless of CWD or where node_modules sits in the resolution chain.
const NODE_MODULES = path.resolve(__dirname, '../.scratch/node_modules');
const opentype = require(path.join(NODE_MODULES, 'opentype.js'));
const FONT_PATH = path.join(NODE_MODULES, 'geist/dist/fonts/geist-sans/Geist-SemiBold.ttf');
const OUTPUT_DIR = path.resolve(__dirname, '../assets');

const FONT_SIZE = 1000;
const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';

// Two variants emitted:
//   subploters-lockup.svg       — ink letters (for cream / light backgrounds — body content, deck covers)
//   subploters-lockup-dark.svg  — cream letters (for ink / dark backgrounds — header, footer, dark hero)
// PL monogram and trailing * are amber in both.
const VARIANTS = [
  { name: 'subploters-lockup.svg',      letterColor: COLOR_INK,   label: 'ink-on-cream (default)' },
  { name: 'subploters-lockup-dark.svg', letterColor: COLOR_CREAM, label: 'cream-on-ink (dark-mode)' },
];

// chat-37 Concept 11 PL monogram path
const PL_MONOGRAM_PATH = 'M 140 116 L 190 116 C 234 116 270 146 270 184 C 270 222 234 252 190 252 L 190 396 L 140 396 Z M 190 144 L 220 144 C 235 144 248 162 248 184 C 248 206 235 224 220 224 L 190 224 Z M 300 116 L 350 116 L 350 360 L 390 360 L 390 396 L 300 396 Z';
const PL_VIEWBOX = 512;
const PL_LEFT = 140;
const PL_RIGHT = 390;
const PL_TOP = 116;
const PL_BOTTOM = 396;
const PL_WIDTH = PL_RIGHT - PL_LEFT;   // 250
const PL_HEIGHT = PL_BOTTOM - PL_TOP;  // 280

const fontBuffer = fs.readFileSync(FONT_PATH);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));
const upm = font.unitsPerEm;

const ascenderPx = font.ascender * FONT_SIZE / upm;
const descenderPx = font.descender * FONT_SIZE / upm;
const descenderDepth = -descenderPx;
const capHeightPx = (font.tables.os2 && font.tables.os2.sCapHeight ? font.tables.os2.sCapHeight : 700) * FONT_SIZE / upm;
const xHeightPx = (font.tables.os2 && font.tables.os2.sxHeight ? font.tables.os2.sxHeight : 520) * FONT_SIZE / upm;

console.log('Font metrics:');
console.log(`  unitsPerEm = ${upm}`);
console.log(`  ascender = ${font.ascender} (${ascenderPx.toFixed(1)}px at size ${FONT_SIZE})`);
console.log(`  descender = ${font.descender} (${descenderPx.toFixed(1)}px)`);
console.log(`  capHeight = ${capHeightPx.toFixed(1)}px`);
console.log(`  xHeight = ${xHeightPx.toFixed(1)}px`);

const baselineY = ascenderPx;
const totalHeight = ascenderPx + descenderDepth;

console.log(`Baseline at y=${baselineY.toFixed(1)}, total height ${totalHeight.toFixed(1)}`);

// chat-38 v2 — Anton picked Option B: PL capped at cap-height (no descender extension).
// PL height = capHeightPx; PL bottom sits ON baseline (same vertical extent as a lowercase l ascender).
// Slot width = PL width + side padding (no longer matches "pl" advance width — wordmark becomes ~14% shorter
// but PL feels integrated rather than floating in a wide gap).
//
// Render "Sub" first to get its width:
const subPath = font.getPath('Sub', 0, baselineY, FONT_SIZE);
const subWidth = font.getAdvanceWidth('Sub', FONT_SIZE);

// PL scale + slot computation:
const plScale = capHeightPx / PL_HEIGHT;
const plScaledWidth = PL_WIDTH * plScale;
const plScaledHeight = PL_HEIGHT * plScale; // === capHeightPx
const PL_SIDE_PADDING = 40; // each side; tune visually
const plSlotWidth = plScaledWidth + 2 * PL_SIDE_PADDING;

// "oters" starts after Sub + PL slot:
const otersStartX = subWidth + plSlotWidth;
const otersPath = font.getPath('oters', otersStartX, baselineY, FONT_SIZE);
const otersWidth = font.getAdvanceWidth('oters', FONT_SIZE);

const totalWidth = otersStartX + otersWidth;
console.log(`Widths: Sub=${subWidth.toFixed(1)}, PL-slot=${plSlotWidth.toFixed(1)} (PL ${plScaledWidth.toFixed(1)} + ${2 * PL_SIDE_PADDING} padding), oters=${otersWidth.toFixed(1)}, total=${totalWidth.toFixed(1)}`);

// PL vertical placement (cap-height only, no descender):
//   PL bottom (viewBox y=396) → baselineY
//   PL top (viewBox y=116) → baselineY - capHeightPx
// Transform: translate(tx,ty) scale(s) rotate(-3 256 256)
//   tx + PL_LEFT * plScale = plRenderX
//   ty + PL_TOP * plScale = baselineY - capHeightPx
const plSlotCenter = subWidth + plSlotWidth / 2;
const plRenderX = plSlotCenter - plScaledWidth / 2;
const plTransformX = plRenderX - PL_LEFT * plScale;
const plTransformY = (baselineY - capHeightPx) - PL_TOP * plScale;

console.log(`PL: scale=${plScale.toFixed(3)}, rendered ${plScaledWidth.toFixed(1)}×${plScaledHeight.toFixed(1)}`);
console.log(`PL position: x=${plRenderX.toFixed(1)}, top=${(baselineY - capHeightPx).toFixed(1)}, bottom=${baselineY.toFixed(1)}`);

// Trailing * qualifier — small, amber, sits at cap-height position
// Use font glyph for the asterisk to keep it visually consistent
const ASTERISK_GAP = 40;
const ASTERISK_SIZE = FONT_SIZE * 0.42;
const asteriskX = totalWidth + ASTERISK_GAP;
// The * glyph in most fonts sits between x-height and cap-height. Render it at a smaller font size
// from a higher baseline so it appears in the superscript position.
// To put the small * around cap-height of the main text: render its baseline at (baselineY - capHeightPx + ASTERISK_SIZE * 0.7).
// The asterisk glyph internally sits roughly in the upper 60% of its em, so this approximates a superscript.
const asteriskBaselineY = (baselineY - capHeightPx) + ASTERISK_SIZE * 0.85;
const asteriskPath = font.getPath('*', asteriskX, asteriskBaselineY, ASTERISK_SIZE);
const asteriskWidth = font.getAdvanceWidth('*', ASTERISK_SIZE);
const finalRightX = asteriskX + asteriskWidth;

// Compose SVG — viewBox fits actual content extent (no wasted descender padding)
const subBB = subPath.getBoundingBox();
const otersBB = otersPath.getBoundingBox();
const asteriskBB = asteriskPath.getBoundingBox();
// PL bbox after transform: x covers [plRenderX, plRenderX + plScaledWidth];
// y covers [baselineY - capHeightPx, baselineY]. Rotation around center adds ~1° of overhang; small.
const plBB = {
  x1: plRenderX,
  y1: baselineY - capHeightPx,
  x2: plRenderX + plScaledWidth,
  y2: baselineY,
};
const bboxes = [subBB, otersBB, asteriskBB, plBB];
const contentMinX = Math.min.apply(null, bboxes.map(b => b.x1));
const contentMinY = Math.min.apply(null, bboxes.map(b => b.y1));
const contentMaxX = Math.max.apply(null, bboxes.map(b => b.x2));
const contentMaxY = Math.max.apply(null, bboxes.map(b => b.y2));

const padX = 80;
const padY = 80;
const vbX = contentMinX - padX;
const vbY = contentMinY - padY;
const vbW = (contentMaxX - contentMinX) + 2 * padX;
const vbH = (contentMaxY - contentMinY) + 2 * padY;
console.log(`Content bbox: x=[${contentMinX.toFixed(1)},${contentMaxX.toFixed(1)}] y=[${contentMinY.toFixed(1)},${contentMaxY.toFixed(1)}]`);

// Generate path d strings
const subD = subPath.toPathData(2);
const otersD = otersPath.toPathData(2);
const asteriskD = asteriskPath.toPathData(2);

function renderVariant(letterColor, label) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Subploters — Master wordmark (inline-fused lockup) — ${label}
  License: CC0 1.0 Universal (see ../LICENSE.md)
  Version: v1.1 (2026-05-23, chat-38 / Path A)

  Inline-fused lockup:
    - "Sub" path-drawn in Geist SemiBold (600)
    - PL monogram (chat-37 Concept 11) replaces inline "pl" letters
    - "oters" path-drawn in Geist SemiBold (600)
    - Trailing "*" qualifier (Geist SemiBold asterisk, amber, superscript position)

  All letters are path-drawn (no font dependency at render time).
  The PL monogram retains its -3° tilt (rotation around its viewBox center 256,256).

  Color scheme: ${label}
    - Letterforms: ${letterColor}
    - PL monogram + trailing *: amber #f59e0b

  Two variants ship: subploters-lockup.svg (ink on cream/light) and subploters-lockup-dark.svg (cream on ink/dark).

  Source: community/brand/scripts/build-lockup.js (regenerate with: node community/brand/scripts/build-lockup.js)
  Provenance: chat-37 Concept 11 + chat-37 Concept 14 (inline replacement intent), executed via path-drawing in chat-38.
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}" role="img" aria-label="Subploters">
  <title>Subploters</title>
  <path d="${subD}" fill="${letterColor}"/>
  <path d="${otersD}" fill="${letterColor}"/>
  <g transform="translate(${plTransformX.toFixed(2)} ${plTransformY.toFixed(2)}) scale(${plScale.toFixed(4)}) rotate(-3 ${PL_VIEWBOX/2} ${PL_VIEWBOX/2})">
    <path d="${PL_MONOGRAM_PATH}" fill="${COLOR_AMBER}" fill-rule="evenodd"/>
  </g>
  <path d="${asteriskD}" fill="${COLOR_AMBER}"/>
</svg>
`;
}

for (const variant of VARIANTS) {
  const svg = renderVariant(variant.letterColor, variant.label);
  const outPath = path.join(OUTPUT_DIR, variant.name);
  fs.writeFileSync(outPath, svg);
  console.log(`Wrote ${outPath} (${svg.length} bytes) — ${variant.label}`);
}
console.log(`viewBox shared: ${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}`);
