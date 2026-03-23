"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { getSessionId } from "@/lib/session";
import { getLocalSaved, removeLocalSaved, type LocalSaved } from "@/lib/local-saved";
import { withBasePath } from "@/lib/basePath";

type Row = LocalSaved & { id?: string };

export default function SavedPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const sid = getSessionId();
    let server: Row[] = [];
    try {
      const r = await fetch(withBasePath(`/api/saved?sessionId=${encodeURIComponent(sid)}`));
      if (r.ok) {
        const j = (await r.json()) as {
          saved?: {
            id: string;
            pmid: string;
            title: string;
            journal: string | null;
            pubDate: string | null;
            abstract: string | null;
          }[];
        };
        server = (j.saved ?? []).map((s) => ({
          id: s.id,
          pmid: s.pmid,
          title: s.title,
          journal: s.journal ?? "",
          pubDate: s.pubDate,
          abstract: s.abstract ?? "",
        }));
      }
    } catch {}
    const local = getLocalSaved();
    const byPmid = new Map<string, Row>();
    for (const x of local) byPmid.set(x.pmid, x);
    for (const x of server) byPmid.set(x.pmid, x);
    setRows(Array.from(byPmid.values()).sort((a, b) => a.title.localeCompare(b.title)));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (pmid: string) => {
    removeLocalSaved(pmid);
    const sid = getSessionId();
    try {
      await fetch(
        withBasePath(`/api/saved?sessionId=${encodeURIComponent(sid)}&pmid=${encodeURIComponent(pmid)}`),
        { method: "DELETE" },
      );
    } catch {}
    setRows((prev) => prev.filter((r) => r.pmid !== pmid));
  };

  return (
    <div className="min-h-[100dvh] bg-surface-container-low">
      <AppHeader variant="brand" title="Saved" />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        {loading ? <p className="text-secondary">Loading…</p> : null}
        {!loading && rows.length === 0 ? (
          <p className="text-secondary">
            Nothing saved yet. Tap the bookmark on a card to save papers here.
          </p>
        ) : null}
        {rows.map((r) => (
          <div
            key={r.pmid}
            className="flex items-start gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-4"
          >
            <div className="min-w-0 flex-1">
              <Link href={`/article/${r.pmid}`} className="font-headline text-base font-bold text-on-surface hover:text-primary">
                {r.title}
              </Link>
              <p className="mt-1 text-xs text-secondary">
                {r.journal || "—"} · PMID {r.pmid}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(r.pmid)}
              className="shrink-0 rounded-full p-2 text-secondary hover:text-tertiary"
              aria-label="Remove"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
