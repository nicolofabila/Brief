"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { STORAGE_INTERESTS, type StoredInterests } from "@/lib/brief-storage";
import { getSessionId } from "@/lib/session";
import { addLocalSaved, getLocalSaved, removeLocalSaved, type LocalSaved } from "@/lib/local-saved";
import type { FeedPaper } from "@/types/paper";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/basePath";

type Filter = "all" | "new7" | "month30" | "trials" | "reviews";

export default function FeedPage() {
  const router = useRouter();
  const [interests, setInterests] = useState<StoredInterests | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [papers, setPapers] = useState<FeedPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedPmids, setSavedPmids] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_INTERESTS);
      if (!raw) {
        router.replace("/onboarding");
        return;
      }
      const parsed = JSON.parse(raw) as StoredInterests & { topicIds?: string[] };
      const keywords = parsed.keywords ?? [];
      if (keywords.length === 0) {
        router.replace("/onboarding");
        return;
      }
      setInterests({ keywords });
    } catch {
      router.replace("/onboarding");
    }
  }, [router]);

  const trialsOnly = filter === "trials";
  const reviewsOnly = filter === "reviews";
  const effectiveDays: 7 | 30 = filter === "new7" ? 7 : 30;

  const loadSavedIds = useCallback(async () => {
    const local = getLocalSaved().map((x) => x.pmid);
    const sid = getSessionId();
    let api: string[] = [];
    try {
      const r = await fetch(withBasePath(`/api/saved?sessionId=${encodeURIComponent(sid)}`));
      if (r.ok) {
        const j = (await r.json()) as { saved?: { pmid: string }[] };
        api = (j.saved ?? []).map((x) => x.pmid);
      }
    } catch {}
    setSavedPmids(new Set([...local, ...api]));
  }, []);

  useEffect(() => {
    void loadSavedIds();
  }, [loadSavedIds]);

  const fetchFeed = useCallback(async () => {
    if (!interests) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(withBasePath("/api/feed"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: interests.keywords,
          days: effectiveDays,
          trialsOnly,
          reviewsOnly,
        }),
      });
      const j = await r.json();
      if (!r.ok) {
        setError(typeof j.error === "string" ? j.error : "Could not load feed");
        setPapers([]);
        return;
      }
      setPapers((j.papers ?? []) as FeedPaper[]);
    } catch {
      setError("Network error");
      setPapers([]);
    } finally {
      setLoading(false);
    }
  }, [interests, effectiveDays, trialsOnly, reviewsOnly]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  const toggleSave = async (paper: FeedPaper) => {
    const sid = getSessionId();
    const payload: LocalSaved = {
      pmid: paper.pmid,
      title: paper.title,
      abstract: paper.abstract,
      journal: paper.journal,
      pubDate: paper.pubDate,
    };

    const wasSaved = savedPmids.has(paper.pmid);
    if (wasSaved) {
      removeLocalSaved(paper.pmid);
      try {
        await fetch(
          withBasePath(
            `/api/saved?sessionId=${encodeURIComponent(sid)}&pmid=${encodeURIComponent(paper.pmid)}`,
          ),
          { method: "DELETE" },
        );
      } catch {}
      setSavedPmids((prev) => {
        const n = new Set(prev);
        n.delete(paper.pmid);
        return n;
      });
      return;
    }

    addLocalSaved(payload);
    setSavedPmids((prev) => new Set(prev).add(paper.pmid));
    try {
      await fetch(withBasePath("/api/saved"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          pmid: paper.pmid,
          title: paper.title,
          journal: paper.journal,
          pubDate: paper.pubDate,
          abstract: paper.abstract,
        }),
      });
    } catch {}
  };

  const chips = useMemo(
    () =>
      [
        { id: "all" as const, label: "All" },
        { id: "new7" as const, label: "Last 7 days" },
        { id: "month30" as const, label: "Last 30 days" },
        { id: "trials" as const, label: "Trials" },
        { id: "reviews" as const, label: "Reviews" },
      ] as const,
    [],
  );

  return (
    <div className="min-h-[100dvh] bg-surface-container-low">
      <AppHeader variant="brand" />

      <main className="mx-auto max-w-3xl px-4 pb-8 pt-6">
        <section className="mb-8 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 pb-1">
            {chips.map((c) => {
              const active = filter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilter(c.id)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 font-label text-sm font-semibold transition-all active:scale-95 ${
                    active
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <p className="text-center text-secondary">Fetching PubMed…</p>
        ) : null}
        {error ? (
          <div className="rounded-xl border border-error-container bg-error-container/30 p-4 text-sm text-on-error-container">
            {error}
          </div>
        ) : null}

        {!loading && !error && papers.length === 0 ? (
          <p className="text-center text-secondary">No papers matched this window. Try broader keywords or 30 days.</p>
        ) : null}

        <div className="space-y-8">
          {papers.map((p) => (
            <ArticleCard
              key={p.pmid}
              paper={p}
              saved={savedPmids.has(p.pmid)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
