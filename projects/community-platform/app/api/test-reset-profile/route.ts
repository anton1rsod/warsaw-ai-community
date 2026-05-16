import { NextResponse } from "next/server";
import { mockProfileStore } from "@/app/actions/_test-profile-store";

function isE2EMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_E2E_MODE === "1" &&
    process.env.NODE_ENV !== "production"
  );
}

interface SeedBody {
  seed?: { slug: string; body: string }[];
}

export async function POST(req: Request): Promise<Response> {
  if (!isE2EMode()) {
    return new NextResponse("forbidden", { status: 403 });
  }
  mockProfileStore.reset();

  // Optional: seed with initial profiles via JSON body
  try {
    const json = (await req.json()) as SeedBody;
    if (Array.isArray(json.seed)) {
      for (const entry of json.seed) {
        mockProfileStore.seed(entry.slug, entry.body);
      }
    }
  } catch {
    // No body / not JSON — that's fine; just reset.
  }

  return NextResponse.json({ ok: true });
}
