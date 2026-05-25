// build-q3-wire-in-board-v2.js — chat-41 / Q3 v2 iterations
//
// Iterations from Anton's v1 review:
//   - Header: chip = "WARSAW" only (no PSA prefix); larger gap between lockup and chip
//   - Footer: formal entity line = "PROFESSIONAL SUBPLOTERS ASSOCIATION" (no Polish Stowarzyszenie)
//   - /handbook masthead:
//       - Year corrected to 2026 (not 2024)
//       - Framing words "Professional" + "Association" in Geist (matches wordmark family), NOT serif italic
//       - Subtitle paragraph drops "venture studio" mention
//
// Usage:
//   node community/brand/.scratch/build-q3-wire-in-board-v2.js <screen_dir>

const fs = require('fs');
const path = require('path');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';
const COLOR_DUST = '#886c37';

const ASSETS = path.resolve(__dirname, '../assets');
const lockupDark = fs.readFileSync(path.join(ASSETS, 'subploters-lockup-dark.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();
const lockupLight = fs.readFileSync(path.join(ASSETS, 'subploters-lockup.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();

// City stamp chip — now just CITY (no PSA prefix)
function cityChip(text, sizePx = 9) {
  return `<span style="display:inline-block;background:${COLOR_AMBER};color:${COLOR_INK};padding:3px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:${sizePx}px;letter-spacing:0.18em;text-transform:uppercase;transform:rotate(-1.5deg);transform-origin:center;border-radius:0;">${text}</span>`;
}

// Header — increased gap (32px) between lockup and chip
function headerMock(withChip) {
  const navItems = ['home','calendar','projects','members','handbook'];
  const navHtml = navItems.map((label, idx) => `
    <span style="display:flex;align-items:center;gap:8px;">
      ${idx > 0 ? `<span style="opacity:0.5;">·</span>` : ''}
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;">${label}</a>
    </span>`).join('');
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.5px;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:32px;">
      <a href="#" style="display:inline-flex;align-items:center;">${lockupDark.replace(/<svg /, '<svg style="height:24px;width:auto;" ')}</a>
      ${withChip ? cityChip('WARSAW', 9) : ''}
    </div>
    <nav style="display:flex;align-items:center;gap:12px;">${navHtml}</nav>
    <div style="display:flex;align-items:center;gap:12px;">
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;">[ sign in ]</a>
    </div>
  </div>`;
}

// Footer — formal entity line now reads PROFESSIONAL SUBPLOTERS ASSOCIATION only
function footerMock(withFormalEntity) {
  const formalLine = withFormalEntity ? `
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR_CREAM};opacity:0.6;padding-bottom:6px;border-bottom:1px solid ${COLOR_CREAM}1f;margin-bottom:8px;">
      Professional Subploters Association
    </div>` : '';
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};padding:12px 16px;font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:italic;font-size:11px;">
    ${formalLine}
    <div style="display:flex;justify-content:space-between;align-items:center;">
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

// About masthead — year 2026, Geist framing (no serif italic), no venture studio
function aboutMastheadMock() {
  return `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};">
    <div style="max-width:768px;margin:0 auto;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:11px;letter-spacing:0.20em;text-transform:uppercase;color:${COLOR_DUST};margin-bottom:18px;">
        Polish Stowarzyszenie · Founded 2026 · Warsaw
      </div>
      <div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;">
        <span style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:36px;color:${COLOR_INK};letter-spacing:-0.01em;">Professional</span>
        <span style="display:inline-flex;align-items:baseline;height:48px;">${lockupLight.replace(/<svg /, '<svg style="height:48px;width:auto;" ')}</span>
        <span style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:36px;color:${COLOR_INK};letter-spacing:-0.01em;">Association</span>
      </div>
      <p style="font-family:'Inter',ui-sans-serif,system-ui,sans-serif;font-size:14px;color:${COLOR_INK};margin-top:20px;max-width:520px;line-height:1.5;">
        The Warsaw chapter of the Professional Subploters Association &mdash; for founders writing their next plot.
      </p>
    </div>
  </div>`;
}

const surfaces = [
  {
    id: 'header',
    title: 'Header — WARSAW chip',
    spec: '§4.3 city stamp (small size). Chip text simplified to CITY only; 32px gap from lockup',
    before: headerMock(false),
    after: headerMock(true),
    diff: 'v2: removed "PSA" prefix → just `WARSAW`. Lockup→chip gap increased from 16px to 32px so the chip breathes.',
  },
  {
    id: 'footer',
    title: 'Footer — formal entity (Association only)',
    spec: '§4.4 formal entity name; Stowarzyszenie reference moved to About surface only',
    before: footerMock(false),
    after: footerMock(true),
    diff: 'v2: dropped "· Polish Stowarzyszenie" suffix. Footer line is just `PROFESSIONAL SUBPLOTERS ASSOCIATION`.',
  },
  {
    id: 'about',
    title: '/handbook masthead — Geist framing, 2026',
    spec: '§4.4 formal entity lockup; framing words in Geist 500 to match the wordmark family',
    before: `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};max-width:100%;">
      <div style="max-width:768px;margin:0 auto;">
        <h1 style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:italic;font-weight:900;font-size:32px;color:${COLOR_INK};margin:0;">Handbook</h1>
        <p style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:italic;font-size:14px;color:${COLOR_INK};margin-top:8px;opacity:0.7;">(current state — no formal entity surface)</p>
      </div>
    </div>`,
    after: aboutMastheadMock(),
    diff: 'v2: (1) caption year 2024 → 2026; (2) framing words ("Professional" / "Association") changed from Georgia serif italic → Geist 500 sans (same family as the wordmark, no visual differ); (3) subtitle dropped "venture studio" mention.',
  },
];

const sections = surfaces.map((s) => `
  <div class="card" data-choice="${s.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fafafa;padding:0;display:flex;flex-direction:column;gap:0;min-height:0;">
      <div style="padding:8px 14px;background:#eee;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#555;">Before — current ${s.id}</div>
      ${s.before}
      <div style="padding:8px 14px;background:#fff8e1;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR_DUST};border-top:1.5px solid ${COLOR_AMBER};border-bottom:1.5px solid ${COLOR_AMBER};">After — v2 ${s.id}</div>
      ${s.after}
    </div>
    <div class="card-body">
      <h3>${s.title}</h3>
      <p style="margin:4px 0;"><strong>Spec:</strong> ${s.spec}</p>
      <p style="margin:4px 0;color:${COLOR_DUST};font-size:0.9em;"><strong>v1 → v2 diff:</strong> ${s.diff}</p>
    </div>
  </div>`).join('\n');

const html = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap');
</style>

<h2>Q3 v2 — Platform wire-in (iterated)</h2>
<p class="subtitle">Three iterations applied. Each card shows BEFORE (current platform) and AFTER (v2 wire-in). The v1→v2 diff explains what changed.</p>

<div class="section" style="background:#fef6e6;padding:14px 18px;border-left:3px solid ${COLOR_AMBER};margin-bottom:24px;font-size:13px;">
  <strong>Spec note:</strong> The /handbook masthead now matches the §4.4 spec literally ("Geist 500 ink for 'Professional' and 'Association'"). The v1 mockup was using Georgia italic — that was a bug; v2 is correct per §4.4.
</div>

<div class="cards" style="grid-template-columns:repeat(1,1fr);gap:24px;">
${sections}
</div>

<div class="section" style="margin-top:24px;padding:14px 18px;background:#fff8e1;border-left:3px solid ${COLOR_AMBER};font-size:13px;">
  <strong>Year correction note:</strong> brand.md §1 currently lists the founding year as 2024 — that's stale (carried over from an earlier draft). The spec will be updated to 2026 along with this wire-in. The §4.4 example also gets updated.
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q3-wire-in-board-v2.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'q3-wire-in-execution-v2.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
