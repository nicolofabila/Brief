"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { STORAGE_INTERESTS, type StoredInterests } from "@/lib/brief-storage";

export default function OnboardingPage() {
  const router = useRouter();
  const [kwInput, setKwInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);

  const canStart = keywords.length > 0;

  const addKeyword = () => {
    const t = kwInput.trim();
    if (!t) return;
    setKeywords((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setKwInput("");
  };

  const removeKeyword = (k: string) => {
    setKeywords((prev) => prev.filter((x) => x !== k));
  };

  const persistAndGo = () => {
    const data: StoredInterests = { keywords };
    localStorage.setItem(STORAGE_INTERESTS, JSON.stringify(data));
    router.push("/feed");
  };

  const suggested = useMemo(() => ["Genomics", "Pharmacology", "Immunology"], []);

  return (
    <div className="min-h-[100dvh] bg-primary-container p-4 pb-12 pt-8 text-on-surface">
      <main className="mx-auto w-full max-w-lg overflow-hidden rounded-xl bg-surface-container-low shadow-[0_24px_48px_rgba(0,0,0,0.15)]">
        <header className="px-6 pb-2 pt-10 text-center md:px-10 md:pt-12">
          <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-primary">Brief</h1>
          <p className="mx-auto max-w-md text-base text-secondary">
            Add keywords you care about; we pull fresh PubMed papers whose title or abstract match, then rank by
            relevance and recency.
          </p>
        </header>

        <section className="space-y-8 px-6 pb-10 pt-6 md:px-10">
          <div>
            <label className="mb-3 block font-label text-xs font-bold uppercase tracking-widest text-on-background">
              Keywords
            </label>
            <div className="relative">
              <input
                value={kwInput}
                onChange={(e) => setKwInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="w-full rounded-xl border-none bg-surface-container-high py-4 pl-5 pr-12 font-body text-on-surface placeholder:text-secondary/50 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25"
                placeholder="e.g. CRISPR, immunotherapy, neuroplasticity…"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-secondary hover:text-primary"
                aria-label="Add keyword"
              >
                <span className="material-symbols-outlined opacity-60">add</span>
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {keywords.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => removeKeyword(k)}
                  className="flex items-center gap-1 rounded-full bg-primary-fixed px-3 py-1 font-label text-[11px] font-semibold text-on-primary-fixed"
                >
                  {k}
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              ))}
              {suggested
                .filter((s) => !keywords.includes(s))
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setKeywords((prev) => [...prev, s])}
                    className="rounded-full bg-surface-container-highest px-3 py-1 font-label text-[11px] font-semibold text-secondary"
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5">
            <div className="absolute bottom-0 left-0 top-0 w-1 bg-tertiary" />
            <h4 className="mb-1 font-headline text-sm font-bold text-on-background">How ranking works</h4>
            <p className="text-xs leading-relaxed text-secondary">
              PubMed searches your keywords in title and abstract. We keep articles that match at least one keyword,
              then rank by phrase hits (titles count more), journal tier, and recency.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              disabled={!canStart}
              onClick={persistAndGo}
              className="w-full rounded-full bg-tertiary py-4 font-headline text-lg font-bold text-on-tertiary shadow-[0_8px_24px_rgba(134,36,2,0.25)] transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Start reading
            </button>
            <button
              type="button"
              onClick={() => {
                const data: StoredInterests = { keywords: ["neurodegeneration", "Alzheimer"] };
                localStorage.setItem(STORAGE_INTERESTS, JSON.stringify(data));
                router.push("/feed");
              }}
              className="w-full py-2 font-label text-xs font-semibold uppercase tracking-widest text-secondary hover:text-primary"
            >
              Try sample keywords
            </button>
          </div>
        </section>
      </main>
      <p className="mx-auto mt-6 max-w-lg text-center text-[10px] uppercase tracking-widest text-on-primary/70">
        Data from NCBI PubMed · Not medical advice
      </p>
    </div>
  );
}
