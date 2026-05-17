import kudosData from "@/lib/__generated__/kudos.json";

interface KudosEntry {
  total: number;
  by_type: { status: number; contribution: number; meeting: number };
  recent: { giver: string; item_type: string; item_id: string; given_at: string }[];
}
const kudos: Record<string, KudosEntry> = kudosData as Record<string, KudosEntry>;

interface KudosCountProps {
  memberSlug: string;
}

export function KudosCount({ memberSlug }: KudosCountProps): React.JSX.Element {
  const entry = kudos[memberSlug];

  if (!entry || entry.total === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">No thanks yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
        ♥ Thanked {entry.total} times
      </span>
      {entry.recent.length > 0 ? (
        <p className="text-xs text-neutral-500">
          Recent: {entry.recent.map((r) => `@${r.giver}`).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
