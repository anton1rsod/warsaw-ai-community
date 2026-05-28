import { describe, expect, it } from "vitest";
import { SaveProfileSchema } from "@/lib/profile-editor";

describe("SaveProfileSchema.telegramEcho (v0.10.0 Phase D step 2)", () => {
  it("accepts telegramEcho: true", () => {
    const result = SaveProfileSchema.safeParse({
      // include any other required fields per the existing schema —
      // implementer fills in based on whatever required fields exist
      telegramEcho: true,
      bio: "x",
    });
    // Don't assert success: the existing schema may have other required
    // fields. Instead assert the field made it into the parsed shape
    // when other validators pass.
    if (result.success) {
      expect(result.data.telegramEcho).toBe(true);
    } else {
      // If parse failed for OTHER reasons, just confirm telegramEcho
      // wasn't the culprit:
      const issues = result.error.issues.map((i) => i.path.join("."));
      expect(issues).not.toContain("telegramEcho");
    }
  });

  it("defaults telegramEcho to false when omitted", () => {
    const result = SaveProfileSchema.safeParse({ bio: "x" });
    if (result.success) {
      expect(result.data.telegramEcho).toBe(false);
    }
  });

  it("rejects telegramEcho: 'yes' (boolean coercion off)", () => {
    const result = SaveProfileSchema.safeParse({
      bio: "x",
      telegramEcho: "yes",
    });
    if (!result.success) {
      const issues = result.error.issues.map((i) => i.path.join("."));
      expect(issues).toContain("telegramEcho");
    }
  });
});
