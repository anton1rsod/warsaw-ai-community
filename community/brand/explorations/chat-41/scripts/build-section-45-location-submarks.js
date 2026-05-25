// build-section-45-location-submarks.js — chat-41 / §4.5 location sub-marks
//
// Reproduces the spec composition Anton showed (wordmark + city stamp,
// stacked) using the v1.1 LOCKED lockup (subploters-lockup.svg with PL inline
// + trailing *) instead of plain-text "Subploters*". Demonstrates the
// stamp-replaceable system: same lockup, different city.
//
// City stamps here KEEP the -1.5° tilt per §4.3 (this is NOT a chrome
// surface — the chrome variant is the only one that's upright per v5).

const fs = require('fs');
const path = require('path');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';
const COLOR_DUST = '#886c37';

const ASSETS = path.resolve(__dirname, '../assets');
const lockupLight = fs.readFileSync(path.join(ASSETS, 'subploters-lockup.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();

// §4.3 city stamp — non-chrome variant (tilted, PSA · CITY format, standard size per §4.3)
function locationCityStamp(city, sizePx = 16) {
  return `<span style="display:inline-block;background:${COLOR_AMBER};color:${COLOR_INK};padding:12px 24px;font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:${sizePx}px;letter-spacing:0.20em;text-transform:uppercase;transform:rotate(-1.5deg);transform-origin:left center;border-radius:0;">PSA &middot; ${city}</span>`;
}

// One location sub-mark composition: wordmark above, city stamp below-left
function locationSubMark(city) {
  return `<div style="background:${COLOR_CREAM};padding:48px;display:flex;flex-direction:column;gap:24px;align-items:flex-start;">
    <div style="display:flex;align-items:center;">${lockupLight.replace(/<svg /, '<svg style="height:80px;width:auto;" ')}</div>
    ${locationCityStamp(city, 16)}
  </div>`;
}

// Stamp-replaceable demonstration — Polish cities only (brand is PL-only for now)
const cities = ['WARSAW', 'KRAKÓW', 'GDAŃSK'];
// Map of CITY → ASCII handle (strips diacritics for URLs / handles)
const handles = { 'WARSAW': 'warsaw', 'KRAKÓW': 'krakow', 'GDAŃSK': 'gdansk' };
const compositions = cities.map((city) => `
  <div class="card">
    <div class="card-image" style="background:${COLOR_CREAM};padding:0;display:flex;flex-direction:column;min-height:0;border:1.5px solid ${COLOR_INK};">
      ${locationSubMark(city)}
    </div>
    <div class="card-body">
      <h3>Subploters &middot; ${city}</h3>
      <p style="margin:4px 0;color:${COLOR_DUST};font-size:0.9em;">@subploters_${handles[city]} · subploters.com/${handles[city]}</p>
    </div>
  </div>`).join('\n');

const html = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap');
</style>

<h2>§4.5 Location sub-marks — Polish cities</h2>
<p class="subtitle">Composition for non-chrome contexts: local landing pages, city-specific deck covers, Subploters Warsaw social profiles, location landing pages. Master lockup (v1.1: PL inline + trailing *) above, amber city stamp below at -1.5° tilt and §4.3 standard size. Polish-only for now — Kraków and Gdańsk shown as future-city examples within the same country.</p>

<div class="section" style="background:#fef6e6;padding:14px 18px;border-left:3px solid ${COLOR_AMBER};margin-bottom:24px;font-size:13px;">
  <strong>Why the city stamp is tilted here (and upright in the header):</strong> the -1.5° rotation reads as a deliberate brand accent on standalone surfaces (deck covers, social, landing pages) where the city stamp lives in calm whitespace. In the platform header chrome, everything else is upright so a tilted chip reads as "broken" — that's why the v5 header chip is 0°. Same element, two contexts, two rotations. <strong>Anti-pattern:</strong> don't tilt the chip in chrome; don't strip the tilt from location sub-marks.
</div>

<div class="cards" style="grid-template-columns:repeat(2,1fr);gap:24px;">
${compositions}
</div>

<div class="section" style="background:#fef6e6;padding:14px 18px;border-left:3px solid ${COLOR_AMBER};margin-top:24px;font-size:13px;">
  <strong>Spec note:</strong> the §4.5 ASCII diagram in brand.md currently shows plain-text "Subploters" for the wordmark slot. This mockup confirms it should be the path-drawn v1.1 lockup (assets/subploters-lockup.svg). The amended §4.5 will reference the asset explicitly.
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-section-45-location-submarks.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'section-45-location-submarks.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
