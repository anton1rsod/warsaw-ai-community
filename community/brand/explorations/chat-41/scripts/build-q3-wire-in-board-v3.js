// build-q3-wire-in-board-v3.js — chat-41 / Q3 v3 iterations
//
// Iterations from Anton's v2 review:
//   - Header: chip and "home" visually merged. Fix = lockup→chip gap reduces to 16px
//     (chip is owned by the brand group), chip→nav gap is min 48px (clearly separate).
//   - Header: nav font changes from JetBrains Mono → Geist 500 (matches the wordmark
//     so logo and chrome aren't visually disconnected).
//   - Footer: "MIT" touched "about" at this viewport — same flex-gap-zero bug.
//     Fix = explicit min gap between bottom-row flex children.
//   - About: drop the embedded lockup from the formal-entity line. Plain Geist 500
//     for the whole "Professional Subploters Association" line. Amends §4.4.
//
// Usage:
//   node community/brand/.scratch/build-q3-wire-in-board-v3.js <screen_dir>

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

// Header v3 — Geist nav, explicit min gap between left group and nav
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

// Footer v3 — explicit gap between bottom-row flex children
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

// About v3 — no embedded lockup. Plain Geist 500 "Professional Subploters Association"
function aboutMastheadMock() {
  return `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};">
    <div style="max-width:768px;margin:0 auto;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:11px;letter-spacing:0.20em;text-transform:uppercase;color:${COLOR_DUST};margin-bottom:18px;">
        Polish Stowarzyszenie · Founded 2026 · Warsaw
      </div>
      <h1 style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:40px;color:${COLOR_INK};letter-spacing:-0.015em;margin:0;line-height:1.15;">
        Professional Subploters Association
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
    title: 'Header — Geist nav + breathing room',
    spec: '§4.3 chip stays JetBrains Mono caps. Nav changes to Geist 500 to match the lockup family. New rule on parent flex: gap=48px minimum so chip never visually touches "home".',
    before: headerMock(false),
    after: headerMock(true),
    diff: 'v3 changes: (1) nav font JetBrains Mono → Geist 500 — matches lockup family, removes visual mismatch; (2) lockup→chip gap 32px → 16px (chip belongs to brand group); (3) parent flex gap=48px min, so chip→nav can never collapse to zero; (4) "[ sign in ]" brackets dropped — Geist sans doesn\'t need them; (5) chip text "WARSAW" stays JetBrains Mono caps per §4.3.',
  },
  {
    id: 'footer',
    title: 'Footer — gap fix',
    spec: 'Same formal entity line. Parent flex gets gap=32px min so copyright and links can never collapse to zero.',
    before: footerMock(false),
    after: footerMock(true),
    diff: 'v3 changes: (1) parent flex gap=32px min — bottom row\'s "MIT" and "about" can never visually touch; (2) flex-wrap added so on narrow viewports the rows stack instead of crushing.',
  },
  {
    id: 'about',
    title: '/handbook masthead — plain text, no lockup embed',
    spec: '§4.4 AMENDED: drop the embedded master lockup from the formal-entity line. Plain Geist 500 text for the whole "Professional Subploters Association".',
    before: `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};max-width:100%;">
      <div style="max-width:768px;margin:0 auto;">
        <h1 style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:italic;font-weight:900;font-size:32px;color:${COLOR_INK};margin:0;">Handbook</h1>
        <p style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:italic;font-size:14px;color:${COLOR_INK};margin-top:8px;opacity:0.7;">(current state — no formal entity surface)</p>
      </div>
    </div>`,
    after: aboutMastheadMock(),
    diff: 'v3 changes: (1) formal entity is now ONE plain text line in Geist 500 — no embedded master lockup; (2) headline size 40px (the lockup\'s visual presence is gone, so the text can carry more weight); (3) §4.4 spec amendment: "Plain Geist 500 ink — no embedded lockup composition." Lockup stays reserved for hero / cover / chrome usage where the brand needs to lead visually.',
  },
];

const sections = surfaces.map((s) => `
  <div class="card" data-choice="${s.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fafafa;padding:0;display:flex;flex-direction:column;gap:0;min-height:0;">
      <div style="padding:8px 14px;background:#eee;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#555;">Before — current ${s.id}</div>
      ${s.before}
      <div style="padding:8px 14px;background:#fff8e1;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR_DUST};border-top:1.5px solid ${COLOR_AMBER};border-bottom:1.5px solid ${COLOR_AMBER};">After — v3 ${s.id}</div>
      ${s.after}
    </div>
    <div class="card-body">
      <h3>${s.title}</h3>
      <p style="margin:4px 0;"><strong>Spec:</strong> ${s.spec}</p>
      <p style="margin:4px 0;color:${COLOR_DUST};font-size:0.9em;"><strong>v2 → v3 diff:</strong> ${s.diff}</p>
    </div>
  </div>`).join('\n');

const html = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap');
</style>

<h2>Q3 v3 — Platform wire-in (gap fixes + Geist nav + plain-text formal entity)</h2>
<p class="subtitle">Four v2→v3 iterations applied. The big spec impact: §4.4 formal-entity treatment is amended to drop the embedded master lockup — plain text only. Header nav changes from JetBrains Mono to Geist 500.</p>

<div class="section" style="background:#fef6e6;padding:14px 18px;border-left:3px solid ${COLOR_AMBER};margin-bottom:24px;font-size:13px;">
  <strong>Spec amendments to brand.md (preview):</strong>
  <ul style="margin:8px 0 0 0;padding-left:20px;">
    <li><strong>§1 Founding:</strong> 2024 → 2026 (correcting stale value).</li>
    <li><strong>§4.3 City stamp:</strong> add "header chip variant: small size (3px 8px padding), CITY-only (no PSA prefix when paired with master wordmark in the same surface)."</li>
    <li><strong>§4.4 Formal entity:</strong> remove "master inline-fused lockup embedded inline for the 'Subploters' portion". Replace with: "Plain Geist 500 ink for the entire 'Professional Subploters Association' line — no embedded lockup."</li>
    <li><strong>§2 / §4 — header chrome exception:</strong> note that the platform Header nav uses Geist 500 (not voice/JetBrains Mono) to maintain visual continuity with the wordmark. Chip retains JetBrains Mono per §4.3 because it's a label/data element.</li>
  </ul>
</div>

<div class="cards" style="grid-template-columns:repeat(1,1fr);gap:24px;">
${sections}
</div>

<div class="section" style="margin-top:24px;padding:14px 18px;background:#fff8e1;border-left:3px solid ${COLOR_AMBER};font-size:13px;">
  <strong>One open call I should flag:</strong> dropping the embedded lockup from §4.4 means the master inline-fused lockup is reserved for hero/cover/chrome usage (header logo, deck covers, social profiles). Body-context references to "Subploters" become plain Geist text. That's a meaningful brand-system simplification — the lockup becomes a logo, not a typographic substitution token. Want this codified, or do you want to keep the lockup-embedding rule alive for specific contexts (e.g., About page only)?
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q3-wire-in-board-v3.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'q3-wire-in-execution-v3.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
