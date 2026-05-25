// build-location-assets.js — chat-42 / export §4.5 location sub-marks as standalone assets.
// Emits one clean, tightly-cropped HTML page per city (lockup + tilted PSA·CITY stamp,
// scaled up ~2.5x so a 1x screenshot is high-res). Render each via a headless browser
// and screenshot → PNG into community/brand/assets/locations/.
const fs = require('fs');
const path = require('path');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';

const ASSETS = path.resolve(__dirname, '../assets');
const lockup = fs.readFileSync(path.join(ASSETS, 'subploters-lockup.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();

const cities = { warsaw: 'WARSAW', krakow: 'KRAKÓW', gdansk: 'GDAŃSK' };

const outDir = process.argv[2];
if (!outDir) { console.error('Usage: node build-location-assets.js <out_dir>'); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

for (const [handle, city] of Object.entries(cities)) {
  const stamp = `<span style="display:inline-block;background:${COLOR_AMBER};color:${COLOR_INK};padding:16px 32px;font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:30px;letter-spacing:0.20em;text-transform:uppercase;transform:rotate(-1.5deg);transform-origin:left center;">PSA &middot; ${city}</span>`;
  const page = `<!doctype html><meta charset=utf8>
<style>@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
html,body{margin:0}#mark{background:${COLOR_CREAM};padding:64px 72px;display:inline-flex;flex-direction:column;gap:36px;align-items:flex-start}</style>
<div id="mark">
  <div style="display:flex;align-items:center">${lockup.replace(/<svg /, '<svg style="height:200px;width:auto;" ')}</div>
  ${stamp}
</div>`;
  fs.writeFileSync(path.join(outDir, `subploters-${handle}.html`), page);
  console.log(`wrote subploters-${handle}.html`);
}
