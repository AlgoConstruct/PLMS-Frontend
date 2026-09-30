import { NextResponse } from "next/server";
import { publicApi } from "@pathwayiq/api/public";

/** Redirects to a short-lived signed download for a file of an accepted deliverable. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string; fileId: string }> }) {
  const { slug, fileId } = await params;
  const result = await publicApi<{ url: string }>("platform",
    `/api/v1/showcase/${encodeURIComponent(slug)}/files/${encodeURIComponent(fileId)}`);
  if (!result.ok) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(result.data.url);
}
