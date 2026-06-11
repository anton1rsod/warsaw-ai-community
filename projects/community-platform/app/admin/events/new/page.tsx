import { requireAdmin } from "@/lib/require-admin";
import { getDefaults } from "@/lib/community-defaults";
import { s } from "@/lib/i18n/strings";
import { EventForm } from "@/app/components/EventForm";
import { createEvent } from "@/app/actions/create-event";
import { MonoLabel } from "@/app/components/MonoLabel";

export const dynamic = "force-dynamic";

export default async function AdminEventsNewPage(): Promise<React.JSX.Element> {
  const session = await requireAdmin("/admin/events/new");

  const { events: eventDefaults } = getDefaults();

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>Admin</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("event.create.heading")}
      </h1>
      <p className="mt-2 font-voice text-[11px] text-dust">
        {s("event.create.intro")}
      </p>
      <EventForm
        action={createEvent}
        defaults={{
          startTime: eventDefaults.defaultStartTime,
          durationMinutes: eventDefaults.defaultDurationMinutes,
          location: eventDefaults.defaultLocation,
          host: session.githubHandle ?? "",
          today: new Date().toISOString().slice(0, 10),
        }}
      />
    </main>
  );
}
