/**
 * v0.10.0 Phase D — Telegram echo (opt-in).
 *
 * Wraps the Telegram Bot API `sendMessage` call. Fire-and-forget per
 * H119: every failure returns `{ ok: false, reason }` instead of
 * throwing; callers must NOT block the status write on this call.
 */

export interface TelegramEchoInput {
  handle: string;
  week: string;
  body: string;
  url: string;
}

export interface TelegramConfig {
  botToken: string | undefined;
  chatId: string | undefined;
  topicId: string | undefined;
}

export type TelegramNotifyResult =
  | { ok: true }
  | { ok: false; reason: string };

const MAX_BODY_LEN = 200;

/**
 * Composes the human-readable echo body sent to the Telegram chat.
 * Truncates the body to MAX_BODY_LEN with an ellipsis; appends the
 * canonical platform URL so Telegram-only readers can follow the
 * conversation on-platform.
 */
export function composeTelegramMessage(input: TelegramEchoInput): string {
  const truncated =
    input.body.length > MAX_BODY_LEN
      ? `${input.body.slice(0, MAX_BODY_LEN)}…`
      : input.body;
  return `📝 @${input.handle} posted /this-week (${input.week}):\n"${truncated}"\n${input.url}`;
}

/**
 * H119 — fire-and-forget: this function NEVER throws. Caller awaits
 * the result but a non-ok return is benign (status write already
 * succeeded). Caller should NOT log a non-ok result as an error in
 * production paths.
 */
export async function notifyTelegram(
  input: TelegramEchoInput & TelegramConfig,
): Promise<TelegramNotifyResult> {
  if (!input.botToken || !input.chatId) {
    return { ok: false, reason: "unconfigured" };
  }

  const url = `https://api.telegram.org/bot${input.botToken}/sendMessage`;
  const text = composeTelegramMessage(input);

  interface Payload {
    chat_id: string;
    text: string;
    disable_web_page_preview: boolean;
    message_thread_id?: number;
  }
  const payload: Payload = {
    chat_id: input.chatId,
    text,
    disable_web_page_preview: true,
  };
  if (input.topicId) {
    const parsed = Number.parseInt(input.topicId, 10);
    if (!Number.isNaN(parsed)) payload.message_thread_id = parsed;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { ok: false, reason: `http ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}
