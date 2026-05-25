// build-q1-s-color-board.js — chat-41 / Q1 "S" color-treatment drilldown
//
// Anton picked (a) "S extracted" as the favicon glyph. This script renders 4
// color-treatment variants side-by-side so we can lock the field/letter colors.
//
// Variants:
//   (a1) Amber field + ink letter   — Substack lineage; BREAKS §2 "amber as accent" rule
//   (a2) Ink field + amber letter   — Linear / Stripe lineage; preserves §2
//   (a3) Cream field + ink letter   — quiet; preserves §2 trivially
//   (a4) Ink field + cream letter   — Notion lineage; preserves §2 trivially
//
// Usage:
//   node community/brand/.scratch/build-q1-s-color-board.js <screen_dir>

const fs = require('fs');
const path = require('path');

const NODE_MODULES = path.resolve(__dirname, 'node_modules');
const opentype = require(path.join(NODE_MODULES, 'opentype.js'));
const FONT_PATH = path.join(NODE_MODULES, 'geist/dist/fonts/geist-sans/Geist-SemiBold.ttf');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';

const fontBuffer = fs.readFileSync(FONT_PATH);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));

const sPath = font.getPath('S', 0, 0, 1000);
const sBB = sPath.getBoundingBox();
const sD = sPath.toPathData(2);

function sFavicon(bgColor, fillColor, fillRatio = 0.62) {
  const glyphH = sBB.y2 - sBB.y1;
  const canvas = glyphH / fillRatio;
  const cx = (sBB.x1 + sBB.x2) / 2;
  const cy = (sBB.y1 + sBB.y2) / 2;
  const vbX = cx - canvas / 2;
  const vbY = cy - canvas / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(1)} ${vbY.toFixed(1)} ${canvas.toFixed(1)} ${canvas.toFixed(1)}" preserveAspectRatio="xMidYMid meet">
  <rect x="${vbX.toFixed(1)}" y="${vbY.toFixed(1)}" width="${canvas.toFixed(1)}" height="${canvas.toFixed(1)}" fill="${bgColor}"/>
  <path d="${sD}" fill="${fillColor}"/>
</svg>`;
}

const variants = [
  {
    id: 'a1',
    label: 'Amber field + ink letter',
    svg: sFavicon(COLOR_AMBER, COLOR_INK),
    lineage: 'Substack (orange S on orange field)',
    spec: 'BREAKS §2 "amber as accent, not as field" — would amend the spec',
    feel: 'Boldest brand presence in tab strip. Loud. The favicon is the brand.',
  },
  {
    id: 'a2',
    label: 'Ink field + amber letter',
    svg: sFavicon(COLOR_INK, COLOR_AMBER),
    lineage: 'Linear (white L on dark) / Stripe',
    spec: 'PRESERVES §2 — amber stays accent on dark field',
    feel: 'Quiet authority. Matches the platform header (which is ink). Tabs read as dark with amber spark.',
  },
  {
    id: 'a3',
    label: 'Cream field + ink letter',
    svg: sFavicon(COLOR_CREAM, COLOR_INK),
    lineage: 'Notion (black N on white) — most minimal',
    spec: 'PRESERVES §2 trivially — no amber',
    feel: 'Lowest contrast, blends into light-themed browsers. May vanish at 16px against white Chrome chrome.',
  },
  {
    id: 'a4',
    label: 'Ink field + cream letter',
    svg: sFavicon(COLOR_INK, COLOR_CREAM),
    lineage: 'Y-Combinator (black Y on dark) — minimal-monochrome',
    spec: 'PRESERVES §2 trivially — no amber',
    feel: 'Brand-neutral; no amber spark at all. Could feel un-Subploters.',
  },
];

const cards = variants.map((v) => `
  <div class="card" data-choice="${v.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fafafa;padding:24px;display:flex;flex-direction:column;gap:18px;align-items:center;justify-content:center;min-height:300px;">
      <div style="display:flex;align-items:center;gap:24px;">
        <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#888;text-align:center;">
          <div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;overflow:hidden;">${v.svg.replace(/<svg /, '<svg style="width:16px;height:16px;" ')}</div>
          <div style="margin-top:4px;">16px</div>
        </div>
        <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#888;text-align:center;">
          <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:6px;">${v.svg.replace(/<svg /, '<svg style="width:32px;height:32px;" ')}</div>
          <div style="margin-top:4px;">32px</div>
        </div>
        <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#888;text-align:center;">
          <div style="width:180px;height:180px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:32px;">${v.svg.replace(/<svg /, '<svg style="width:180px;height:180px;" ')}</div>
          <div style="margin-top:4px;">180px</div>
        </div>
      </div>
      <!-- Light browser tab strip -->
      <div style="display:flex;align-items:center;background:#e8e8e8;padding:6px 8px;border-radius:8px 8px 0 0;gap:6px;color:#333;font-family:system-ui;font-size:11px;width:100%;max-width:480px;">
        <div style="display:flex;align-items:center;gap:6px;background:#ffffff;padding:5px 10px;border-radius:6px 6px 0 0;border:1px solid #d0d0d0;border-bottom:none;">
          <div style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">${v.svg.replace(/<svg /, '<svg style="width:16px;height:16px;" ')}</div>
          <span>Subploters</span>
        </div>
        <span style="opacity:0.6;">○ Linear</span>
        <span style="opacity:0.6;">○ Substack</span>
      </div>
      <!-- Dark browser tab strip (Chrome dark mode) -->
      <div style="display:flex;align-items:center;background:#202124;padding:6px 8px;border-radius:8px 8px 0 0;gap:6px;color:#bbb;font-family:system-ui;font-size:11px;width:100%;max-width:480px;">
        <div style="display:flex;align-items:center;gap:6px;background:#3c4043;padding:5px 10px;border-radius:6px 6px 0 0;">
          <div style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">${v.svg.replace(/<svg /, '<svg style="width:16px;height:16px;" ')}</div>
          <span>Subploters</span>
        </div>
        <span style="opacity:0.5;">○ Linear</span>
        <span style="opacity:0.5;">○ Substack</span>
      </div>
    </div>
    <div class="card-body">
      <h3>(${v.id.toUpperCase()}) ${v.label}</h3>
      <p style="margin:4px 0;"><strong>Lineage:</strong> ${v.lineage}</p>
      <p style="margin:4px 0;"><strong>Spec rule:</strong> ${v.spec}</p>
      <p style="margin:4px 0;color:#888;font-size:0.9em;"><strong>Feel:</strong> ${v.feel}</p>
    </div>
  </div>`).join('\n');

const html = `<h2>Q1 (cont.) — "S" color treatment</h2>
<p class="subtitle">Glyph locked as (a) S extracted. Now choosing field/letter colors. Each variant shown at 16/32/180px on cream background, plus light-Chrome and dark-Chrome tab-strip contexts. Click to select.</p>

<div class="section" style="background:#fff8e1;padding:16px 20px;border-left:3px solid #f59e0b;margin-bottom:24px;font-size:13px;">
  <strong>Spec rule trade-off:</strong> brand.md §2 says "Use amber as accent, not as field." Variant (a1) breaks this rule — Substack-style amber field with ink letter. Picking (a1) means amending §2 to allow amber-field usage for the standalone favicon specifically. Variants (a2) / (a3) / (a4) preserve the rule.
</div>

<div class="cards" style="grid-template-columns:repeat(1,1fr);">
${cards}
</div>

<div class="section" style="margin-top:24px;padding:12px 16px;background:#fef6e6;border:1.5px solid #886c37;font-size:13px;">
  <strong>My read:</strong> (a2) ink field + amber letter is the strongest balance — preserves the spec rule, matches the platform header (which is ink), and gives the tab a recognizable amber spark. (a1) is the boldest but requires amending §2 just for the favicon. (a3) and (a4) lose the amber identity entirely.
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q1-s-color-board.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'q1-s-color-treatment.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
