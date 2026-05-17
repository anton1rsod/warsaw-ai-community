import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Route Handler is dynamic so the runtime always reads the latest deployed artifact.
// Cache headers are honored by Vercel CDN regardless.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const path = join(process.cwd(), "lib", "__generated__", "calendar.ics");
  const ics = await readFile(path, "utf-8");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
