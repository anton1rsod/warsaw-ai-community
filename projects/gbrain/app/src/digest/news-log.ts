import type { ParsedMessage } from "../types";

const LOG: ParsedMessage[] = [];
const MAX = 200;

export function recordNews(msg: ParsedMessage): void {
  LOG.push(msg);
  if (LOG.length > MAX) LOG.splice(0, LOG.length - MAX);
}

export function snapshotNews(): ParsedMessage[] {
  return [...LOG];
}

export function clearNews(): void {
  LOG.length = 0;
}
