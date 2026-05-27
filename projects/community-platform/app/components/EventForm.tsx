"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CreateEventResult } from "@/app/actions/create-event";
import { deriveEventSlug } from "@/lib/event-author";
import { SafeHtml } from "@/app/components/SafeHtml";
import { Pill } from "@/app/components/Pill";
import { s } from "@/lib/i18n/strings";

export interface EventFormDefaults {
  readonly startTime: string;
  readonly durationMinutes: number;
  readonly location: string;
  readonly host: string;
  readonly today: string;
}

export interface EventFormProps {
  readonly action: (formData: FormData) => Promise<CreateEventResult>;
  readonly defaults: EventFormDefaults;
}

const ERROR_LABELS: Record<
  Exclude<CreateEventResult, { ok: true }>["error"],
  string
> = {
  not_authorized: s("event.create.error.notAuthorized"),
  invalid_input: s("event.create.error.invalidInput"),
  invalid_slug: s("event.create.error.invalidSlug"),
  slug_exists: s("event.create.error.slugExists"),
  internal_error: s("event.create.error.internalError"),
};

const DEFAULT_BODY =
  "Description, agenda, link to pitch / outcomes if applicable.\n\n## Agenda\n\n1. Item one.\n2. Item two.\n";

export function EventForm({
  action,
  defaults,
}: EventFormProps): React.JSX.Element {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaults.today);
  const [slugOverride, setSlugOverride] = useState("");
  const [body, setBody] = useState(DEFAULT_BODY);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const derivedSlug = title ? deriveEventSlug(date, title) : "";

  async function togglePreview(): Promise<void> {
    if (previewHtml !== null) {
      setPreviewHtml(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/preview-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        setPreviewHtml(
          `<p class="text-alert">${s("event.create.preview.failed")}</p>`,
        );
        return;
      }
      const data: { html?: string } = await res.json();
      setPreviewHtml(data.html ?? "");
    } catch {
      setPreviewHtml('<p class="text-alert">Preview failed.</p>');
    } finally {
      setPreviewLoading(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await action(fd);
      if (result.ok) {
        // v0.5.1 item 4 deferred: EventSlugSchema regex `[a-z0-9-]+` makes
        // URL-unsafe chars structurally impossible, so encodeURIComponent
        // here would be dead defense. If the regex relaxes, revisit here.
        router.push(`/events/${result.slug}`);
      } else {
        setError(ERROR_LABELS[result.error] ?? s("event.create.error.unknown"));
      }
    } catch {
      setError(s("event.create.error.requestFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 bg-paper border-l-[3px] border-l-ink px-4 py-4 space-y-4">
      <Field id="title" label={s("event.create.field.title")} required>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </Field>

      <Field id="date" label={s("event.create.field.date")} required>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="startTime" label={s("event.create.field.startTime")}>
          <input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={defaults.startTime}
            className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
          />
        </Field>
        <Field id="durationMinutes" label={s("event.create.field.duration")}>
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            min={1}
            max={600}
            defaultValue={defaults.durationMinutes}
            className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
          />
        </Field>
      </div>

      <Field id="location" label={s("event.create.field.location")}>
        <input
          id="location"
          name="location"
          type="text"
          maxLength={200}
          defaultValue={defaults.location}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </Field>

      <Field id="host" label={s("event.create.field.host")}>
        <input
          id="host"
          name="host"
          type="text"
          maxLength={80}
          defaultValue={defaults.host}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </Field>

      <Field id="url" label={s("event.create.field.url")}>
        <input
          id="url"
          name="url"
          type="url"
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
      </Field>

      <Field id="slug" label={s("event.create.field.slug")}>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder={derivedSlug}
          value={slugOverride}
          onChange={(e) => setSlugOverride(e.target.value)}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm font-voice focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
        />
        <p className="mt-1 font-voice text-[11px] text-dust">{s("event.create.slug.hint")}</p>
      </Field>

      <Field id="body" label={s("event.create.field.body")}>
        <textarea
          id="body"
          name="body"
          rows={12}
          maxLength={50_000}
          className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm font-voice focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Pill
          type="button"
          variant="dashed"
          onClick={togglePreview}
          disabled={previewLoading}
        >
          {previewLoading
            ? s("event.create.preview.loading")
            : previewHtml !== null
              ? s("event.create.preview.hide")
              : s("event.create.preview.show")}
        </Pill>
      </div>

      {previewHtml !== null ? (
        <div data-testid="event-body-preview">
          <SafeHtml
            html={previewHtml}
            className="bg-cream-deep border-l-[2px] border-l-ink p-3 prose prose-sm max-w-none"
          />
        </div>
      ) : null}

      <Pill type="submit" variant="solid" disabled={submitting}>
        {submitting
          ? s("event.create.submit.pending")
          : s("event.create.submit.idle")}
      </Pill>

      {error ? (
        <p role="alert" className="font-voice text-[11px] text-alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-voice text-[11px] uppercase tracking-[1px] text-dust"
      >
        {label}
        {required ? <span className="ml-1 text-alert">*</span> : null}
      </label>
      {children}
    </div>
  );
}
