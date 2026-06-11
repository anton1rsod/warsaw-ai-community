import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { findMemberBySlug } from "@/lib/content-snapshot";
import { buildOgCardModel, type OgCardModel } from "@/lib/og-card";

/**
 * v0.12 Phase 4 — shareable member card (spec §4.4).
 *
 * Next.js metadata file convention: Next auto-injects og:image on
 * /members/[slug] (no generateMetadata/metadataBase wiring needed) and
 * the same URL is the embeddable card — GitHub camo just fetches it.
 *
 * H155: public + unauthenticated. No session or request-header reads
 * (stays cacheable + viewer-blind); the H147 persona_visible gate + H146
 * erasure state are re-applied via buildOgCardModel — hidden/absent
 * persona ⇒ name-only fallback. Renders one_line_bio + expert tag
 * labels only, never persona body text.
 *
 * Caching: ImageResponse defaults to immutable max-age CDN caching —
 * correct here: persona attach/re-sync/erasure land as commits →
 * redeploy busts the CDN cache (third-party scraper caches accepted).
 *
 * Node default — readFile font loading needs the Node environment,
 * not the edge environment.
 */

export const alt = "Member card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens, inlined: satori sees no Tailwind/CSS vars (spec §3 values).
const CREAM = "#fef6e6";
const INK = "#1a1a2e";
const INK_MUTED = "#6e6757";
const DUST = "#886c37";
const AMBER = "#f59e0b";

// Unknown slug ⇒ wordmark-only card. Never echo the requested path into
// the image (spoof-resistant: no attacker-chosen text under our wordmark).
const UNKNOWN_MEMBER_CARD: OgCardModel = {
  name: "Subploters",
  bio: null,
  expertTags: [],
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ImageResponse> {
  const { slug } = await params;

  // satori accepts ttf/otf/woff only (NOT woff2) — static TTFs vendored at
  // assets/og/ (Task 4.1). Literal join() keeps the paths statically
  // traceable; outputFileTracingIncludes backstops it (Task 4.4).
  const [geistSemiBold, geistMono] = await Promise.all([
    readFile(join(process.cwd(), "assets/og/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/og/GeistMono-Regular.ttf")),
  ]);

  const member = findMemberBySlug(slug);
  const card = member ? buildOgCardModel(member) : UNKNOWN_MEMBER_CARD;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CREAM,
          padding: "72px 80px",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              color: INK,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {card.name}
          </div>
          {card.bio ? (
            <div
              style={{
                marginTop: 28,
                fontSize: 28,
                fontWeight: 600,
                color: INK_MUTED,
                lineHeight: 1.35,
                maxWidth: 920,
              }}
            >
              {card.bio}
            </div>
          ) : null}
          {card.expertTags.length > 0 ? (
            <div
              style={{
                marginTop: 36,
                display: "flex",
                fontFamily: "GeistMono",
                fontSize: 20,
                color: DUST,
                letterSpacing: "0.06em",
              }}
            >
              {card.expertTags.join("  ·  ").toUpperCase()}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: 26,
            fontWeight: 600,
            color: INK,
            letterSpacing: "-0.01em",
          }}
        >
          <span>subploters</span>
          <span style={{ color: AMBER }}>*</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "GeistMono", data: geistMono, weight: 400, style: "normal" },
      ],
    },
  );
}
