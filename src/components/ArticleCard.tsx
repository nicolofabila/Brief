"use client";

import Link from "next/link";
import type { FeedPaper } from "@/types/paper";

type Props = {
  paper: FeedPaper;
  onToggleSave?: (paper: FeedPaper) => void;
  saved?: boolean;
};

export function ArticleCard({ paper, onToggleSave, saved }: Props) {
  const pubLabel = paper.pubDate ?? (paper.pubYear ? String(paper.pubYear) : "—");
  const snippet = paper.abstract
    ? paper.abstract.length > 220
      ? `${paper.abstract.slice(0, 220)}…`
      : paper.abstract
    : "No abstract available in PubMed for this record.";

  return (
    <article className="group relative overflow-hidden rounded-lg border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {paper.isNew ? (
            <span className="rounded-full bg-tertiary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container">
              New
            </span>
          ) : null}
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onToggleSave?.(paper)}
            className={`rounded-full p-2 transition-colors hover:text-primary ${
              saved ? "text-tertiary" : "text-outline"
            }`}
            aria-label={saved ? "Remove from saved" : "Save paper"}
          >
            <span
              className={`material-symbols-outlined${saved ? " material-symbols-fill" : ""}`}
            >
              bookmark
            </span>
          </button>
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full p-2 text-outline transition-colors hover:text-primary"
            aria-label="Open in PubMed"
          >
            <span className="material-symbols-outlined">open_in_new</span>
          </a>
        </div>
      </div>

      <Link href={`/article/${paper.pmid}`} className="block">
        <h2 className="mb-2 font-headline text-xl font-bold leading-tight text-on-surface transition-colors group-hover:text-primary md:text-2xl">
          {paper.title || `PubMed ${paper.pmid}`}
        </h2>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-secondary">
          <span>{paper.journal || "Journal N/A"}</span>
          <span className="h-1 w-1 rounded-full bg-outline-variant" />
          <span>PMID {paper.pmid}</span>
          <span className="h-1 w-1 rounded-full bg-outline-variant" />
          <span>{pubLabel}</span>
        </div>
        <div className="border-l-2 border-tertiary pl-3">
          <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">{snippet}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <span className="flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest text-primary group-hover:underline">
            View abstract
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
