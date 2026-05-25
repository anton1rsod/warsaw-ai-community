// build-q1-favicon-board.js — chat-41 / Q1 favicon-slot comparison
//
// Renders 5 favicon candidates as inline SVGs (path-drawn via opentype.js +
// Geist SemiBold) into a single HTML comparison page for the brainstorming
// visual companion. Throwaway exploratory script — outputs go to the
// visual-companion screen_dir, not to brand/assets/.
//
// Usage:
//   node community/brand/.scratch/build-q1-favicon-board.js <screen_dir>
//
// Anti-patterns enforced (do NOT re-introduce):
//   - chat-37: custom stylized S with sweep tails  ← (a) here is *typographic* S, not custom
//   - chat-37: pilcrow without PL anatomy          ← (d) is § not ¶
//   - chat-36: cross-shaped marks                  ← (d) is § not ※
//   - chat-40: 6 abstract glyphs (asterism etc.)   ← (d) is § not those
//
// Five candidates:
//   (a) "S" extracted from wordmark — Geist SemiBold S, amber field + ink letter (Substack lineage)
//   (b) "Sub" wordmark fragment    — Geist SemiBold "Sub" cropped to square, cream on ink
//   (c) Standalone "*"             — Geist SemiBold asterisk, amber on ink (depends on Q2 keeping *)
//   (d) "§" section symbol         — Geist SemiBold §, amber on ink (Stowarzyszenie semantic)
//   (e) No favicon                 — default browser fallback (no glyph, hashed background)

const fs = require('fs');
const path = require('path');

const NODE_MODULES = path.resolve(__dirname, 'node_modules');
const opentype = require(path.join(NODE_MODULES, 'opentype.js'));
const FONT_PATH = path.join(NODE_MODULES, 'geist/dist/fonts/geist-sans/Geist-SemiBold.ttf');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';
const COLOR_DUST = '#886c37';

const FONT_SIZE = 1000;

const fontBuffer = fs.readFileSync(FONT_PATH);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));

// Render a string at font-size 1000 and return path + bbox.
function pathFor(text) {
  const p = font.getPath(text, 0, 0, FONT_SIZE);
  const bb = p.getBoundingBox();
  return { d: p.toPathData(2), bb };
}

// Build a square-canvas favicon SVG centered around a glyph path.
// - bgColor: square background fill (use 'none' for transparent)
// - fillColor: glyph fill
// - fillRatio: glyph height ÷ canvas height (0–1); rest is safe-area padding
function faviconSvg({ pathData, bbox, bgColor, fillColor, fillRatio = 0.65 }) {
  const glyphWidth = bbox.x2 - bbox.x1;
  const glyphHeight = bbox.y2 - bbox.y1;
  // canvas height in glyph-space such that glyph occupies `fillRatio` of the height
  const canvasH = glyphHeight / fillRatio;
  // square canvas
  const canvasW = canvasH;
  const cx = (bbox.x1 + bbox.x2) / 2;
  const cy = (bbox.y1 + bbox.y2) / 2;
  const vbX = cx - canvasW / 2;
  const vbY = cy - canvasH / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(1)} ${vbY.toFixed(1)} ${canvasW.toFixed(1)} ${canvasH.toFixed(1)}" preserveAspectRatio="xMidYMid meet">
  <rect x="${vbX.toFixed(1)}" y="${vbY.toFixed(1)}" width="${canvasW.toFixed(1)}" height="${canvasH.toFixed(1)}" fill="${bgColor}"/>
  <path d="${pathData}" fill="${fillColor}"/>
</svg>`;
}

// (b) "Sub" wordmark fragment — render the whole 3-letter string and fit into square
function subFragmentSvg({ bgColor, fillColor, fitMargin = 0.12 }) {
  const { d, bb } = pathFor('Sub');
  const glyphWidth = bb.x2 - bb.x1;
  const glyphHeight = bb.y2 - bb.y1;
  // Square canvas large enough to hold the wider dimension with margin
  const dim = Math.max(glyphWidth, glyphHeight) * (1 + 2 * fitMargin);
  const cx = (bb.x1 + bb.x2) / 2;
  const cy = (bb.y1 + bb.y2) / 2;
  const vbX = cx - dim / 2;
  const vbY = cy - dim / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(1)} ${vbY.toFixed(1)} ${dim.toFixed(1)} ${dim.toFixed(1)}" preserveAspectRatio="xMidYMid meet">
  <rect x="${vbX.toFixed(1)}" y="${vbY.toFixed(1)}" width="${dim.toFixed(1)}" height="${dim.toFixed(1)}" fill="${bgColor}"/>
  <path d="${d}" fill="${fillColor}"/>
</svg>`;
}

// (e) "No favicon" — hashed gray square evoking a missing favicon
function noFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M 0 4 L 4 0" stroke="#999" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="32" height="32" fill="#e5e5e5"/>
  <rect width="32" height="32" fill="url(#hatch)"/>
  <text x="16" y="20" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#888">?</text>
</svg>`;
}

// Render each candidate twice (32px + 180px favicon-context) and once large (256px design view).
const sPath = pathFor('S');
const subData = pathFor('Sub'); // unused for direct SVG but useful for debug
const asteriskPath = pathFor('*');
const sectionPath = pathFor('§');

console.log('Glyph metrics:');
console.log(`  S: bbox=[${sPath.bb.x1.toFixed(0)},${sPath.bb.y1.toFixed(0)} → ${sPath.bb.x2.toFixed(0)},${sPath.bb.y2.toFixed(0)}]`);
console.log(`  *: bbox=[${asteriskPath.bb.x1.toFixed(0)},${asteriskPath.bb.y1.toFixed(0)} → ${asteriskPath.bb.x2.toFixed(0)},${asteriskPath.bb.y2.toFixed(0)}]`);
console.log(`  §: bbox=[${sectionPath.bb.x1.toFixed(0)},${sectionPath.bb.y1.toFixed(0)} → ${sectionPath.bb.x2.toFixed(0)},${sectionPath.bb.y2.toFixed(0)}]`);

// (a) S — amber field + ink letter (Substack lineage: bold field color, recognizable letter)
const aSvg = faviconSvg({ pathData: sPath.d, bbox: sPath.bb, bgColor: COLOR_AMBER, fillColor: COLOR_INK, fillRatio: 0.62 });

// (b) Sub — ink field + cream letters
const bSvg = subFragmentSvg({ bgColor: COLOR_INK, fillColor: COLOR_CREAM, fitMargin: 0.10 });

// (c) * — ink field + amber asterisk
const cSvg = faviconSvg({ pathData: asteriskPath.d, bbox: asteriskPath.bb, bgColor: COLOR_INK, fillColor: COLOR_AMBER, fillRatio: 0.55 });

// (d) § — ink field + amber section symbol
const dSvg = faviconSvg({ pathData: sectionPath.d, bbox: sectionPath.bb, bgColor: COLOR_INK, fillColor: COLOR_AMBER, fillRatio: 0.60 });

// (e) No favicon
const eSvg = noFaviconSvg();

const candidates = [
  {
    id: 'a',
    label: 'S extracted (typographic)',
    svg: aSvg,
    semantic: 'First letter of wordmark in Geist SemiBold. Substack / Notion / Linear lineage.',
    risk: 'Low — directly inherits wordmark identity. Anti-pattern is "custom stylized S", not "typography S".',
    color: 'Amber field + ink letter — boldest brand presence at small sizes (16px tab strip).',
  },
  {
    id: 'b',
    label: 'Sub wordmark fragment',
    svg: bSvg,
    semantic: 'First three letters of "Subploters". Reads as wordmark-fragment, not as letter.',
    risk: 'Medium — at 16/32px the letters become tiny and may smear into a single shape.',
    color: 'Ink field + cream letters — preserves "amber as accent" spec rule.',
  },
  {
    id: 'c',
    label: 'Standalone * (asterisk)',
    svg: cSvg,
    semantic: 'Trailing wordmark accent extracted as standalone glyph. Only viable if Q2 keeps the *.',
    risk: 'Medium — depends on Q2. If * is retired, this option dies. * alone reads more as "footnote" than "brand".',
    color: 'Ink field + amber asterisk — on-brand color hierarchy.',
  },
  {
    id: 'd',
    label: '§ section symbol',
    svg: dSvg,
    semantic: 'Section symbol = Stowarzyszenie (Association) semantic. Underused in tech-brand favicons.',
    risk: 'Higher — adds a new glyph to the brand system. Could feel institutional or read as "legal" instead of "venture".',
    color: 'Ink field + amber § — on-brand color hierarchy.',
  },
  {
    id: 'e',
    label: 'No favicon',
    svg: eSvg,
    semantic: 'Use default browser fallback. Brand exists only in the wordmark.',
    risk: 'High — no recognizability in tab strips, bookmarks, or PWA install. Anti-recommended.',
    color: 'Browser default (gray / hashed / missing-icon glyph depending on browser).',
  },
];

// Build the HTML comparison page (content fragment — the visual-companion server wraps it).
const cards = candidates.map((c) => `
  <div class="card" data-choice="${c.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fafafa;padding:24px;display:flex;flex-direction:column;gap:18px;align-items:center;justify-content:center;min-height:280px;">
      <div style="display:flex;align-items:center;gap:24px;">
        <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#888;text-align:center;">
          <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:6px;">${c.svg.replace(/<svg /, '<svg style="width:32px;height:32px;" ').replace(/<svg /, '<svg ')}</div>
          <div style="margin-top:4px;">32px</div>
        </div>
        <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#888;text-align:center;">
          <div style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:32px;">${c.svg.replace(/<svg /, '<svg style="width:180px;height:180px;" ').replace(/<svg /, '<svg ')}</div>
          <div style="margin-top:4px;">180px (apple-touch-icon)</div>
        </div>
      </div>
      <!-- Browser tab-strip context -->
      <div style="display:flex;align-items:center;background:#202124;padding:6px 8px;border-radius:8px 8px 0 0;gap:6px;color:#bbb;font-family:system-ui;font-size:11px;">
        <div style="display:flex;align-items:center;gap:6px;background:#3c4043;padding:5px 10px;border-radius:6px 6px 0 0;">
          <div style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">${c.svg.replace(/<svg /, '<svg style="width:16px;height:16px;" ').replace(/<svg /, '<svg ')}</div>
          <span>Subploters — Every venture is a subplot.</span>
        </div>
        <span style="opacity:0.5;">○ Linear</span>
        <span style="opacity:0.5;">○ Substack</span>
      </div>
    </div>
    <div class="card-body">
      <h3>(${c.id.toUpperCase()}) ${c.label}</h3>
      <p style="margin:4px 0;"><strong>Semantic:</strong> ${c.semantic}</p>
      <p style="margin:4px 0;"><strong>Color:</strong> ${c.color}</p>
      <p style="margin:4px 0;color:#888;font-size:0.85em;"><strong>Risk:</strong> ${c.risk}</p>
    </div>
  </div>`).join('\n');

const html = `<h2>Q1 — Favicon slot under Path Z (wordmark-only)</h2>
<p class="subtitle">Five candidates for the 16/32/180/192/512 px favicon. All renders are path-drawn from Geist SemiBold (no font dependency). Click to select; the bottom row of each card shows the favicon in a real Chrome tab strip context next to Linear / Substack.</p>

<div class="section" style="background:#fef6e6;padding:16px 20px;border:1.5px solid #886c37;border-radius:0;margin-bottom:24px;">
  <div style="font-family:JetBrains Mono,monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1a1a2e;margin-bottom:6px;">Path Z lineage reference</div>
  <div style="font-family:Inter,system-ui;font-size:13px;color:#1a1a2e;">
    Stripe (early /), Substack (orange S), Linear (white L on purple), Notion (black N), Apollo (blue A) — wordmark-centric brands with minimal or extracted-letter favicons. None use abstract single-shape glyphs.
  </div>
</div>

<div class="cards" style="grid-template-columns:repeat(1,1fr);">
${cards}
</div>

<div class="section" style="margin-top:24px;padding:12px 16px;background:#fff8e1;border-left:3px solid #f59e0b;font-size:13px;">
  <strong>Anti-pattern reminder:</strong> chat-40 already rejected 6 abstract single-shape glyphs (asterism / twin diagonals / bracket+dot / hash beats / vertical hatch / arc). Option (d) "§" is the only "new abstract glyph" surfaced here because it carries the Stowarzyszenie / Association brand semantic. If (d) doesn't land we should look at (a) or (b), not at more abstract glyphs.
</div>`;

// Output path
const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q1-favicon-board.js <screen_dir>');
  process.exit(1);
}
fs.mkdirSync(screenDir, { recursive: true });
const outPath = path.join(screenDir, 'q1-favicon-comparison.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
