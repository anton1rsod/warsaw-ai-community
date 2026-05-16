interface AskGBrainButtonProps {
  projectSlug: string;
  baseUrl: string | null;
}

export function AskGBrainButton({
  projectSlug,
  baseUrl,
}: AskGBrainButtonProps): React.JSX.Element | null {
  if (!baseUrl) return null;
  const href = `${baseUrl}/?project=${encodeURIComponent(projectSlug)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
    >
      Ask GBrain about this project →
    </a>
  );
}
