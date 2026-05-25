// build-q2-trailing-board.js — chat-41 / Q2 trailing-* status drilldown
//
// Path Z removed the inline PL. Q2 asks whether to also retire the trailing `*`
// or keep it as a wordmark typographic accent (no longer a separate "qualifier").
//
// Variants (both NO inline PL, since Path Z removed it):
//   (i)  "Subploters"   — clean wordmark, no trailing glyph
//   (ii) "Subploters*"  — wordmark with amber trailing * accent
//
// Renders both in:
//   - light context (ink letters on cream — body / About / deck)
//   - dark context  (cream letters on ink  — platform header / footer)
//
// Also shows the v1.1 master lockup with PL inline + trailing * for reference,
// so Anton can see the full delta from v1.1 to v1.2.

const fs = require('fs');
const path = require('path');

const NODE_MODULES = path.resolve(__dirname, 'node_modules');
const opentype = require(path.join(NODE_MODULES, 'opentype.js'));
const FONT_PATH = path.join(NODE_MODULES, 'geist/dist/fonts/geist-sans/Geist-SemiBold.ttf');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';

const FONT_SIZE = 1000;
const fontBuffer = fs.readFileSync(FONT_PATH);
const font = opentype.parse(fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength));

const upm = font.unitsPerEm;
const ascenderPx = font.ascender * FONT_SIZE / upm;
const descenderPx = font.descender * FONT_SIZE / upm;
const descenderDepth = -descenderPx;
const capHeightPx = (font.tables.os2 && font.tables.os2.sCapHeight ? font.tables.os2.sCapHeight : 700) * FONT_SIZE / upm;

const baselineY = ascenderPx;

// Render plain "Subploters" — no PL, no *
const subPath = font.getPath('Subploters', 0, baselineY, FONT_SIZE);
const subWidth = font.getAdvanceWidth('Subploters', FONT_SIZE);
const subD = subPath.toPathData(2);
const subBB = subPath.getBoundingBox();

// Render trailing * separately (same proportions as build-lockup.js)
const ASTERISK_GAP = 40;
const ASTERISK_SIZE = FONT_SIZE * 0.42;
const asteriskX = subWidth + ASTERISK_GAP;
const asteriskBaselineY = (baselineY - capHeightPx) + ASTERISK_SIZE * 0.85;
const asteriskPath = font.getPath('*', asteriskX, asteriskBaselineY, ASTERISK_SIZE);
const asteriskWidth = font.getAdvanceWidth('*', ASTERISK_SIZE);
const asteriskD = asteriskPath.toPathData(2);
const asteriskBB = asteriskPath.getBoundingBox();

const padX = 60;
const padY = 60;

// viewBox for "Subploters" (no *) — fits content with padding
const cleanMinX = subBB.x1 - padX;
const cleanMinY = subBB.y1 - padY;
const cleanW = (subBB.x2 - subBB.x1) + 2 * padX;
const cleanH = (subBB.y2 - subBB.y1) + 2 * padY;

// viewBox for "Subploters*" (with *) — fits both
const fullMinX = Math.min(subBB.x1, asteriskBB.x1) - padX;
const fullMinY = Math.min(subBB.y1, asteriskBB.y1) - padY;
const fullW = (Math.max(subBB.x2, asteriskBB.x2) - fullMinX) + padX;
const fullH = (Math.max(subBB.y2, asteriskBB.y2) - fullMinY) + padY;

function cleanWordmarkSvg(letterColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${cleanMinX.toFixed(0)} ${cleanMinY.toFixed(0)} ${cleanW.toFixed(0)} ${cleanH.toFixed(0)}" preserveAspectRatio="xMidYMid meet">
  <path d="${subD}" fill="${letterColor}"/>
</svg>`;
}

function asteriskWordmarkSvg(letterColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${fullMinX.toFixed(0)} ${fullMinY.toFixed(0)} ${fullW.toFixed(0)} ${fullH.toFixed(0)}" preserveAspectRatio="xMidYMid meet">
  <path d="${subD}" fill="${letterColor}"/>
  <path d="${asteriskD}" fill="${COLOR_AMBER}"/>
</svg>`;
}

// Reference: the v1.1 master lockup (path to existing asset)
const v1LockupPath = path.resolve(__dirname, '../assets/subploters-lockup.svg');
const v1Lockup = fs.existsSync(v1LockupPath) ? fs.readFileSync(v1LockupPath, 'utf8') : '<svg viewBox="0 0 100 100"/>';
// Strip XML decl + comments for inline embedding
const v1LockupInline = v1Lockup.replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();

// Favicon (Q1 a1 lock) — amber field + ink letter
const sPath = font.getPath('S', 0, 0, FONT_SIZE);
const sBB = sPath.getBoundingBox();
const sD = sPath.toPathData(2);
const sGlyphH = sBB.y2 - sBB.y1;
const sCanvas = sGlyphH / 0.62;
const sCx = (sBB.x1 + sBB.x2) / 2;
const sCy = (sBB.y1 + sBB.y2) / 2;
const sVbX = sCx - sCanvas / 2;
const sVbY = sCy - sCanvas / 2;
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sVbX.toFixed(1)} ${sVbY.toFixed(1)} ${sCanvas.toFixed(1)} ${sCanvas.toFixed(1)}" preserveAspectRatio="xMidYMid meet">
  <rect x="${sVbX.toFixed(1)}" y="${sVbY.toFixed(1)}" width="${sCanvas.toFixed(1)}" height="${sCanvas.toFixed(1)}" fill="${COLOR_AMBER}"/>
  <path d="${sD}" fill="${COLOR_INK}"/>
</svg>`;

function brandSystemRow({ wordmarkSvg, label, bgColor, letterColor }) {
  return `<div style="background:${bgColor};padding:32px;border-radius:0;border:1px solid ${bgColor === COLOR_CREAM ? '#e0d8b8' : '#000'};">
    <div style="display:flex;align-items:center;gap:24px;justify-content:center;">
      <div style="height:80px;display:flex;align-items:center;">${wordmarkSvg.replace(/<svg /, '<svg style="height:60px;width:auto;" ')}</div>
      <div style="width:1px;height:48px;background:${letterColor};opacity:0.3;"></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
        <div style="width:48px;height:48px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;">${faviconSvg.replace(/<svg /, '<svg style="width:48px;height:48px;" ')}</div>
        <div style="font-family:JetBrains Mono,monospace;font-size:10px;color:${letterColor};opacity:0.6;letter-spacing:0.12em;">favicon</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:12px;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${letterColor};opacity:0.6;">${label}</div>
  </div>`;
}

const variants = [
  {
    id: 'i',
    label: 'Retire trailing *',
    spec: 'Removes the v1.1 trailing-* qualifier entirely. Wordmark is just "Subploters" — no decoration.',
    feel: 'Maximum Stripe/Substack purity. Reads as confident, no-flourish, modern. Loses the chat-37/38 typographic accent.',
    lineage: 'Stripe (logo: just "stripe"), Substack (logo: just "Substack"), Linear, Notion',
    light: brandSystemRow({ wordmarkSvg: cleanWordmarkSvg(COLOR_INK), label: 'ink-on-cream (body / About / deck)', bgColor: COLOR_CREAM, letterColor: COLOR_INK }),
    dark:  brandSystemRow({ wordmarkSvg: cleanWordmarkSvg(COLOR_CREAM), label: 'cream-on-ink (header / footer)',      bgColor: COLOR_INK,  letterColor: COLOR_CREAM }),
  },
  {
    id: 'ii',
    label: 'Keep * as typographic accent',
    spec: 'Trailing * is part of the master lockup composition — not a separate "qualifier". Always renders with the wordmark.',
    feel: 'Preserves the chat-37/38 amber spark next to the wordmark. Gives the wordmark a tail / superscript flourish. Stays in the wink-family with the "Professional Subploters Association" framing.',
    lineage: 'No direct lineage — uncommon. Mailchimp has a comma at end of "Mailchimp,", FRIDAY uses a dot.',
    light: brandSystemRow({ wordmarkSvg: asteriskWordmarkSvg(COLOR_INK), label: 'ink-on-cream (body / About / deck)', bgColor: COLOR_CREAM, letterColor: COLOR_INK }),
    dark:  brandSystemRow({ wordmarkSvg: asteriskWordmarkSvg(COLOR_CREAM), label: 'cream-on-ink (header / footer)',      bgColor: COLOR_INK,  letterColor: COLOR_CREAM }),
  },
];

const cards = variants.map((v) => `
  <div class="card" data-choice="${v.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="padding:0;display:flex;flex-direction:column;gap:0;background:#fafafa;">
      ${v.light}
      ${v.dark}
    </div>
    <div class="card-body">
      <h3>(${v.id.toUpperCase()}) ${v.label}</h3>
      <p style="margin:4px 0;"><strong>Spec:</strong> ${v.spec}</p>
      <p style="margin:4px 0;"><strong>Lineage:</strong> ${v.lineage}</p>
      <p style="margin:4px 0;color:#888;font-size:0.9em;"><strong>Feel:</strong> ${v.feel}</p>
    </div>
  </div>`).join('\n');

const html = `<h2>Q2 — Trailing * status under Path Z</h2>
<p class="subtitle">Path Z removed the inline PL. Question now: also retire the trailing *, or keep it as a wordmark typographic accent? Each card shows the wordmark in both ink-on-cream and cream-on-ink contexts, paired with the Q1 (a1) amber-field favicon for the full brand-system feel.</p>

<div class="section" style="background:#fef6e6;padding:16px 20px;border:1.5px solid #886c37;margin-bottom:24px;font-size:13px;">
  <strong>For reference — v1.1 master lockup (with PL inline + trailing *):</strong>
  <div style="display:flex;justify-content:center;margin-top:12px;background:#fef6e6;padding:24px;">
    <div style="height:80px;">${v1LockupInline.replace(/<svg /, '<svg style="height:80px;width:auto;" ')}</div>
  </div>
  <div style="margin-top:8px;font-size:11px;font-family:JetBrains Mono,monospace;color:#886c37;letter-spacing:0.12em;text-transform:uppercase;text-align:center;">v1.1 — to be replaced</div>
</div>

<div class="cards" style="grid-template-columns:repeat(1,1fr);">
${cards}
</div>

<div class="section" style="margin-top:24px;padding:12px 16px;background:#fff8e1;border-left:3px solid #f59e0b;font-size:13px;">
  <strong>My read:</strong> (i) retire is the orthodox Path Z move — pure typography, no flourish. (ii) keep preserves the amber spark already established in chat-37/38. The amber-field favicon (Q1 a1) already gives the system a strong amber signature, so the wordmark accent isn't NEEDED to carry amber. (i) is the cleaner choice unless you want the typographic playfulness of the *.
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q2-trailing-board.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'q2-trailing-asterisk.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
