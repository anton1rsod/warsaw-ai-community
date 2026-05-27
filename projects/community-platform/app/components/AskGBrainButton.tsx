import { Pill } from "@/app/components/Pill";
import { s } from "@/lib/i18n/strings";

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
    <Pill href={href} variant="dashed" external>
      {s("projects.detail.askGbrain")}
    </Pill>
  );
}
