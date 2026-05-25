// build-psa-badge-variants.js — chat-40 v1.2 brand exploration · Round 2
//
// Round 1 landed on Architecture 3 (Block badge). This script drills into 6 sub-variants
// exploring three orthogonal dimensions: aspect ratio (square / landscape / current
// portrait), color treatment (cream-on-amber / ink-on-amber / outline-only), and
// letter arrangement (stacked vs horizontal). All variants use real Geist SemiBold
// glyph paths via opentype.js, -3° rotation per v1.1 motif, 0 border-radius.
//
// Output:
//   community/brand/.scratch/output/psa-badge-v{a..f}.svg
//   <visual-companion screen_dir>/q2-badge-variants.html

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

const args = process.argv.slice(2);
const screenDirIdx = args.indexOf('--screen-dir');
const SCREEN_DIR = screenDirIdx >= 0 ? args[screenDirIdx + 1] : null;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const fontBuffer = fs.readFileSync(FONT_PATH);
const font = opentype.parse(
  fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength)
);
const upm = font.unitsPerEm;
const CAP =
  (font.tables.os2 && font.tables.os2.sCapHeight ? font.tables.os2.sCapHeight : 700) *
  FONT_SIZE /
  upm;

function letterPath(text, x, y, fontSize = FONT_SIZE) {
  return font.getPath(text, x, y, fontSize).toPathData(2);
}
function letterWidth(text, fontSize = FONT_SIZE) {
  return font.getAdvanceWidth(text, fontSize);
}

// Bounding box of a letter path (rough — uses advance width as width; glyph extent in y is cap-height)
function getLetterBBox(letter, fontSize = FONT_SIZE) {
  const p = font.getPath(letter, 0, 0, fontSize);
  return p.getBoundingBox();
}

// Build verticallyStackedLetters PATH group, returns { paths: [{d,fill}], bbox: {x1,y1,x2,y2} }
function buildStackedLetters(color, fontSize, lineGapFactor) {
  const cap = (font.tables.os2 && font.tables.os2.sCapHeight ? font.tables.os2.sCapHeight : 700) * fontSize / upm;
  const lineGap = cap * lineGapFactor;
  const pY = cap;
  const sY = pY + lineGap;
  const aY = sY + lineGap;
  const pW = letterWidth('P', fontSize);
  const sW = letterWidth('S', fontSize);
  const aW = letterWidth('A', fontSize);
  const maxW = Math.max(pW, sW, aW);
  return {
    paths: [
      { d: letterPath('P', (maxW - pW) / 2, pY, fontSize), fill: color },
      { d: letterPath('S', (maxW - sW) / 2, sY, fontSize), fill: color },
      { d: letterPath('A', (maxW - aW) / 2, aY, fontSize), fill: color },
    ],
    width: maxW,
    height: aY,
  };
}

// Build horizontallyRow letters PATH group
function buildHorizontalLetters(color, fontSize, kernFactor = 0) {
  const cap = (font.tables.os2 && font.tables.os2.sCapHeight ? font.tables.os2.sCapHeight : 700) * fontSize / upm;
  const baselineY = cap;
  const kern = fontSize * kernFactor;
  const pW = letterWidth('P', fontSize);
  const sW = letterWidth('S', fontSize);
  const aW = letterWidth('A', fontSize);
  const pX = 0;
  const sX = pX + pW + kern;
  const aX = sX + sW + kern;
  return {
    paths: [
      { d: letterPath('P', pX, baselineY, fontSize), fill: color },
      { d: letterPath('S', sX, baselineY, fontSize), fill: color },
      { d: letterPath('A', aX, baselineY, fontSize), fill: color },
    ],
    width: aX + aW,
    height: baselineY,
  };
}

// Compose a badge variant. badge: { aspectW, aspectH, padX, padY, letters, bgFill, borderStroke, borderWidth, innerRuleStroke, innerRuleOffset }
function composeBadge(spec) {
  const { letters, bgFill, borderStroke, borderWidth, innerRuleStroke, innerRuleOffset } = spec;

  // Compute badge dimensions: letters fit inside [padX, badgeW - padX] × [padY, badgeH - padY]
  const innerW = spec.innerW || letters.width;
  const innerH = spec.innerH || letters.height;
  const padX = spec.padX !== undefined ? spec.padX : FONT_SIZE * 0.20;
  const padY = spec.padY !== undefined ? spec.padY : FONT_SIZE * 0.18;
  const badgeW = innerW + 2 * padX;
  const badgeH = innerH + 2 * padY;

  // Letters translated into the padded inner region
  const letterTx = padX + (innerW - letters.width) / 2;
  const letterTy = padY + (innerH - letters.height) / 2 - (letters.height - letters.width / 2) * 0; // simple top-align inside

  const pathSvg = letters.paths
    .map((p) => `    <path d="${p.d}" fill="${p.fill}"/>`)
    .join('\n');

  // viewBox padding
  const vbPad = FONT_SIZE * 0.10;
  const vbX = -vbPad;
  const vbY = -vbPad;
  const vbW = badgeW + 2 * vbPad;
  const vbH = badgeH + 2 * vbPad;
  const cx = badgeW / 2;
  const cy = badgeH / 2;

  // Compose SVG
  let bgEl = '';
  if (bgFill) {
    bgEl = `    <rect x="0" y="0" width="${badgeW.toFixed(0)}" height="${badgeH.toFixed(0)}" fill="${bgFill}"/>`;
  }
  let borderEl = '';
  if (borderStroke) {
    borderEl = `    <rect x="${(borderWidth / 2).toFixed(1)}" y="${(borderWidth / 2).toFixed(1)}" width="${(badgeW - borderWidth).toFixed(1)}" height="${(badgeH - borderWidth).toFixed(1)}" fill="none" stroke="${borderStroke}" stroke-width="${borderWidth}"/>`;
  }
  let innerRuleEl = '';
  if (innerRuleStroke) {
    const off = innerRuleOffset || FONT_SIZE * 0.08;
    innerRuleEl = `    <rect x="${off.toFixed(1)}" y="${off.toFixed(1)}" width="${(badgeW - 2 * off).toFixed(1)}" height="${(badgeH - 2 * off).toFixed(1)}" fill="none" stroke="${innerRuleStroke}" stroke-width="${(FONT_SIZE * 0.025).toFixed(1)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}" role="img" aria-label="${spec.label}">
  <title>${spec.title}</title>
  <g transform="rotate(-3 ${cx.toFixed(0)} ${cy.toFixed(0)})">
${bgEl ? bgEl + '\n' : ''}${borderEl ? borderEl + '\n' : ''}${innerRuleEl ? innerRuleEl + '\n' : ''}    <g transform="translate(${letterTx.toFixed(0)} ${letterTy.toFixed(0)})">
${pathSvg}
    </g>
  </g>
</svg>
`;
}

// === Variant A: Square badge, vertical PSA stack, cream on amber ===
function buildVariantA() {
  const letters = buildStackedLetters(COLOR_CREAM, FONT_SIZE, 0.95);
  // Force square by scaling padX/padY asymmetrically
  // letters.width is small (single letter), letters.height is tall (3 letters stacked)
  // To make badge square, set badgeW = badgeH
  const targetSide = letters.height + FONT_SIZE * 0.36; // letters + ~18% pad top+bot
  const padY = (targetSide - letters.height) / 2;
  const padX = (targetSide - letters.width) / 2;
  return composeBadge({
    letters,
    bgFill: COLOR_AMBER,
    padX,
    padY,
    title: 'PSA badge — variant A: square + vertical stack + cream on amber',
    label: 'PSA square badge, vertical stack, cream on amber',
  });
}

// === Variant B: Square badge, horizontal PSA row, cream on amber ===
function buildVariantB() {
  const letters = buildHorizontalLetters(COLOR_CREAM, FONT_SIZE, -0.02);
  const targetSide = letters.width + FONT_SIZE * 0.36;
  const padY = (targetSide - letters.height) / 2;
  const padX = (targetSide - letters.width) / 2;
  return composeBadge({
    letters,
    bgFill: COLOR_AMBER,
    padX,
    padY,
    title: 'PSA badge — variant B: square + horizontal row + cream on amber',
    label: 'PSA square badge, horizontal row, cream on amber',
  });
}

// === Variant C: Landscape badge, horizontal PSA row, cream on amber (stamp feel) ===
function buildVariantC() {
  const letters = buildHorizontalLetters(COLOR_CREAM, FONT_SIZE, -0.02);
  // Landscape: wider than tall
  return composeBadge({
    letters,
    bgFill: COLOR_AMBER,
    padX: FONT_SIZE * 0.18,
    padY: FONT_SIZE * 0.24,
    title: 'PSA badge — variant C: landscape stamp + horizontal row + cream on amber',
    label: 'PSA landscape badge, stamp feel',
  });
}

// === Variant D: Square badge, INK letters on amber (inverted contrast) ===
function buildVariantD() {
  const letters = buildHorizontalLetters(COLOR_INK, FONT_SIZE, -0.02);
  const targetSide = letters.width + FONT_SIZE * 0.36;
  const padY = (targetSide - letters.height) / 2;
  const padX = (targetSide - letters.width) / 2;
  return composeBadge({
    letters,
    bgFill: COLOR_AMBER,
    padX,
    padY,
    title: 'PSA badge — variant D: square + horizontal row + INK on amber',
    label: 'PSA square badge, ink letters on amber',
  });
}

// === Variant E: Outline badge — no fill, amber border, ink letters (palette-respecting) ===
function buildVariantE() {
  const letters = buildHorizontalLetters(COLOR_INK, FONT_SIZE, -0.02);
  const targetSide = letters.width + FONT_SIZE * 0.36;
  const padY = (targetSide - letters.height) / 2;
  const padX = (targetSide - letters.width) / 2;
  return composeBadge({
    letters,
    bgFill: null, // no fill
    borderStroke: COLOR_AMBER,
    borderWidth: FONT_SIZE * 0.05,
    padX,
    padY,
    title: 'PSA badge — variant E: square outline + ink letters (amber as accent rule)',
    label: 'PSA outline badge, ink letters',
  });
}

// === Variant F: Double-rule seal — amber field + thin ink inner border + cream letters ===
function buildVariantF() {
  const letters = buildHorizontalLetters(COLOR_CREAM, FONT_SIZE, -0.02);
  const targetSide = letters.width + FONT_SIZE * 0.40;
  const padY = (targetSide - letters.height) / 2;
  const padX = (targetSide - letters.width) / 2;
  return composeBadge({
    letters,
    bgFill: COLOR_AMBER,
    innerRuleStroke: COLOR_INK,
    innerRuleOffset: FONT_SIZE * 0.07,
    padX,
    padY,
    title: 'PSA badge — variant F: double-rule seal (amber + ink inner border)',
    label: 'PSA double-rule seal',
  });
}

const variants = [
  { letter: 'A', slug: 'square-stack-cream',
    name: 'Square + vertical stack + cream',
    desc: 'Square badge, P/S/A stacked vertically inside, cream letters on amber.',
    risk: 'Most "seal" of all variants. Letters at small scale become hard to distinguish in vertical stack.',
    svg: buildVariantA() },
  { letter: 'B', slug: 'square-row-cream',
    name: 'Square + horizontal row + cream',
    desc: 'Square badge, PSA in a row inside, cream letters on amber.',
    risk: 'Cream-on-amber contrast is mid; letters may feel soft against the badge.',
    svg: buildVariantB() },
  { letter: 'C', slug: 'landscape-row-cream',
    name: 'Landscape stamp + cream',
    desc: 'Landscape (~2:1) badge, PSA horizontal row, cream on amber. Postal-stamp / wax-seal feel.',
    risk: 'Landscape aspect breaks the favicon-square shape; needs separate square version for browser tabs.',
    svg: buildVariantC() },
  { letter: 'D', slug: 'square-row-ink',
    name: 'Square + horizontal row + INK',
    desc: 'Square badge, PSA row, INK letters on amber (high contrast).',
    risk: 'Strongest letter presence but reads more like a sticker than a seal. Loses the cream-light Stowarzyszenie energy.',
    svg: buildVariantD() },
  { letter: 'E', slug: 'outline-square-ink',
    name: 'Outline only + ink letters',
    desc: 'No amber fill — thin amber border + ink letters. Respects the brand "amber as accent, not field" rule.',
    risk: 'Most "venture studio" feel of the set; least "seal." May not read as distinctively as filled variants.',
    svg: buildVariantE() },
  { letter: 'F', slug: 'double-rule-seal',
    name: 'Double-rule seal',
    desc: 'Amber field + thin ink inner border + cream letters. Max Stowarzyszenie / Polish association seal energy.',
    risk: 'Most decorative variant; may feel ornate next to the modern Geist letterforms.',
    svg: buildVariantF() },
];

for (const v of variants) {
  const outPath = path.join(OUTPUT_DIR, `psa-badge-v${v.letter.toLowerCase()}-${v.slug}.svg`);
  fs.writeFileSync(outPath, v.svg);
  console.log(`  wrote ${outPath}`);
}

const html = `<h2>Q1 round 2 — Badge variants (drilling into Architecture 3)</h2>
<p class="subtitle">6 sub-variants of the block badge, varying aspect ratio (square / landscape), color treatment (cream-on-amber / ink-on-amber / outline+ink / double-rule seal), and letter arrangement (stacked / horizontal). All path-drawn Geist SemiBold at chat-37 quality.</p>

<div class="section">
  <p class="label">Round 1 winner — Architecture 3 (block badge)</p>
  <div style="display:flex; align-items:center; gap:16px; padding:14px; border:1.5px solid rgba(0,0,0,0.1); background:#fef6e6">
    <div style="font-size:13px; color:#1a1a2e">
      <strong>Inherited from round 1:</strong> Polish Stowarzyszenie seal lineage. Badge is the dominant silhouette at favicon scale; letters are texture inside. -3° rotation, 0 border-radius — both preserved across all variants below.
    </div>
  </div>
</div>

<div class="cards">
${variants
  .map(
    (v) => `  <div class="card" data-choice="badge-v${v.letter.toLowerCase()}-${v.slug}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fef6e6; display:flex; align-items:center; justify-content:center; padding:36px; min-height:240px">
      <div style="width:200px; height:200px; display:flex; align-items:center; justify-content:center">${v.svg.replace(/^<svg /, '<svg style="max-width:100%;max-height:100%" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
    </div>
    <div class="card-body">
      <h3>${v.letter}. ${v.name}</h3>
      <p>${v.desc}</p>
      <p style="opacity:0.7; font-size:13px"><strong>Risk:</strong> ${v.risk}</p>
      <div style="display:flex; gap:8px; margin-top:12px; padding:8px; background:#fef6e6; align-items:center">
        <div style="display:flex; align-items:center; justify-content:center; width:32px; height:32px; background:#fff; border:1px solid rgba(0,0,0,0.1)">${v.svg.replace(/^<svg /, '<svg style="max-width:28px;max-height:28px" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
        <div style="display:flex; align-items:center; justify-content:center; width:24px; height:24px; background:#fff; border:1px solid rgba(0,0,0,0.1)">${v.svg.replace(/^<svg /, '<svg style="max-width:20px;max-height:20px" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
        <div style="display:flex; align-items:center; justify-content:center; width:16px; height:16px; background:#fff; border:1px solid rgba(0,0,0,0.1)">${v.svg.replace(/^<svg /, '<svg style="max-width:14px;max-height:14px" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
        <span style="font-size:11px; opacity:0.6; line-height:1.4">favicon: 32 / 24 / 16</span>
      </div>
    </div>
  </div>`
  )
  .join('\n')}
</div>

<div class="section" style="margin-top:32px; padding:20px; border-left:3px solid #f59e0b; background:rgba(245,158,11,0.06)">
  <p style="margin:0"><strong>Trade-off summary:</strong></p>
  <ul style="margin:8px 0 0; padding-left:20px; line-height:1.7; font-size:14px">
    <li><strong>A vs B vs C:</strong> aspect ratio. A (square stack) is most seal-like, B (square row) is most balanced, C (landscape) is stamp-like.</li>
    <li><strong>B vs D vs E:</strong> color treatment. B (cream on amber) is softest, D (ink on amber) is highest contrast, E (outline only) is the only variant that respects "amber as accent, not field."</li>
    <li><strong>A vs F:</strong> decorative restraint. F's inner ink rule adds Stowarzyszenie weight at the cost of modernist quietness.</li>
  </ul>
  <p style="margin:12px 0 0"><strong>Click your favorite</strong>, or respond in terminal: "B but darker amber," "outline E but with stacked letters," "F but ink rule thicker," etc. — round 3 fine-tunes whichever lands.</p>
</div>
`;

const compOut = SCREEN_DIR
  ? path.join(SCREEN_DIR, 'q2-badge-variants.html')
  : path.join(OUTPUT_DIR, 'q2-badge-variants.html');
fs.writeFileSync(compOut, html);
console.log(`  wrote ${compOut}`);
console.log('Done. Refresh the visual companion browser.');
