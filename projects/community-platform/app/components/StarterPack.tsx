import Link from "next/link";
import { MonoLabel } from "@/app/components/MonoLabel";
import type { ResolvedStarterPackItem } from "@/lib/starter-pack";

export interface StarterPackProps {
  items: (ResolvedStarterPackItem | null)[];
}

/**
 * Server Component (H115 — no client state). Renders curated 3–5
 * artifacts above HomeFeed for signed-in viewers. Anonymous viewers
 * should not see this component (caller responsibility — `app/home/page.tsx`
 * mounts only when `member` is resolved).
 */
export function StarterPack({ items }: StarterPackProps): React.JSX.Element | null {
  const resolved = items.filter((i): i is ResolvedStarterPackItem => i !== null);
  if (resolved.length === 0) return null;

  return (
    <section
      aria-labelledby="starter-pack-heading"
      className="bg-paper border-l-[3px] border-l-ink px-4 py-4"
    >
      <MonoLabel>Start here</MonoLabel>
      <h2
        id="starter-pack-heading"
        className="mt-2 font-display font-semibold text-ink text-[18px] leading-tight tracking-tight"
      >
        Start here
      </h2>
      <ul
        aria-label="Start here"
        className="mt-3 flex flex-col gap-2"
      >
        {resolved.map((item) => (
          <li
            key={`${item.type}:${item.slug}`}
            className="bg-cream-deep border-l-[2px] border-l-ink px-3 py-2"
          >
            <p className="font-voice text-[11px] uppercase tracking-[1px] text-dust">
              {item.kicker}
            </p>
            <Link
              href={item.href}
              className="mt-1 block font-display font-semibold text-ink underline"
            >
              {item.title}
            </Link>
            {item.excerpt ? (
              <p className="mt-1 font-body text-sm text-ink">{item.excerpt}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
