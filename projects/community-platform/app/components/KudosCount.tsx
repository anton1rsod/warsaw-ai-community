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
      <p className="font-voice text-[11px] text-dust">No thanks yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      <span className="min-h-[24px] inline-flex items-center px-[11px] py-[4px] font-voice font-bold text-[10px] bg-accent-50 text-accent-700 border-[1.5px] border-solid border-accent-700">
        ♥ Thanked {entry.total} times
      </span>
      {entry.recent.length > 0 ? (
        <p className="font-voice text-[10px] text-dust">
          Recent: {entry.recent.map((r) => `@${r.giver}`).join(", ")}
        </p>
      ) : null}
    </div>
  );
}
