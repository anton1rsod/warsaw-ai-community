/**
 * v0.4 Phase A.3.1 — regen PWA icons + favicon as solid #f59e0b placeholders.
 *
 * The textured "WA" overlay is deferred to v0.4.x (requires ImageMagick
 * or sharp; sandbox can't install either). Same posture as v0.3's
 * #2563eb placeholders — color updated to v0.4's PostHog amber per Q4.7.
 *
 * Run via: pnpm tsx scripts/regen-pwa-icons.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const AMBER = { r: 0xf5, g: 0x9e, b: 0x0b, a: 0xff };

function makeSolidPng(size: number): Buffer {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) * 4;
      png.data[idx] = AMBER.r;
      png.data[idx + 1] = AMBER.g;
      png.data[idx + 2] = AMBER.b;
      png.data[idx + 3] = AMBER.a;
    }
  }
  return PNG.sync.write(png);
}

/**
 * Minimal .ico writer — a 32x32 PNG wrapped in ICONDIR+ICONDIRENTRY.
 * .ico format header: ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) + PNG data.
 */
function makeIco(): Buffer {
  const png32 = makeSolidPng(32);

  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0); // reserved
  iconDir.writeUInt16LE(1, 2); // type: 1 (icon)
  iconDir.writeUInt16LE(1, 4); // count: 1 image

  const iconEntry = Buffer.alloc(16);
  iconEntry.writeUInt8(32, 0); // width
  iconEntry.writeUInt8(32, 1); // height
  iconEntry.writeUInt8(0, 2); // color palette
  iconEntry.writeUInt8(0, 3); // reserved
  iconEntry.writeUInt16LE(1, 4); // color planes
  iconEntry.writeUInt16LE(32, 6); // bits per pixel
  iconEntry.writeUInt32LE(png32.length, 8); // image size
  iconEntry.writeUInt32LE(22, 12); // image offset (6 + 16)

  return Buffer.concat([iconDir, iconEntry, png32]);
}

const PUBLIC_DIR = join(process.cwd(), "public");
const ICONS_DIR = join(PUBLIC_DIR, "icons");

writeFileSync(join(ICONS_DIR, "icon-192.png"), makeSolidPng(192));
writeFileSync(join(ICONS_DIR, "icon-512.png"), makeSolidPng(512));
writeFileSync(join(ICONS_DIR, "apple-touch-icon.png"), makeSolidPng(180));
writeFileSync(join(PUBLIC_DIR, "favicon.ico"), makeIco());

console.log("Regenerated PWA icons + favicon (solid #f59e0b placeholders)");
