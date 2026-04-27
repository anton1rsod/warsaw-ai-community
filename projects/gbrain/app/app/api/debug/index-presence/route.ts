import { NextResponse } from "next/server";
import { getIndex } from "@/retrieval/load";

// TIME-BOXED: revert this endpoint after gate verification (Task 14.2).
// Per spec §3.7 — verifies the deploy bundle includes data/_index/.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request): Promise<NextResponse> {
  const auth = request.headers.get("x-debug-auth");
  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = getIndex();
  if ("reason" in result) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 503 });
  }
  return NextResponse.json({
    ok: true,
    built_at: result.manifest.built_at,
    total_chunks: result.manifest.stats.total_chunks,
    embedding_model: result.manifest.embedding_model
  });
}
