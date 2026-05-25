// build-q3-wire-in-board.js — chat-41 / Q3 platform wire-in execution mockup
//
// Anton picked (d) all three surfaces. This script generates a side-by-side
// before/after mockup of Header / Footer / About so we can lock the
// execution details:
//   - Header: small `[PSA · WARSAW]` chip right of lockup
//   - Footer: formal entity line (uppercase JetBrains Mono) above copyright
//   - About masthead: formal entity lockup at top of /handbook
//
// Usage:
//   node community/brand/.scratch/build-q3-wire-in-board.js <screen_dir>

const fs = require('fs');
const path = require('path');

const COLOR_INK = '#1a1a2e';
const COLOR_CREAM = '#fef6e6';
const COLOR_AMBER = '#f59e0b';
const COLOR_DUST = '#886c37';

// Inline the v1.1 master lockup SVGs
const ASSETS = path.resolve(__dirname, '../assets');
const lockupDark = fs.readFileSync(path.join(ASSETS, 'subploters-lockup-dark.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();
const lockupLight = fs.readFileSync(path.join(ASSETS, 'subploters-lockup.svg'), 'utf8')
  .replace(/<\?xml[^?]*\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim();

// Helper: city stamp chip (§4.3 — small size: 6px 14px padding, -1.5° rotation, amber bg, ink text, mono caps).
function cityChip(text, sizePx = 9) {
  return `<span style="display:inline-block;background:${COLOR_AMBER};color:${COLOR_INK};padding:3px 8px;font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:${sizePx}px;letter-spacing:0.18em;text-transform:uppercase;transform:rotate(-1.5deg);transform-origin:center;border-radius:0;">${text}</span>`;
}

// Build the header mockup HTML (mirroring Header.tsx — bg-ink, text-cream, font-voice, text-[11px], gap-3)
function headerMock(withChip) {
  const navItems = ['home','calendar','projects','members','handbook'];
  const navHtml = navItems.map((label, idx) => `
    <span style="display:flex;align-items:center;gap:8px;">
      ${idx > 0 ? `<span style="opacity:0.5;">·</span>` : ''}
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;">${label}</a>
    </span>`).join('');
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.5px;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:16px;">
      <a href="#" style="display:inline-flex;align-items:center;">${lockupDark.replace(/<svg /, '<svg style="height:24px;width:auto;" ')}</a>
      ${withChip ? cityChip('PSA · WARSAW', 9) : ''}
    </div>
    <nav style="display:flex;align-items:center;gap:12px;">${navHtml}</nav>
    <div style="display:flex;align-items:center;gap:12px;">
      <a href="#" style="color:${COLOR_CREAM};opacity:0.85;text-decoration:none;">[ sign in ]</a>
    </div>
  </div>`;
}

// Footer mock (mirroring Footer.tsx — bg-ink, text-cream, font-display italic, text-[11px], py-3 px-4)
function footerMock(withFormalEntity) {
  const formalLine = withFormalEntity ? `
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${COLOR_CREAM};opacity:0.6;padding-bottom:6px;border-bottom:1px solid ${COLOR_CREAM}1f;margin-bottom:8px;">
      Professional Subploters Association · Polish Stowarzyszenie
    </div>` : '';
  return `<div style="background:${COLOR_INK};color:${COLOR_CREAM};padding:12px 16px;font-family:Georgia,'Iowan Old Style',serif;font-style:italic;font-size:11px;">
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

// About masthead — landing on /handbook page top (which is the footer "about" target today)
function aboutMastheadMock() {
  return `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};">
    <div style="max-width:768px;margin:0 auto;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:11px;letter-spacing:0.20em;text-transform:uppercase;color:${COLOR_DUST};margin-bottom:18px;">
        Polish Stowarzyszenie · Founded 2024 · Warsaw
      </div>
      <div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;">
        <span style="font-family:Georgia,'Iowan Old Style',serif;font-weight:500;font-size:36px;color:${COLOR_INK};">Professional</span>
        <span style="display:inline-flex;align-items:baseline;height:48px;">${lockupLight.replace(/<svg /, '<svg style="height:48px;width:auto;" ')}</span>
        <span style="font-family:Georgia,'Iowan Old Style',serif;font-weight:500;font-size:36px;color:${COLOR_INK};">Association</span>
      </div>
      <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:${COLOR_INK};margin-top:20px;max-width:520px;line-height:1.5;">
        The Warsaw chapter of the Professional Subploters Association — a venture studio for founders writing their next plot.
      </p>
    </div>
  </div>`;
}

const surfaces = [
  {
    id: 'header',
    title: 'Header — city stamp chip',
    spec: '§4.3 city stamp (small size: 6px 14px padding, -1.5° rotation, amber bg, ink text, JetBrains Mono 500 caps 0.18em tracking)',
    before: headerMock(false),
    after: headerMock(true),
    notes: 'Chip slots to the right of the lockup, before the nav. Rotation is the same -1.5° already used elsewhere. Reads `PSA · WARSAW` with interpunct.',
  },
  {
    id: 'footer',
    title: 'Footer — formal entity line',
    spec: '§4.4 formal entity (Professional Subploters Association) shown ABOVE the existing copyright row, as a thin uppercase mono caption',
    before: footerMock(false),
    after: footerMock(true),
    notes: 'Uses JetBrains Mono caps treatment to echo §4.3 city stamp typography. Adds Stowarzyszenie hint (Polish formal entity). Existing "built in public, MIT" stays — it\'s on-brand for venture-studio identity.',
  },
  {
    id: 'about',
    title: '/handbook masthead — formal entity lockup',
    spec: '§4.4 formal entity lockup composing "Professional" + master-lockup + "Association" with Stowarzyszenie/Founded/Warsaw caption above',
    before: `<div style="background:${COLOR_CREAM};padding:48px 32px 32px 32px;border-bottom:1.5px solid ${COLOR_INK};max-width:100%;">
      <div style="max-width:768px;margin:0 auto;">
        <h1 style="font-family:Georgia,serif;font-style:italic;font-weight:900;font-size:32px;color:${COLOR_INK};margin:0;">Handbook</h1>
        <p style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:${COLOR_INK};margin-top:8px;opacity:0.7;">(current state — no formal entity surface)</p>
      </div>
    </div>`,
    after: aboutMastheadMock(),
    notes: 'Lands at the top of /handbook (which is already the footer "about" target, until a dedicated /about page ships). The lockup composition uses the path-drawn master with PL inline + trailing * sitting between two Geist-italic-serif framing words.',
  },
];

const sections = surfaces.map((s) => `
  <div class="card" data-choice="${s.id}" onclick="toggleSelect(this)">
    <div class="card-image" style="background:#fafafa;padding:0;display:flex;flex-direction:column;gap:0;min-height:0;">
      <div style="padding:8px 14px;background:#eee;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#555;">Before — current ${s.id}</div>
      ${s.before}
      <div style="padding:8px 14px;background:#fff8e1;font-family:JetBrains Mono,monospace;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${COLOR_DUST};border-top:1.5px solid ${COLOR_AMBER};border-bottom:1.5px solid ${COLOR_AMBER};">After — proposed ${s.id}</div>
      ${s.after}
    </div>
    <div class="card-body">
      <h3>${s.title}</h3>
      <p style="margin:4px 0;"><strong>Spec:</strong> ${s.spec}</p>
      <p style="margin:4px 0;color:#666;font-size:0.9em;">${s.notes}</p>
    </div>
  </div>`).join('\n');

const html = `<h2>Q3 — Platform wire-in execution mockup</h2>
<p class="subtitle">Proposed execution for all three surfaces. Each card shows BEFORE (current platform) and AFTER (with v1.2 wire-in). Click to flag any surface that needs iteration, or reply in terminal "approve all" / "iterate header" / etc.</p>

<div class="section" style="background:#fef6e6;padding:14px 18px;border-left:3px solid ${COLOR_AMBER};margin-bottom:24px;font-size:13px;">
  <strong>About surface decision:</strong> No <code>/about</code> page exists yet (chat-23 plan deferred it). The footer "about" link already targets <code>/handbook</code>, so this mockup lands the formal-entity masthead at the top of <code>/handbook</code>. When a dedicated <code>/about</code> ships in a later phase, the same masthead component moves over (no rework). Alternative was to defer the masthead entirely — but Q3 = (d) all three picked.
</div>

<div class="cards" style="grid-template-columns:repeat(1,1fr);gap:24px;">
${sections}
</div>

<div class="section" style="margin-top:24px;padding:14px 18px;background:#fff8e1;border-left:3px solid ${COLOR_AMBER};font-size:13px;">
  <strong>My read:</strong> Header chip is the most visible change — a small amber tilted chip next to the lockup. Footer line is subtle (the JetBrains Mono caps line is intentionally quiet). /handbook masthead is the boldest — turns the page into a proper "About" surface with the formal entity composition. If any feels wrong, I'll iterate that surface specifically before writing the spec.
</div>`;

const screenDir = process.argv[2];
if (!screenDir) {
  console.error('Usage: node build-q3-wire-in-board.js <screen_dir>');
  process.exit(1);
}
const outPath = path.join(screenDir, 'q3-wire-in-execution.html');
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
