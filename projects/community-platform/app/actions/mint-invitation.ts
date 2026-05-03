"use server";

import { z } from "zod";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { isAdmin } from "@/lib/content-snapshot";
import { mintToken, type InvitePayload } from "@/lib/invitations";

// `"use server"` modules can only export async functions — keep types inline.
interface MintResult {
  url?: string;
  error?: string;
}

const MintInputSchema = z.object({
  hint_telegram: z
    .string()
    .regex(/^@[a-zA-Z0-9_]{5,32}$/)
    .optional(),
  hint_display_name: z.string().min(1).max(80).optional(),
});

const emptyToUndef = (v: unknown): unknown => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "string" && v.trim() === "") return undefined;
  return v;
};

export async function mintInvitation(
  formData: FormData,
): Promise<MintResult> {
  const session = await auth();
  if (!session?.githubHandle) return { error: "Not authenticated." };
  if (!isAdmin(session.githubHandle))
    return { error: "Not authorized — admin role required." };

  const raw = {
    hint_telegram: emptyToUndef(formData.get("hint_telegram")),
    hint_display_name: emptyToUndef(formData.get("hint_display_name")),
  };
  const parsed = MintInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid form input." };
  }

  const payload: InvitePayload = {
    jti: randomUUID(),
    iss: session.githubHandle,
    exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    ...(parsed.data.hint_telegram
      ? { hint_telegram: parsed.data.hint_telegram }
      : {}),
    ...(parsed.data.hint_display_name
      ? { hint_display_name: parsed.data.hint_display_name }
      : {}),
  };

  const token = mintToken(payload, env.INVITE_SECRET);
  const url = `${env.NEXTAUTH_URL.replace(/\/$/, "")}/onboard?token=${token}`;
  return { url };
}
