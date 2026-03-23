import { NextResponse } from "next/server";
import { efetchPubmed } from "@/lib/pubmed";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { pmid: string } }) {
  const pmid = params.pmid;
  const id = pmid?.replace(/\D/g, "");
  if (!id) {
    return NextResponse.json({ error: "Invalid PMID" }, { status: 400 });
  }
  try {
    const articles = await efetchPubmed([id]);
    const article = articles[0];
    if (!article) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ article });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PubMed request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
