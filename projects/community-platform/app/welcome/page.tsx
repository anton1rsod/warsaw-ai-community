import { env } from "@/lib/env";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Pill } from "@/app/components/Pill";

export default function WelcomePage(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto max-w-md px-6 py-10">
      <MonoLabel>// welcome</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        You&apos;re in.
      </h1>
      <p className="mt-2 font-voice text-[11px] text-dust">
        Welcome to {env.COMMUNITY_NAME}. Your membership is being finalized —
        member-only areas unlock in about a minute. Meanwhile, explore:
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Pill variant="solid" href="/home">Home</Pill>
        <Pill variant="dashed" href="/events">Events</Pill>
        <Pill variant="dashed" href="/calendar">Calendar</Pill>
        <Pill variant="dashed" href="/handbook">Handbook</Pill>
      </div>
    </main>
  );
}
