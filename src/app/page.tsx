"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_INTERESTS } from "@/lib/brief-storage";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_INTERESTS);
      if (!raw) {
        router.replace("/onboarding");
        return;
      }
      const parsed = JSON.parse(raw) as { keywords?: string[] };
      const keywords = parsed.keywords ?? [];
      const empty = keywords.length === 0;
      if (empty) {
        router.replace("/onboarding");
        return;
      }
      router.replace("/feed");
    } catch {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-primary-container font-body text-on-primary">
      <p className="text-sm opacity-90">Loading Brief…</p>
    </div>
  );
}
