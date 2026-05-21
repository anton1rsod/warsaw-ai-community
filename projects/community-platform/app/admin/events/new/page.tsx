import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { getDefaults } from "@/lib/community-defaults";
import { s } from "@/lib/i18n/strings";
import { EventForm } from "@/app/components/EventForm";
import { createEvent } from "@/app/actions/create-event";

export const dynamic = "force-dynamic";

export default async function AdminEventsNewPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.githubHandle) redirect("/login");
  if (!isAdmin(session.githubHandle)) redirect("/home");

  const { events: eventDefaults } = getDefaults();

  return (
    <main className="mx-auto max-w-prose p-6">
      <h1 className="text-2xl font-semibold">{s("event.create.heading")}</h1>
      <p className="mt-2 text-sm text-gray-700">{s("event.create.intro")}</p>
      <EventForm
        action={createEvent}
        defaults={{
          startTime: eventDefaults.defaultStartTime,
          durationMinutes: eventDefaults.defaultDurationMinutes,
          location: eventDefaults.defaultLocation,
          host: session.githubHandle,
          today: new Date().toISOString().slice(0, 10),
        }}
      />
    </main>
  );
}
