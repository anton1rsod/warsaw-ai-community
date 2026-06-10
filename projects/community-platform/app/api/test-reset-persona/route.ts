import { NextResponse } from "next/server";
import { isE2EMode, mockPersonaStore } from "@/app/actions/_test-persona-store";

export async function POST(): Promise<Response> {
  if (!isE2EMode()) {
    return new NextResponse("forbidden", { status: 403 });
  }
  mockPersonaStore.reset();
  return NextResponse.json({ ok: true });
}
