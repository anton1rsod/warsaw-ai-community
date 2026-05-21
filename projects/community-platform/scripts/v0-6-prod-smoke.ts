// chat-35 v0.6.0 production smoke — drive 4 anon surfaces, capture screenshots,
// assert key visual markers from spec §16.4. Run with:
//   pnpm exec tsx scripts/v0-6-prod-smoke.ts
// Uses a fresh chromium.launch() (no user-data-dir) to avoid colliding with
// any MCP browser session. Output: 4 screenshots in ./prod-smoke-v0-6/ + a
// per-surface marker check printed to stdout.

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = "https://warsaw-ai-community-platform.vercel.app";
const OUT = "./prod-smoke-v0-6";

const surfaces = [
  {
    path: "/",
    name: "01-root-anon",
    markers: [
      { selector: 'text="warsaw.ai"', label: "Header lowercase wordmark" },
      { selector: 'text=/Warsaw AI/i', label: "Hero tagline lead" },
      { selector: 'text=/public\\./', label: "AmberTag highlight" },
      { selector: 'text=/sign in with github/i', label: "Sign-in Pill CTA" },
      { selector: 'text=/join telegram/i', label: "Telegram Pill CTA" },
    ],
  },
  {
    path: "/events",
    name: "02-events-anon",
    markers: [
      { selector: 'h1:has-text("Events.")', label: "Events. Fraunces title" },
      { selector: 'text=/subscribe \\(ICS\\)/i', label: "Subscribe ICS Pill" },
      { selector: 'text=/AI Community/i', label: "Meetup #4 event title" },
    ],
  },
  {
    path: "/events/2026-05-21-meetup-4",
    name: "03-meetup-detail-anon",
    markers: [
      { selector: 'text=/meetup № 04/i', label: "MonoLabel lead" },
      { selector: 'text=/tonight\\./i', label: "AmberTag tonight. suffix" },
      { selector: 'text=/Grzybowska/i', label: "Location meta" },
      { selector: 'text=/Sign in to RSVP/i', label: "Anon RSVP CTA" },
    ],
  },
  {
    path: "/home",
    name: "04-home-anon-redirects",
    markers: [
      { selector: 'text=/Warsaw AI/i', label: "Anon /home redirects to / per ADR-0014" },
    ],
  },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  const results = [];

  for (const surface of surfaces) {
    console.log(`\n=== ${surface.path} ===`);
    const url = BASE + surface.path;
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    const status = response?.status();
    const finalUrl = page.url();
    console.log(`  status: ${status}  → ${finalUrl}`);

    const screenshotPath = `${OUT}/${surface.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  screenshot: ${screenshotPath}`);

    const markerResults = [];
    for (const m of surface.markers) {
      const count = await page.locator(m.selector).count();
      const hit = count > 0;
      console.log(`  [${hit ? "✓" : "✗"}] ${m.label}  (${count} matches)`);
      markerResults.push({ ...m, hit, count });
    }

    results.push({ surface, status, finalUrl, markerResults });
  }

  await browser.close();

  console.log("\n=== SUMMARY ===");
  for (const r of results) {
    const allHit = r.markerResults.every((m) => m.hit);
    const sign = allHit ? "✓" : "✗";
    const passed = r.markerResults.filter((m) => m.hit).length;
    const total = r.markerResults.length;
    console.log(`${sign} ${r.surface.path}  →  ${passed}/${total} markers  (status ${r.status}, final ${r.finalUrl})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
