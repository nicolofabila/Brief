import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dbUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "Database not configured. Set DATABASE_URL for PostgreSQL and run `npx prisma migrate deploy`.",
    },
    { status: 503 },
  );
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId?.trim()) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) {
    return dbUnavailableResponse();
  }
  try {
    const rows = await prisma.savedArticle.findMany({
      where: { sessionId: sessionId.trim() },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ saved: rows });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

type SaveBody = {
  sessionId?: string;
  pmid?: string;
  title?: string;
  journal?: string | null;
  pubDate?: string | null;
  abstract?: string | null;
};

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return dbUnavailableResponse();
  }
  let body: SaveBody = {};
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const sessionId = body.sessionId?.trim();
  const pmid = body.pmid?.trim();
  const title = body.title?.trim();
  if (!sessionId || !pmid || !title) {
    return NextResponse.json({ error: "sessionId, pmid, and title required" }, { status: 400 });
  }
  try {
    const row = await prisma.savedArticle.upsert({
      where: { sessionId_pmid: { sessionId, pmid } },
      create: {
        sessionId,
        pmid,
        title,
        journal: body.journal ?? null,
        pubDate: body.pubDate ?? null,
        abstract: body.abstract ?? null,
      },
      update: {
        title,
        journal: body.journal ?? null,
        pubDate: body.pubDate ?? null,
        abstract: body.abstract ?? null,
      },
    });
    return NextResponse.json({ saved: row });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return dbUnavailableResponse();
  }
  const sp = req.nextUrl.searchParams;
  const sessionId = sp.get("sessionId")?.trim();
  const pmid = sp.get("pmid")?.trim();
  if (!sessionId || !pmid) {
    return NextResponse.json({ error: "sessionId and pmid required" }, { status: 400 });
  }
  try {
    await prisma.savedArticle.deleteMany({ where: { sessionId, pmid } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
