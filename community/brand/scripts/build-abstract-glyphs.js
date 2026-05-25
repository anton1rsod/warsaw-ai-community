// build-abstract-glyphs.js — chat-40 v1.2 brand exploration · Round 3
//
// Anton rejected PSA letter monogram entirely (round 1 PSA architectures + round 2
// badge variants). Re-aimed to "abstract Subploters glyph" — custom invented marks
// that carry brand semantic (subplot narrative, venture-studio trajectory) without
// literal letters.
//
// Each candidate is a single distinctive shape, amber as primary color, -3° rotation,
// 0 border-radius, anti-pattern-clean (no radial sparkle, no cross/dagger, no gem cut,
// no fork-Y, no S monogram, no em-dash, no single period/vertical bar, no pictorial).
//
// Output:
//   community/brand/.scratch/output/abstract-{1..6}-{slug}.svg
//   <visual-companion screen_dir>/q1-abstract-glyphs.html

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../.scratch/output');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const args = process.argv.slice(2);
const screenDirIdx = args.indexOf('--screen-dir');
const SCREEN_DIR = screenDirIdx >= 0 ? args[screenDirIdx + 1] : null;

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';

// Standard viewBox: 512×512 (matches v1.1 PL mark)
const VB = 512;
const CENTER = VB / 2;

function wrap(title, label, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB} ${VB}" role="img" aria-label="${label}">
  <title>${title}</title>
  <g transform="rotate(-3 ${CENTER} ${CENTER})">
${body}
  </g>
</svg>
`;
}

// === 1. Asterism ⁂ — three filled dots in inverted triangle ===
// Narrative lineage: asterism is the classical typographic mark for scene/subplot breaks in
// long-form prose. Three dots = three Subploters in plural. Geometric, scales to 16px.
function build1Asterism() {
  const r = 56;
  const spread = 130; // distance from center to each dot
  const top1 = { x: CENTER - spread, y: CENTER - spread * 0.7 };
  const top2 = { x: CENTER + spread, y: CENTER - spread * 0.7 };
  const bottom = { x: CENTER, y: CENTER + spread * 0.85 };
  return wrap(
    'Subploters mark — asterism (three-dot subplot separator)',
    'Asterism three-dot mark',
    `    <circle cx="${top1.x}" cy="${top1.y}" r="${r}" fill="${COLOR_AMBER}"/>
    <circle cx="${top2.x}" cy="${top2.y}" r="${r}" fill="${COLOR_AMBER}"/>
    <circle cx="${bottom.x}" cy="${bottom.y}" r="${r}" fill="${COLOR_AMBER}"/>`
  );
}

// === 2. Twin ascend ⫽ — two parallel diagonal strokes rising right ===
// Trajectory without literal arrow. Motion + growth, geometric, not cliché up-arrow.
// Two parallel strokes read as "//" — typographic motion mark.
function build2TwinAscend() {
  const strokeW = 56;
  const offset = 90;
  const startX = 110;
  const endX = 380;
  const lowY = 400;
  const highY = 130;
  return wrap(
    'Subploters mark — twin ascend (parallel diagonals)',
    'Twin ascending diagonals',
    `    <line x1="${startX}" y1="${lowY}" x2="${endX}" y2="${highY}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>
    <line x1="${startX + offset}" y1="${lowY}" x2="${endX + offset}" y2="${highY}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>`
  );
}

// === 3. Bracket angle ⌐ — open-bracket corner with offset detail ===
// Narrative-aside semantic ([ ] = narrative parenthetical in literature). Corner
// shape suggests "subplot opening" — a story turning a corner.
// Two-tone: amber bracket + ink dot inside as plot-point.
function build3BracketAngle() {
  const strokeW = 56;
  const left = 130;
  const right = 380;
  const top = 130;
  const bottom = 380;
  const dotR = 32;
  const dotX = 250;
  const dotY = 250;
  return wrap(
    'Subploters mark — bracket angle (narrative aside)',
    'Bracket angle with plot-point dot',
    `    <path d="M ${right} ${top} L ${left} ${top} L ${left} ${bottom} L ${right} ${bottom}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>
    <circle cx="${dotX}" cy="${dotY}" r="${dotR}" fill="${COLOR_INK}"/>`
  );
}

// === 4. Hash beats ≡ — three short parallel horizontal lines ===
// Paragraph-break visual mark. Multiple plot threads (subplots) stacked. Geometric texture.
function build4HashBeats() {
  const strokeW = 56;
  const lineLen = 260;
  const gap = 80;
  const cx = CENTER;
  const xL = cx - lineLen / 2;
  const xR = cx + lineLen / 2;
  const y1 = CENTER - gap;
  const y2 = CENTER;
  const y3 = CENTER + gap;
  return wrap(
    'Subploters mark — hash beats (three paragraph breaks)',
    'Three parallel horizontal lines',
    `    <line x1="${xL}" y1="${y1}" x2="${xR}" y2="${y1}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>
    <line x1="${xL}" y1="${y2}" x2="${xR}" y2="${y2}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>
    <line x1="${xL}" y1="${y3}" x2="${xR}" y2="${y3}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>`
  );
}

// === 5. Vertical hatch — three short vertical strokes with varied heights ===
// Subplot threads of varying length / progress. Distinctive vertical-rhythm mark.
// Geometric, modern, suggests multiple narratives in motion.
function build5VerticalHatch() {
  const strokeW = 56;
  const gap = 90;
  const cx = CENTER;
  const x1 = cx - gap;
  const x2 = cx;
  const x3 = cx + gap;
  // Varied heights: short, tall, medium — suggests "subplot in progress"
  const baseY = 390;
  const h1 = 180;
  const h2 = 280;
  const h3 = 220;
  return wrap(
    'Subploters mark — vertical hatch (subplot threads)',
    'Three vertical strokes varied heights',
    `    <line x1="${x1}" y1="${baseY}" x2="${x1}" y2="${baseY - h1}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>
    <line x1="${x2}" y1="${baseY}" x2="${x2}" y2="${baseY - h2}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>
    <line x1="${x3}" y1="${baseY}" x2="${x3}" y2="${baseY - h3}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" stroke-linecap="square"/>`
  );
}

// === 6. Single arc — elegant amber curve, gestural ===
// Story-arc semantic: rising and resolving. Single sweeping curve. Minimalist,
// gestural, distinct from any letter or punctuation. Brand-distinctive.
function build6SingleArc() {
  const strokeW = 56;
  // Cubic Bezier arc from lower-left to upper-right, rising and crowning at peak
  const startX = 120;
  const startY = 380;
  const endX = 392;
  const endY = 200;
  // Two control points for curve character
  const c1X = 180;
  const c1Y = 130;
  const c2X = 330;
  const c2Y = 130;
  return wrap(
    'Subploters mark — single arc (story arc)',
    'Single sweeping arc',
    `    <path d="M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}" stroke="${COLOR_AMBER}" stroke-width="${strokeW}" fill="none" stroke-linecap="square"/>`
  );
}

const variants = [
  { id: 1, slug: 'asterism',
    name: 'Asterism — three-dot subplot break',
    desc: 'Three filled dots in inverted triangle. Classical typographic mark for scene/subplot breaks in long-form prose. Three dots = three Subploters in plural.',
    risk: 'Could read as ellipsis or polka-dot pattern at small scale. Distinct from chat-36\'s rejected 6-point sparkle asterisk because dots are filled and asymmetric.',
    svg: build1Asterism() },
  { id: 2, slug: 'twin-ascend',
    name: 'Twin ascend — parallel diagonals',
    desc: 'Two parallel amber strokes rising right. Trajectory without literal arrow; reads as motion-lines or typographic "//" gesture.',
    risk: 'Could read as italic-text underline or motion-blur. Needs the right angle to feel intentional, not accidental.',
    svg: build2TwinAscend() },
  { id: 3, slug: 'bracket-angle',
    name: 'Bracket angle + plot point',
    desc: 'Open amber bracket (narrative aside) with ink dot inside (plot point). Two-tone. "Subplot turning a corner."',
    risk: 'Two-element mark is more complex than single-shape; at favicon scale the dot may disappear. May read as parenthesis fragment.',
    svg: build3BracketAngle() },
  { id: 4, slug: 'hash-beats',
    name: 'Hash beats — three paragraph breaks',
    desc: 'Three short parallel horizontal lines. Paragraph-break visual rhythm; multiple plot threads stacked. Geometric texture.',
    risk: 'Could read as Hamburger menu icon at small scale (visual confusion). Three equal lines is generic without strong character.',
    svg: build4HashBeats() },
  { id: 5, slug: 'vertical-hatch',
    name: 'Vertical hatch — subplot threads',
    desc: 'Three vertical strokes of varying heights. Subplot threads in different stages of progress. Distinctive vertical-rhythm mark.',
    risk: 'Could read as bar-chart icon (data visualization). Varied heights are intentional but may look like a chart at small scale.',
    svg: build5VerticalHatch() },
  { id: 6, slug: 'single-arc',
    name: 'Single arc — story arc',
    desc: 'Single elegant amber curve, rising and crowning. Story-arc gesture. Minimalist, brand-distinctive, no letter or punctuation reference.',
    risk: 'Most "agency-designed" feeling; may read as generic curve/swoosh without strong identity hook.',
    svg: build6SingleArc() },
];

for (const v of variants) {
  const outPath = path.join(OUTPUT_DIR, `abstract-${v.id}-${v.slug}.svg`);
  fs.writeFileSync(outPath, v.svg);
  console.log(`  wrote ${outPath}`);
}

const html = `<h2>Q1 round 3 — Abstract Subploters glyphs</h2>
<p class="subtitle">No letters. 6 single-shape mark candidates that carry brand semantic (subplot narrative, venture-studio trajectory) without spelling out PSA. All amber-primary, -3° rotation, 0 border-radius, anti-pattern-clean.</p>

<div class="section">
  <p class="label">Anti-patterns this set avoids</p>
  <p style="font-size:13px; opacity:0.75; line-height:1.6">
    No radial sparkle (chat-36 6-point asterisk). No cross/dagger. No fork-Y / S monogram (chat-37 name-rooted ornaments). No gem cuts (rhombus, marquise). No em-dash. No single period or single vertical bar. No pictorial / illustrative / mascot. PL pilcrow lineage retired with chat-39 v1.2.
  </p>
</div>

<div class="cards">
${variants
  .map(
    (v) => `  <div class="card" data-choice="abstract-${v.id}-${v.slug}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fef6e6; display:flex; align-items:center; justify-content:center; padding:36px; min-height:240px">
      <div style="width:200px; height:200px; display:flex; align-items:center; justify-content:center">${v.svg.replace(/^<svg /, '<svg style="max-width:100%;max-height:100%" ').replace(/<\?xml[^>]+\?>\n?/, '')}</div>
    </div>
    <div class="card-body">
      <h3>${v.id}. ${v.name}</h3>
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
  <p style="margin:0"><strong>How to respond:</strong></p>
  <ul style="margin:8px 0; padding-left:20px; line-height:1.7; font-size:14px">
    <li>Click your favorite → I'll drill into 4-6 variants of that glyph (proportions, stroke weight, color treatment)</li>
    <li>"Combine 1 and 6" / "Try a fresh angle" / "All weak" → I'll mix or re-aim</li>
    <li>"What about X?" → tell me a direction I'm missing; I'll add candidates</li>
  </ul>
  <p style="margin:12px 0 0; opacity:0.65; font-size:12px">These are concept-level renders. Once you pick, round 4 refines the geometry, weight, and proportions to ship-quality.</p>
</div>
`;

const compOut = SCREEN_DIR
  ? path.join(SCREEN_DIR, 'q1-abstract-glyphs.html')
  : path.join(OUTPUT_DIR, 'q1-abstract-glyphs.html');
fs.writeFileSync(compOut, html);
console.log(`  wrote ${compOut}`);
console.log('Done. Refresh the visual companion browser.');
