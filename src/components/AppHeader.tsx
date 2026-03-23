import Link from "next/link";

type Props = {
  title?: string;
  showBack?: boolean;
  /** `brand`: primary app bar. `light`: minimal bar (e.g. nested screens). */
  variant?: "brand" | "light";
};

export function AppHeader({ title = "Brief", showBack, variant = "brand" }: Props) {
  const bar =
    variant === "brand"
      ? "bg-primary-container text-on-primary border-b border-black/5"
      : "bg-white/90 backdrop-blur-md border-b border-outline-variant/20 text-on-surface";

  return (
    <header className={`sticky top-0 z-50 ${bar}`}>
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2">
          {showBack ? (
            <Link
              href="/feed"
              className="rounded-full p-2 transition-colors hover:bg-black/5 active:scale-95"
              aria-label="Back to feed"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
          ) : null}
          <Link href="/feed" className="font-headline text-xl font-extrabold tracking-tight">
            {title}
          </Link>
        </div>
      </div>
    </header>
  );
}
