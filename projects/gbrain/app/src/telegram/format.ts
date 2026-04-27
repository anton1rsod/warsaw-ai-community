const MD_V2_SPECIAL = /([_*\[\]()~`>#+\-=|{}.!])/g;

/**
 * Escapes MarkdownV2 special chars: _ * [ ] ( ) ~ ` > # + - = | { } . !
 * Use for all untrusted content in Telegram replies.
 */
export function escapeMd(text: string): string {
  return text.replace(MD_V2_SPECIAL, "\\$1");
}

export function formatBoldMd(text: string): string {
  return `*${escapeMd(text)}*`;
}

export function formatLinkMd(text: string, url: string): string {
  return `[${escapeMd(text)}](${url})`;
}
