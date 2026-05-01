/**
 * Centralized HTML insertion component.
 *
 * The `html` prop MUST come from `lib/markdown.ts::renderMarkdownToHtml`,
 * which runs through `rehype-sanitize`. NEVER pass user-supplied HTML
 * directly to this component. NEVER add a parallel rendering path that
 * bypasses the sanitization pipeline.
 *
 * This component exists so reviewers can audit HTML insertion in one place.
 */
export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
