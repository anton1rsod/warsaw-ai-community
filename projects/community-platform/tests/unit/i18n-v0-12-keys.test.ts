import { describe, it, expect } from "vitest";
import { strings } from "@/lib/i18n/strings";

/** v0.12 shared-contract keys used by Phase 2 (exact values, normative). */
const CONTRACT: Record<string, string> = {
  "members.detail.expertRow": "Expert",
  "members.detail.practitionerRow": "Practitioner",
  "members.detail.nicheRow": "Niche",
  "members.detail.languagesRow": "Languages",
  "members.detail.bullishRow": "Bullish when",
  "members.detail.skepticalRow": "Skeptical when",
  "members.detail.storySection": "Story",
  "members.detail.expertiseSection": "Expertise",
  "members.detail.postureSection": "Evaluation posture",
  "members.detail.firstQuestionCaption": "the first question I ask",
  "members.detail.askYours": "ask yours →",
  "members.detail.continueReading": "continue reading",
  "members.detail.viewCard": "view card ↗",
  "members.detail.askAboutFmt": "ask {name} about… →",
  "members.detail.copyHandle": "copy @{handle}",
  "members.detail.copiedHandle": "copied",
};

describe("v0.12 Phase 2 i18n key contract (lens.* land in Phase 3, persona.editor.* in Phase 5)", () => {
  for (const [key, value] of Object.entries(CONTRACT)) {
    it(`${key} = "${value}"`, () => {
      expect((strings as Record<string, string>)[key]).toBe(value);
    });
  }
});
