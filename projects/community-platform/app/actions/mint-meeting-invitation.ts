"use server";

import { z } from "zod";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { isAdmin } from "@/lib/content-snapshot";
import {
  mintToken, clampMeetingExpirySeconds, MEETING_MAX_USES_DEFAULT, MEETING_MAX_USES_CAP,
  type InvitePayload,
} from "@/lib/invitations";
import { renderQrDataUrl } from "@/lib/qr";

// `"use server"` modules can only export async functions — keep types inline.
interface MeetingMintResult {
  url?: string;
  qrDataUrl?: string;
  jti?: string;
  error?: string;
}

const MeetingMintInputSchema = z.object({
  expiry_hours: z.coerce.number().positive().optional(),
  max_uses: z.coerce.number().int().positive().max(MEETING_MAX_USES_CAP).optional(),
});

export async function mintMeetingInvitation(formData: FormData): Promise<MeetingMintResult> {
  const session = await auth();
  // H134: re-verify admin server-side (the proxy is not the boundary — §5.8).
  if (!session?.githubHandle || !isAdmin(session.githubHandle)) {
    return { error: "Not authorized." };
  }

  const parsed = MeetingMintInputSchema.safeParse({
    expiry_hours: formData.get("expiry_hours") ?? undefined,
    max_uses: formData.get("max_uses") ?? undefined,
  });
  if (!parsed.success) return { error: "Invalid form input." };

  const expirySeconds = clampMeetingExpirySeconds(
    parsed.data.expiry_hours !== undefined ? parsed.data.expiry_hours * 3600 : undefined,
  );
  const jti = randomUUID();
  const payload: InvitePayload = {
    jti,
    iss: session.githubHandle,
    exp: Math.floor(Date.now() / 1000) + expirySeconds,
    kind: "meeting",
    max_uses: parsed.data.max_uses ?? MEETING_MAX_USES_DEFAULT,
  };
  const token = mintToken(payload, env.INVITE_SECRET);
  const url = `${env.NEXTAUTH_URL.replace(/\/$/, "")}/onboard?token=${token}`;
  const qrDataUrl = await renderQrDataUrl(url);
  return { url, qrDataUrl, jti };
}
