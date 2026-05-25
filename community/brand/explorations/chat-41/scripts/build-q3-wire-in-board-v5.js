// build-q3-wire-in-board-v5.js — chat-41 / Q3 v5 — final composite
//
// Anton's v4 locks:
//   1. Chip tilt removed — upright in chrome. Amends §2 / §4.3.
//   2. "Polish Stowarzyszenie" dropped everywhere on the platform AND in §1.
//      "We're not legally stowarzyszenie yet."
//   3. Plain-text * brand-signature applies to EVERY mention of "Subploters"
//      (copyright, formal entity, body, titles).
//   4. "built in public, MIT" string deleted from footer.

const fs = require('fs');
const path = require('path');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';
const COLOR_DUST = '#886c37';

const ASSETS = path.resolve(__dirname, '../assets');
const lockupDark = fs.readFileSync(path.join(ASSETS, 'subploters-lockup-dark.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();

// Brand-signature * convention. Used inline next to "Subploters" wherever it
// renders as plain text. Amber, ~0.55em, superscript position, weight matches
// surrounding text.
function signatureStar({ baseColor = COLOR_AMBER, scale = 0.55, vAlignEm = 0.55 } = {}) {
  return `<sup style="color:${baseColor};font-size:${scale}em;line-height:0;font-weight:500;vertical-align:${vAlignEm}em;margin-left:0.05em;">*</sup>`;
}

// Chip is now UPRIGHT (0° rotation). Amends §2 + §4.3 for chrome contexts.
function cityChip(text, sizePx = 9) {
  return `<span style="display:inline-block;background:${COLOR_AMBER};color:${COLOR_INK};padding:3px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:${sizePx}px;letter-spacing:0.18em;text-transform:uppercase;border-radius:0;">${text}</span>`;
}

// Header v5 — chip upright, lockup unchanged (already shows Subploters* via baked-in SVG)
function headerMock(withChip) {
  const navItems = ['home','calendar','projects','members','handbook'];
  const navHtml = navItems.map((label, idx) => `
    <span style="display:flex;align-items:center;gap:10px;">
      ${idx > 0 ? `<span style="opacity:0.5;font-family:'Geist',sans-serif;">·</span>` : ''}
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;letter-spacing:0;">${label}</a>
    </span>`).join('');
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-size:13px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;gap:48px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="#" style="display:inline-flex;align-items:center;">${lockupDark.replace(/<svg /, '<svg style="height:24px;width:auto;" ')}</a>
      ${withChip ? cityChip('WARSAW', 9) : ''}
    </div>
    <nav style="display:flex;align-items:center;gap:14px;">${navHtml}</nav>
    <div style="display:flex;align-items:center;gap:12px;">
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;font-family:'Geist',sans-serif;font-weight:500;">sign in</a>
    </div>
  </div>`;
}

// Footer v5 — "built in public, MIT" deleted; copyright gets *; formal entity gets *
function footerMock() {
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};padding:12px 16px;font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-style:italic;font-size:11px;">
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-style:normal;font-weight:500;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR_CREAM};opacity:0.6;padding-bottom:6px;border-bottom:1px solid ${COLOR_CREAM}1f;margin-bottom:8px;">
      Professional Subploters${signatureStar({ scale: 0.6, vAlignEm: 0.5 })} Association
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:32px;flex-wrap:wrap;">
      <div>
        <span>© 2026 Subploters${signatureStar()}</span>
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

// About v5 — caption "FOUNDED 2026 · WARSAW" (Stowarzyszenie dropped); * in headline
function aboutMastheadMock() {
  return `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};">
    <div style="max-width:768px;margin:0 auto;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:11px;letter-spacing:0.20em;text-transform:uppercase;color:${COLOR_DUST};margin-bottom:18px;">
        Founded 2026 · Warsaw
      </div>
      <h1 style="font-family:'Geist',ui-sans-serif,system-ui,sans-serif;font-weight:500;font-size:40px;color:${COLOR_INK};letter-spacing:-0.015em;margin:0;line-height:1.15;">
        Professional Subploters${signatureStar({ scale: 0.55, vAlignEm: 0.55 })} Association
      </h1>
      <p style="font-family:'Inter',ui-sans-serif,system-ui,sans-serif;font-size:14px;color:${COLOR_INK};margin-top:20px;max-width:520px;line-height:1.5;">
        The Warsaw chapter of the Professional Subploters${signatureStar({ scale: 0.55, vAlignEm: 0.35 })} Association &mdash; for founders writing their next plot.
      </p>
    </div>
  </div>`;
}

const surfaces = [
  {
    id: 'header',
    title: 'Header — chip upright, lockup unchanged',
    spec: '§4.3 chrome variant: 0° rotation (upright). Existing -1.5° tilt stays for non-chrome amber tags (hero AmberTag etc).',
    after: headerMock(true),
    diff: 'v5: chip tilt -1.5° → 0° (chrome reads as functional, not decorative). Everything else from v3/v4 stays.',
  },
  {
    id: 'footer',
    title: 'Footer — "built in public" dropped, * added',
    spec: '§4.4 formal entity gets *. Copyright also gets *. "built in public, MIT" string deleted.',
    after: footerMock(),
    diff: 'v5: (1) deleted "built in public, MIT" — footer is now {formal entity line} + {copyright | links}. (2) Copyright "© 2026 Subploters*" with brand-signature *. (3) Formal entity "Professional Subploters* Association" with *.',
  },
  {
    id: 'about',
    title: '/handbook masthead — Stowarzyszenie out, * in both lines',
    spec: '§4.4 plain Geist 500 + * in both headline AND subtitle (every plain-text "Subploters" wears *).',
    after: aboutMastheadMock(),
    diff: 'v5: (1) caption "Polish Stowarzyszenie · Founded 2026 · Warsaw" → "Founded 2026 · Warsaw" — Stowarzyszenie not legally registered yet. (2) * also added to subtitle "Professional Subploters* Association" — applies brand-signature consistently to every plain-text mention.',
  },
];

const sections = surfaces.map((s) => `
  <div class="card" data-choice="${s.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fafafa;padding:0;display:flex;flex-direction:column;gap:0;min-height:0;">
      <div style="padding:8px 14px;background:#fff8e1;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR_DUST};border-top:1.5px solid ${COLOR_AMBER};border-bottom:1.5px solid ${COLOR_AMBER};">v5 — ${s.id}</div>
      ${s.after}
    </div>
    <div class="card-body">
      <h3>${s.title}</h3>
      <p style="margin:4px 0;"><strong>Spec:</strong> ${s.spec}</p>
      <p style="margin:4px 0;color:${COLOR_DUST};font-size:0.9em;"><strong>v4 → v5 diff:</strong> ${s.diff}</p>
    </div>
  </div>`).join('\n');

const html = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap');
</style>

<h2>Q3 v5 — final composite (chip upright + Stowarzyszenie out + * everywhere + built-in-public out)</h2>
<p class="subtitle">Four v4 locks applied. This is the proposed final wire-in.</p>

<div class="section" style="background:#fef6e6;padding:14px 18px;border-left:3px solid ${COLOR_AMBER};margin-bottom:24px;font-size:13px;">
  <strong>Spec amendments to brand.md (final preview):</strong>
  <ul style="margin:8px 0 0 0;padding-left:20px;">
    <li><strong>§1 Founding row:</strong> 2024 → 2026. Drop "Polish Stowarzyszenie" reference everywhere — entity is not yet legally registered.</li>
    <li><strong>§1 Formal entity row:</strong> "Professional Subploters Association" without Stowarzyszenie label until registration ships.</li>
    <li><strong>§2 Geometric motifs:</strong> -1.5° rotation now applies only to AmberTag in hero/landing contexts. Chrome city stamps are upright (0°).</li>
    <li><strong>§3 Brand-signature convention (NEW):</strong> the trailing * is part of the wordmark and renders alongside every plain-text "Subploters" mention. Amber, ~0.55em, superscript. Lockup SVG already includes it; HTML/CSS body text adds it via &lt;sup&gt;.</li>
    <li><strong>§4.3 City stamp:</strong> add chrome variant: upright (0°), CITY-only (no PSA prefix when adjacent to the master wordmark), small size (3px 8px padding).</li>
    <li><strong>§4.4 Formal entity:</strong> plain Geist 500 ink — no embedded lockup. "Subploters" carries its * per §3 brand-signature convention.</li>
    <li><strong>§4 Header chrome exception:</strong> platform Header nav uses Geist 500 (not voice/JetBrains Mono) for visual continuity with the wordmark.</li>
    <li><strong>i18n delete:</strong> drop <code>chrome.footer.builtInPublic</code> string. Footer is now formal entity + copyright + links.</li>
  </ul>
</div>

<div class="cards" style="grid-template-columns:repeat(1,1fr);gap:24px;">
${sections}
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q3-wire-in-board-v5.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'q3-wire-in-execution-v5.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
