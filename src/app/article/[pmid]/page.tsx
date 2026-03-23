"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { FeedPaper } from "@/types/paper";
import { getSessionId } from "@/lib/session";
import { addLocalSaved, getLocalSaved, removeLocalSaved } from "@/lib/local-saved";
import { withBasePath } from "@/lib/basePath";

type ArticlePayload = Pick<
  FeedPaper,
  "pmid" | "title" | "abstract" | "journal" | "pubDate" | "authorsLine" | "doi" | "pubYear"
>;

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const pmid = String(params.pmid ?? "");
  const [article, setArticle] = useState<ArticlePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!pmid) return;
    setError(null);
    try {
      const r = await fetch(withBasePath(`/api/article/${encodeURIComponent(pmid)}`));
      const j = await r.json();
      if (!r.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not load article");
        return;
      }
      setArticle(j.article as ArticlePayload);
    } catch {
      setError("Network error");
    }
  }, [pmid]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!pmid) return;
    const local = getLocalSaved().some((x) => x.pmid === pmid);
    setSaved(local);
    const sid = getSessionId();
    void (async () => {
      try {
        const r = await fetch(withBasePath(`/api/saved?sessionId=${encodeURIComponent(sid)}`));
        if (r.ok) {
          const j = (await r.json()) as { saved?: { pmid: string }[] };
          if ((j.saved ?? []).some((x) => x.pmid === pmid)) setSaved(true);
        }
      } catch {}
    })();
  }, [pmid]);

  const toggleSave = async () => {
    if (!article) return;
    const sid = getSessionId();
    const payload = {
      pmid: article.pmid,
      title: article.title,
      abstract: article.abstract,
      journal: article.journal,
      pubDate: article.pubDate,
    };
    if (saved) {
      removeLocalSaved(article.pmid);
      setSaved(false);
      try {
        await fetch(
          withBasePath(
            `/api/saved?sessionId=${encodeURIComponent(sid)}&pmid=${encodeURIComponent(article.pmid)}`,
          ),
          { method: "DELETE" },
        );
      } catch {}
      return;
    }

    addLocalSaved(payload);
    setSaved(true);
    try {
      await fetch(withBasePath("/api/saved"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          pmid: article.pmid,
          title: article.title,
          journal: article.journal,
          pubDate: article.pubDate,
          abstract: article.abstract,
        }),
      });
    } catch {}
  };

  return (
    <div className="min-h-[100dvh] bg-surface-container-low pb-36">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-outline-variant/20 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-stone-100 active:scale-95"
            aria-label="Back"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <Link href="/feed" className="font-headline text-lg font-bold text-primary">
            Brief
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {error ? (
          <p className="rounded-xl bg-error-container/40 p-4 text-sm text-on-error-container">{error}</p>
        ) : null}
        {!article && !error ? <p className="text-secondary">Loading…</p> : null}
        {article ? (
          <>
            <section className="mb-8">
              {article.doi ? (
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  DOI: {article.doi}
                </p>
              ) : null}
              <h1 className="mb-4 font-headline text-2xl font-bold leading-tight text-on-surface">
                {article.title}
              </h1>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 font-medium text-primary">
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                  <span>{article.journal || "Journal not listed"}</span>
                </div>
                {article.authorsLine ? (
                  <p className="text-secondary">
                    <span className="font-semibold text-on-surface">Authors:</span> {article.authorsLine}
                  </p>
                ) : null}
                <p className="text-xs text-secondary">
                  Published: {article.pubDate ?? article.pubYear ?? "—"} · PubMed PMID {article.pmid}
                </p>
              </div>
            </section>

            <section className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-6 w-1 rounded-full bg-tertiary" />
                <h2 className="font-headline text-xl font-semibold">Abstract</h2>
              </div>
              <div className="space-y-4 text-base leading-relaxed text-on-surface">
                {article.abstract ? (
                  article.abstract.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)
                ) : (
                  <p className="text-secondary">No abstract available for this record.</p>
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>

      {article ? (
        <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-stone-100 bg-white/95 px-4 py-4 backdrop-blur-lg">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-tertiary py-3.5 font-headline font-bold text-on-tertiary shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">article</span>
              Open in PubMed
            </a>
            <button
              type="button"
              onClick={toggleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-100 py-3.5 font-headline font-bold text-on-surface-variant active:scale-[0.98]"
            >
              <span
                className={`material-symbols-outlined${saved ? " material-symbols-fill" : ""}`}
              >
                bookmark
              </span>
              {saved ? "Saved" : "Save to Brief"}
            </button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
