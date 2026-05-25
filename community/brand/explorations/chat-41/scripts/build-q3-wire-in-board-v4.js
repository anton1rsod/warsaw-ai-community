// build-q3-wire-in-board-v4.js — chat-41 / Q3 v4
//
// Anton's v3 review: approved Header + Footer. About masthead needs the
// trailing `*` on "Subploters" — same brand-signature treatment as the wordmark,
// signalling "it's our organization." Plain HTML / Geist text (no embedded
// lockup, per v3 §4.4 amendment) — the * is rendered as a small amber
// superscript next to the wordmark.

const fs = require('fs');
const path = require('path');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';
const COLOR_DUST = '#886c37';

const ASSETS = path.resolve(__dirname, '../assets');
const lockupDark = fs.readFileSync(path.join(ASSETS, 'subploters-lockup-dark.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();

function cityChip(text, sizePx = 9) {
  return `<span style="display:inline-block;background:${COLOR_AMBER};color:${COLOR_INK};padding:3px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:${sizePx}px;letter-spacing:0.18em;text-transform:uppercase;transform:rotate(-1.5deg);transform-origin:center;border-radius:0;">${text}</span>`;
}

function headerMock(withChip) {
  const navItems = ['home','calendar','projects','members','handbook'];
  const navHtml = navItems.map((label, idx) => `
    <span style="display:flex;align-items:center;gap:10px;">
      ${idx > 0 ? `<span style="opacity:0.5;font-family:'Geist',sans-serif;">·</span>` : ''}
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;letter-spacing:0;">${label}</a>
    </span>`).join('');
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-size:13px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;gap:48px;">
    <div style="display:flex;align-items:center;gap:16px;">
      <a href="#" style="display:inline-flex;align-items:center;">${lockupDark.replace(/<svg /, '<svg style="height:24px;width:auto;" ')}</a>
      ${withChip ? cityChip('WARSAW', 9) : ''}
    </div>
    <nav style="display:flex;align-items:center;gap:14px;">${navHtml}</nav>
    <div style="display:flex;align-items:center;gap:12px;">
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;font-family:'Geist',sans-serif;font-weight:500;">sign in</a>
    </div>
  </div>`;
}

function footerMock(withFormalEntity) {
  const formalLine = withFormalEntity ? `
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR_CREAM};opacity:0.6;padding-bottom:6px;border-bottom:1px solid ${COLOR_CREAM}1f;margin-bottom:8px;">
      Professional Subploters Association
    </div>` : '';
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};padding:12px 16px;font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:italic;font-size:11px;">
    ${formalLine}
    <div style="display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;">
      <div>
        <span>© 2026 Subploters</span>
        <span style="opacity:0.85;"> · </span>
        <span style="font-family:'JetBrains Mono',ui-monospace,monospace;font-style:normal;opacity:0.7;font-size:10px;">built in public, MIT</span>
      </div>
      <nav style="font-family:'JetBrains Mono',ui-monospace,monospace;font-style:normal;font-size:10px;opacity:0.85;display:flex;gap:8px;">
        <a href="#" style="color:${COLOR_CREAM};text-decoration:none;">about</a>
        <span>·</span>
        <a href="#" style="color:${COLOR_CREAM};text-decoration:none;">telegram</a>
        <span>·</span>
        <a href="#" style="color:${COLOR_CREAM};text-decoration:none;">github</a>
        <span>·</span>
        <a href="#" style="color:${COLOR_CREAM};text-decoration:none;">license</a>
      </nav>
    </div>
  </div>`;
}

// About v4 — adds the * brand-signature to "Subploters" in the headline.
// The * is amber, ~0.55em of the headline (so it's superscript-sized), positioned at the top right of "Subploters".
function aboutMastheadMock() {
  return `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};">
    <div style="max-width:768px;margin:0 auto;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:11px;letter-spacing:0.20em;text-transform:uppercase;color:${COLOR_DUST};margin-bottom:18px;">
        Founded 2026 · Warsaw
      </div>
      <h1 style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:40px;color:${COLOR_INK};letter-spacing:-0.015em;margin:0;line-height:1.15;">
        Professional Subploters<sup style="color:${COLOR_AMBER};font-size:0.55em;line-height:0;font-weight:500;vertical-align:0.55em;margin-left:0.05em;">*</sup> Association
      </h1>
      <p style="font-family:'Inter',ui-sans-serif,system-ui,sans-serif;font-size:14px;color:${COLOR_INK};margin-top:20px;max-width:520px;line-height:1.5;">
        The Warsaw chapter of the Professional Subploters Association &mdash; for founders writing their next plot.
      </p>
    </div>
  </div>`;
}

const surfaces = [
  {
    id: 'header',
    title: 'Header (locked from v3)',
    spec: 'Geist 500 nav + 16px lockup→chip + 48px min flex gap + JetBrains Mono chip',
    after: headerMock(true),
    note: 'Unchanged from v3 — approved.',
  },
  {
    id: 'footer',
    title: 'Footer (locked from v3)',
    spec: 'JetBrains Mono caps formal-entity line + 32px gap + flex-wrap',
    after: footerMock(true),
    note: 'Unchanged from v3 — approved.',
  },
  {
    id: 'about',
    title: '/handbook masthead — v4: + brand-signature *',
    spec: '§4.4: Plain Geist 500 + amber * superscript on "Subploters" — "it\'s our organization" signal',
    after: aboutMastheadMock(),
    note: 'v4 diff: (1) trailing `*` added on "Subploters" in the headline — amber, ~0.55em, superscript position; same convention as the master lockup. (2) "Polish Stowarzyszenie" dropped from caption — Stowarzyszenie is now legal-doc-only, not surfaced anywhere on the platform.',
  },
];

const sections = surfaces.map((s) => `
  <div class="card" data-choice="${s.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fafafa;padding:0;display:flex;flex-direction:column;gap:0;min-height:0;">
      <div style="padding:8px 14px;background:#fff8e1;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR_DUST};border-top:1.5px solid ${COLOR_AMBER};border-bottom:1.5px solid ${COLOR_AMBER};">v4 — ${s.id}</div>
      ${s.after}
    </div>
    <div class="card-body">
      <h3>${s.title}</h3>
      <p style="margin:4px 0;"><strong>Spec:</strong> ${s.spec}</p>
      <p style="margin:4px 0;color:${COLOR_DUST};font-size:0.9em;">${s.note}</p>
    </div>
  </div>`).join('\n');

const html = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap');
</style>

<h2>Q3 v4 — final composite (all three surfaces)</h2>
<p class="subtitle">Header + Footer locked from v3. About masthead adds the trailing * brand-signature on "Subploters" (amber superscript). This is the proposed final wire-in.</p>

<div class="cards" style="grid-template-columns:repeat(1,1fr);gap:24px;">
${sections}
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q3-wire-in-board-v4.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'q3-wire-in-execution-v4.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
