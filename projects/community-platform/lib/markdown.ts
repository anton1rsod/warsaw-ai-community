import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

export interface ParsedMarkdown {
  data: Record<string, unknown>;
  body: string;
}

export function parseMarkdown(src: string): ParsedMarkdown {
  const parsed = matter(src);
  return { data: parsed.data, body: parsed.content };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeSanitize, defaultSchema)
  .use(rehypeStringify);

/**
 * Renders markdown to safe-by-construction HTML.
 *
 * The pipeline strips raw HTML, event handler attributes, and any element
 * not in `defaultSchema`. Output is safe to insert via React's HTML insertion
 * APIs without further escaping.
 *
 * NEVER add a parallel rendering path. NEVER skip rehype-sanitize.
 */
export async function renderMarkdownToHtml(src: string): Promise<string> {
  const file = await processor.process(src);
  return String(file);
}

export function truncateToFirstH2(src: string): string {
  const match = src.match(/^## /m);
  if (!match || match.index === undefined) return src;
  return src.slice(0, match.index).replace(/\n+$/, "\n");
}
