import type { JSX } from "react";
import { BrandStar } from "@/app/components/BrandStar";
import { s } from "@/lib/i18n/strings";

/**
 * Formal entity masthead — per `community/brand/brand.md` §4.4 (v1.2).
 *
 * Lands at the top of /handbook (the footer "about" target until a dedicated
 * /about page ships — the same component moves over then).
 *
 * Composition (§4.4 v1.2 plain-text — no embedded master lockup):
 *
 *   FOUNDED 2026 · WARSAW                      (mono caps, dust)
 *   Professional Subploters* Association       (Geist 500, 40px, ink)
 *   The Warsaw chapter of the Professional
 *   Subploters* Association — for founders     (Inter, 14px, ink)
 *   writing their next plot.
 *
 * Both "Subploters*" mentions wear the brand-signature * via <BrandStar /> per
 * §3. Headline is font-geist (real Geist — continuity with the Geist lockup).
 * The caption does NOT mention "Polish Stowarzyszenie" (entity not yet
 * registered — v1.2 lock).
 *
 * Rendered as a <section> (NOT <header>): the global chrome Header is already
 * the page's banner landmark, so a second top-level <header> would trip axe's
 * landmark-no-duplicate-banner rule. The full-width cream band is purely visual.
 */
export function FormalEntityMasthead(): JSX.Element {
  return (
    <section className="bg-cream border-b-[1.5px] border-ink py-12 px-8">
      <div className="max-w-3xl mx-auto">
        <div
          className="font-voice font-medium uppercase text-dust"
          style={{ fontSize: "11px", letterSpacing: "0.20em", marginBottom: "18px" }}
        >
          {s("masthead.foundedFmt")}
        </div>
        <h1
          className="font-geist font-medium text-ink m-0"
          style={{ fontSize: "40px", letterSpacing: "-0.015em", lineHeight: 1.15 }}
        >
          {s("masthead.formalEntityLead")} Subploters<BrandStar /> {s("masthead.formalEntityTail")}
        </h1>
        <p
          className="font-body text-ink mt-5 leading-relaxed"
          style={{ fontSize: "14px", maxWidth: "520px" }}
        >
          {s("masthead.subtitleLead")} Subploters<BrandStar /> {s("masthead.subtitleTail")}
        </p>
      </div>
    </section>
  );
}
