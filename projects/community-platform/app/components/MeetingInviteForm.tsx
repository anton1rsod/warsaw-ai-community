"use client";
import { useState, type FormEvent } from "react";
import { Pill } from "@/app/components/Pill";

interface MintResult { url?: string; qrDataUrl?: string; jti?: string; error?: string }
interface RevokeResult { ok?: boolean; error?: string }

export interface MeetingInviteFormProps {
  readonly mintAction: (formData: FormData) => Promise<MintResult>;
  readonly revokeAction: (formData: FormData) => Promise<RevokeResult>;
}

export function MeetingInviteForm({ mintAction, revokeAction }: MeetingInviteFormProps): React.JSX.Element {
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revoked, setRevoked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleMint(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setBusy(true); setError(null); setResult(null); setRevoked(false);
    try {
      const r = await mintAction(new FormData(e.currentTarget));
      if (r.url) setResult(r);
      else setError(r.error ?? "Mint failed.");
    } catch { setError("Mint failed. Please try again."); }
    finally { setBusy(false); }
  }

  async function handleRevoke(): Promise<void> {
    if (!result?.jti) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("jti", result.jti);
      const r = await revokeAction(fd);
      if (r.ok) setRevoked(true);
      else setError(r.error ?? "Revoke failed.");
    } catch { setError("Revoke failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mt-10">
      <h2 className="font-display font-semibold text-[22px] leading-tight text-ink">Meeting invite</h2>
      <p className="mt-1 font-voice text-[11px] text-dust">
        One multi-use QR for a room. Project it on screen — everyone scans the same code. Expires after the window you set.
      </p>
      <form data-testid="meeting-mint-form" onSubmit={handleMint} className="mt-4 bg-paper border-l-[3px] border-l-ink px-4 py-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="expiry_hours" className="block font-voice text-[11px] uppercase tracking-[1px] text-dust">Expires in (hours)</label>
            <input id="expiry_hours" name="expiry_hours" type="number" min="0.5" max="24" step="0.5" defaultValue="4"
              className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
          <div className="flex-1">
            <label htmlFor="max_uses" className="block font-voice text-[11px] uppercase tracking-[1px] text-dust">Max uses</label>
            <input id="max_uses" name="max_uses" type="number" min="1" max="500" step="1" defaultValue="50"
              className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent-500" />
          </div>
        </div>
        <Pill type="submit" variant="solid" disabled={busy}>{busy ? "Working…" : "Mint meeting QR"}</Pill>
        {error && <p className="font-voice text-[11px] text-alert">{error}</p>}
      </form>

      {result?.url && (
        <div className="mt-4">
          <label className="block font-voice text-[11px] uppercase tracking-[1px] text-dust">Meeting URL</label>
          <input type="text" readOnly value={result.url}
            className="mt-1 block w-full bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-voice text-ink text-sm" />
          {result.qrDataUrl && (
            <img src={result.qrDataUrl} alt="Meeting invite QR code" className="mt-4 w-full max-w-[320px] h-auto" />
          )}
          <p className="mt-2 font-voice text-[11px] text-dust">Project on screen. Don&apos;t shorten the URL (camera preview shows the real domain).</p>
          <div className="mt-3">
            {revoked
              ? <p className="font-voice text-[11px] text-dust">Revoked. This invite can no longer be redeemed.</p>
              : <Pill type="button" variant="danger" onClick={handleRevoke} disabled={busy}>Revoke this invite</Pill>}
          </div>
        </div>
      )}
    </div>
  );
}
