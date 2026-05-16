import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { renderMarkdownToHtml } from "@/lib/markdown";

const PreviewSchema = z.object({
  body: z.string().max(65_536), // matches SaveProfileSchema H18
});

export async function POST(req: Request): Promise<Response> {
  const session = await auth();
  if (!session?.githubHandle) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  const parsed = PreviewSchema.safeParse(payload);
  if (!parsed.success) {
    return new NextResponse("invalid body", { status: 400 });
  }

  const html = await renderMarkdownToHtml(parsed.data.body);
  return NextResponse.json({ html });
}
