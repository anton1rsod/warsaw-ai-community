// build-psa-candidates.js — chat-40 v1.2 brand exploration
//
// Generates 4 PSA monogram architecture candidates for the v1.2 standalone-mark
// brainstorm (replacing the retired PL monogram). Uses the same opentype.js + Geist
// SemiBold pipeline as chat-38's build-lockup.js — real letter paths, no font
// dependency at render time.
//
// Output:
//   community/brand/.scratch/output/psa-arch-1-interlocked.svg
//   community/brand/.scratch/output/psa-arch-2-stacked.svg
//   community/brand/.scratch/output/psa-arch-3-badge.svg
//   community/brand/.scratch/output/psa-arch-4-pillars.svg
//   <visual-companion screen_dir>/q1-psa-candidates.html  (inlined comparison board)
//
// This is exploration scaffolding, not canonical brand assets. Outputs land in
// .scratch/output (gitignored). Once Anton picks a winning architecture in round 1,
// a follow-up round renders 4-6 variants of the chosen architecture, then the
// final winner gets path-drawn into community/brand/assets/ with a proper build script.
//
// Run from anywhere:
//   node community/brand/scripts/build-psa-candidates.js [--screen-dir PATH]

const fs = require('fs');
const path = require('path');

const NODE_MODULES = path.resolve(__dirname, '../.scratch/node_modules');
const opentype = require(path.join(NODE_MODULES, 'opentype.js'));
const FONT_PATH = path.join(NODE_MODULES, 'geist/dist/fonts/geist-sans/Geist-SemiBold.ttf');
const OUTPUT_DIR = path.resolve(__dirname, '../.scratch/output');

const FONT_SIZE = 1000;
const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';

// Optional --screen-dir flag for writing the comparison HTML to the visual
// companion's content directory. If omitted, comparison HTML lands in OUTPUT_DIR.
const args = process.argv.slice(2);
const screenDirIdx = args.indexOf('--screen-dir');
const SCREEN_DIR = screenDirIdx >= 0 ? args[screenDirIdx + 1] : null;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const fontBuffer = fs.readFileSync(FONT_PATH);
const font = opentype.parse(
  fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength)
);
const upm = font.unitsPerEm;
const CAP_HEIGHT =
  (font.tables.os2 && font.tables.os2.sCapHeight ? font.tables.os2.sCapHeight : 700) *
  FONT_SIZE /
  upm;

console.log(`Font: Geist SemiBold, unitsPerEm=${upm}, capHeight=${CAP_HEIGHT.toFixed(1)}px at size ${FONT_SIZE}`);

function letterPath(text, x, y) {
  return font.getPath(text, x, y, FONT_SIZE).toPathData(2);
}
function letterWidth(text) {
  return font.getAdvanceWidth(text, FONT_SIZE);
}

// === Architecture 1: Interlocked horizontal ligature ===
// PSA tight-set in a row, ink letters. Negative letter-spacing creates a
// monogram-density feel without custom path editing (NYC/MIT lineage at
// approximation level — proper interlock would require glyph editing).
function buildArch1() {
  const baselineY = CAP_HEIGHT;
  // -4% advance width: letters touch / barely overlap, reading as one shape
  const kern = -FONT_SIZE * 0.04;

  const pW = letterWidth('P');
  const sW = letterWidth('S');
  const aW = letterWidth('A');

  const pX = 0;
  const sX = pX + pW + kern;
  const aX = sX + sW + kern;
  const totalWidth = aX + aW;

  const pPath = letterPath('P', pX, baselineY);
  const sPath = letterPath('S', sX, baselineY);
  const aPath = letterPath('A', aX, baselineY);

  const pad = FONT_SIZE * 0.08;
  const vbX = -pad;
  const vbY = -pad;
  const vbW = totalWidth + 2 * pad;
  const vbH = baselineY + pad;
  const cx = totalWidth / 2;
  const cy = baselineY / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}" role="img" aria-label="PSA interlocked horizontal monogram">
  <title>PSA Architecture 1 — Interlocked horizontal</title>
  <g transform="rotate(-3 ${cx.toFixed(0)} ${cy.toFixed(0)})">
    <path d="${pPath}" fill="${COLOR_INK}"/>
    <path d="${sPath}" fill="${COLOR_INK}"/>
    <path d="${aPath}" fill="${COLOR_INK}"/>
  </g>
</svg>
`;
}

// === Architecture 2: Stacked vertical ===
// P / S / A stacked vertically with tight line-height. Amber S in middle for
// vertical eye-flow + accent. Square-ish silhouette, favicon-friendlier than
// horizontal because letters become readable rows at small scale.
function buildArch2() {
  const lineGap = CAP_HEIGHT * 0.92; // tight stacking — letters almost touch

  const pY = CAP_HEIGHT;
  const sY = pY + lineGap;
  const aY = sY + lineGap;

  const pW = letterWidth('P');
  const sW = letterWidth('S');
  const aW = letterWidth('A');
  const maxW = Math.max(pW, sW, aW);

  const pPath = letterPath('P', (maxW - pW) / 2, pY);
  const sPath = letterPath('S', (maxW - sW) / 2, sY);
  const aPath = letterPath('A', (maxW - aW) / 2, aY);

  const totalH = aY;
  const pad = FONT_SIZE * 0.08;
  const vbX = -pad;
  const vbY = -pad;
  const vbW = maxW + 2 * pad;
  const vbH = totalH + pad;
  const cx = maxW / 2;
  const cy = totalH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}" role="img" aria-label="PSA stacked vertical monogram">
  <title>PSA Architecture 2 — Stacked vertical with amber S accent</title>
  <g transform="rotate(-3 ${cx.toFixed(0)} ${cy.toFixed(0)})">
    <path d="${pPath}" fill="${COLOR_INK}"/>
    <path d="${sPath}" fill="${COLOR_AMBER}"/>
    <path d="${aPath}" fill="${COLOR_INK}"/>
  </g>
</svg>
`;
}

// === Architecture 3: Block badge ===
// PSA stacked tight inside an amber square. Cream letters on amber field —
// the badge IS the mark at favicon scale; letters become texture. Polish
// Stowarzyszenie seal lineage / association-badge attitude.
function buildArch3() {
  const lineGap = CAP_HEIGHT * 0.95;
  const pY = CAP_HEIGHT;
  const sY = pY + lineGap;
  const aY = sY + lineGap;

  const pW = letterWidth('P');
  const sW = letterWidth('S');
  const aW = letterWidth('A');
  const maxW = Math.max(pW, sW, aW);

  const innerPad = FONT_SIZE * 0.22;
  const badgeW = maxW + 2 * innerPad;
  const badgeH = aY + innerPad - CAP_HEIGHT * 0.15; // tighter bottom; ascender pad already in pY

  const letterTx = innerPad;
  const letterTy = innerPad - CAP_HEIGHT * 0.15;

  const pPath = letterPath('P', (maxW - pW) / 2, pY);
  const sPath = letterPath('S', (maxW - sW) / 2, sY);
  const aPath = letterPath('A', (maxW - aW) / 2, aY);

  const outerPad = FONT_SIZE * 0.10;
  const vbX = -outerPad;
  const vbY = -outerPad;
  const vbW = badgeW + 2 * outerPad;
  const vbH = badgeH + 2 * outerPad;
  const cx = badgeW / 2;
  const cy = badgeH / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}" role="img" aria-label="PSA block badge">
  <title>PSA Architecture 3 — Block badge (Stowarzyszenie seal)</title>
  <g transform="rotate(-3 ${cx.toFixed(0)} ${cy.toFixed(0)})">
    <rect x="0" y="0" width="${badgeW.toFixed(0)}" height="${badgeH.toFixed(0)}" fill="${COLOR_AMBER}"/>
    <g transform="translate(${letterTx.toFixed(0)} ${letterTy.toFixed(0)})">
      <path d="${pPath}" fill="${COLOR_CREAM}"/>
      <path d="${sPath}" fill="${COLOR_CREAM}"/>
      <path d="${aPath}" fill="${COLOR_CREAM}"/>
    </g>
  </g>
</svg>
`;
}

// === Architecture 4: Architectural pillars ===
// Three letters with extended vertical amber pillar bars below. Letter heads
// atop columns — monumental, columnar, Polish heraldic feel. Strong silhouette
// (3 vertical lines + 3 letter-heads) survives favicon scale.
function buildArch4() {
  const baselineY = CAP_HEIGHT;
  const pillarH = CAP_HEIGHT * 1.4;
  const pillarGapBelowLetter = FONT_SIZE * 0.06;

  const gap = FONT_SIZE * 0.10;
  const pW = letterWidth('P');
  const sW = letterWidth('S');
  const aW = letterWidth('A');

  const pX = 0;
  const sX = pX + pW + gap;
  const aX = sX + sW + gap;
  const totalW = aX + aW;

  const pillarW = FONT_SIZE * 0.10;
  const pPillarX = pX + (pW - pillarW) / 2;
  const sPillarX = sX + (sW - pillarW) / 2;
  const aPillarX = aX + (aW - pillarW) / 2;
  const pillarY = baselineY + pillarGapBelowLetter;

  const pPath = letterPath('P', pX, baselineY);
  const sPath = letterPath('S', sX, baselineY);
  const aPath = letterPath('A', aX, baselineY);

  const pad = FONT_SIZE * 0.08;
  const vbX = -pad;
  const vbY = -pad;
  const vbW = totalW + 2 * pad;
  const vbH = pillarY + pillarH + pad;
  const cx = totalW / 2;
  const cy = (pillarY + pillarH) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}" role="img" aria-label="PSA architectural pillars monogram">
  <title>PSA Architecture 4 — Pillars (letter atop column)</title>
  <g transform="rotate(-3 ${cx.toFixed(0)} ${cy.toFixed(0)})">
    <rect x="${pPillarX.toFixed(0)}" y="${pillarY.toFixed(0)}" width="${pillarW.toFixed(0)}" height="${pillarH.toFixed(0)}" fill="${COLOR_AMBER}"/>
    <rect x="${sPillarX.toFixed(0)}" y="${pillarY.toFixed(0)}" width="${pillarW.toFixed(0)}" height="${pillarH.toFixed(0)}" fill="${COLOR_AMBER}"/>
    <rect x="${aPillarX.toFixed(0)}" y="${pillarY.toFixed(0)}" width="${pillarW.toFixed(0)}" height="${pillarH.toFixed(0)}" fill="${COLOR_AMBER}"/>
    <path d="${pPath}" fill="${COLOR_INK}"/>
    <path d="${sPath}" fill="${COLOR_INK}"/>
    <path d="${aPath}" fill="${COLOR_INK}"/>
  </g>
</svg>
`;
}

const variants = [
  { id: 1, slug: 'interlocked', name: 'Interlocked horizontal',
    desc: 'PSA tight-set in a row. Letters touch via -4% kerning, ink on cream.',
    risk: 'At -4% kerning, opentype letters approximate a ligature feel. True interlocked monograms (NYC/MIT) require custom path editing.',
    svg: buildArch1() },
  { id: 2, slug: 'stacked', name: 'Stacked vertical',
    desc: 'P / S / A stacked with tight line-gap. Amber S in middle as vertical-flow accent.',
    risk: 'Squarish silhouette could feel like a sticker more than a mark. Amber S is the eye anchor.',
    svg: buildArch2() },
  { id: 3, slug: 'badge', name: 'Block badge',
    desc: 'Amber square with cream PSA stacked inside. Badge dominates silhouette at small scale.',
    risk: `Polish Stowarzyszenie seal energy — could read institutional. Inverts the brand's "amber as accent, not field" rule.`,
    svg: buildArch3() },
  { id: 4, slug: 'pillars', name: 'Architectural pillars',
    desc: 'PSA letters atop three amber vertical bars. Monumental colonnade feel.',
    risk: 'Architectural attitude may pull away from venture-studio modern. Pillars could read as decoration not identity.',
    svg: buildArch4() },
];

for (const v of variants) {
  const outPath = path.join(OUTPUT_DIR, `psa-arch-${v.id}-${v.slug}.svg`);
  fs.writeFileSync(outPath, v.svg);
  console.log(`  wrote ${outPath}`);
}

// === Comparison HTML for visual companion ===
const html = `<h2>Q1 round 2 — PSA monogram architectures (chat-37 quality)</h2>
<p class="subtitle">Real Geist SemiBold path-drawn letters via opentype.js. Pick the architecture that feels Subploters. Round 2 will drill into the winner with 4-6 variants (accent placement, kerning, rotation, scale).</p>

<div class="section">
  <p class="label">Quality bar reference — v1.1 retired PL mark</p>
  <div style="display:flex; align-items:center; gap:20px; padding:14px; border:1.5px solid rgba(0,0,0,0.1); background:#fef6e6; opacity:0.6">
    <svg viewBox="0 0 512 512" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-3 256 256)">
        <path fill-rule="evenodd" fill="#f59e0b" d="M 140 116 L 190 116 C 234 116 270 146 270 184 C 270 222 234 252 190 252 L 190 396 L 140 396 Z M 190 144 L 220 144 C 235 144 248 162 248 184 C 248 206 235 224 220 224 L 190 224 Z M 300 116 L 350 116 L 350 360 L 390 360 L 390 396 L 300 396 Z"/>
      </g>
    </svg>
    <div style="font-size:13px; color:#1a1a2e"><strong>chat-37 Concept 11 path quality</strong><br/><span style="opacity:0.7">Ring-shaped P bowl with interior daylight, trimmed L foot, -3° rotation. Matched in all 4 candidates below.</span></div>
  </div>
</div>

<div class="cards">
${variants
  .map(
    (v) => `  <div class="card" data-choice="arch-${v.id}-${v.slug}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fef6e6; display:flex; align-items:center; justify-content:center; padding:36px; min-height:200px">
      <div style="width:160px; height:160px; display:flex; align-items:center; justify-content:center">${v.svg.replace(/^<svg /, '<svg style="max-width:100%;max-height:100%" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
    </div>
    <div class="card-body">
      <h3>${v.id}. ${v.name}</h3>
      <p>${v.desc}</p>
      <p style="opacity:0.7; font-size:13px"><strong>Risk:</strong> ${v.risk}</p>
      <div style="display:flex; gap:8px; margin-top:12px; padding:8px; background:#fef6e6">
        <div style="display:flex; align-items:center; justify-content:center; width:32px; height:32px; background:#fff; border:1px solid rgba(0,0,0,0.1)">${v.svg.replace(/^<svg /, '<svg style="max-width:24px;max-height:24px" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
        <div style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; background:#fff; border:1px solid rgba(0,0,0,0.1)">${v.svg.replace(/^<svg /, '<svg style="max-width:18px;max-height:18px" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
        <div style="display:flex; align-items:center; justify-content:center; width:16px; height:16px; background:#fff; border:1px solid rgba(0,0,0,0.1)">${v.svg.replace(/^<svg /, '<svg style="max-width:12px;max-height:12px" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
        <span style="font-size:11px; opacity:0.6; line-height:1.4; align-self:center">favicon sizes:<br/>32 / 24 / 16 px</span>
      </div>
    </div>
  </div>`
  )
  .join('\n')}
</div>

<div class="section" style="margin-top:32px; padding:20px; border-left:3px solid #f59e0b; background:rgba(245,158,11,0.06)">
  <p style="margin:0"><strong>How to respond:</strong> click the architecture you want to develop further, or reply in terminal with "drill into N" / "all are weak, try X direction" / "none of these — open a new round."</p>
  <p style="margin:8px 0 0; opacity:0.7; font-size:13px">After you pick, round 2 will render 4-6 variants of the winning architecture (different accent placement, kerning, color treatments). That's the round where the final form locks.</p>
</div>
`;

const compOut = SCREEN_DIR
  ? path.join(SCREEN_DIR, 'q1-psa-candidates.html')
  : path.join(OUTPUT_DIR, 'q1-psa-candidates.html');
fs.writeFileSync(compOut, html);
console.log(`  wrote ${compOut}`);
console.log(`Done. Open in browser via the visual companion server.`);
