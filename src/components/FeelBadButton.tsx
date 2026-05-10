"use client";

import { useRouter } from "next/navigation";
import { Frown } from "lucide-react";

export function FeelBadButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/chat?crisis=1")}
      className="group relative mx-auto flex min-h-[120px] w-full max-w-xl flex-col items-center justify-center gap-3 rounded-[2rem] bg-gradient-to-b from-quit-accent to-emerald-600 px-8 py-10 text-center text-slate-950 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.55)] transition hover:brightness-105 active:scale-[0.99]"
    >
      <Frown className="h-10 w-10 opacity-90 transition group-hover:scale-105" strokeWidth={1.75} />
      <span className="text-2xl font-bold tracking-tight sm:text-3xl">МНЕ ПЛОХО</span>
      <span className="max-w-sm text-base font-medium text-slate-900/80">
        Мгновенный чат с наставником — вы не одни в этот момент
      </span>
    </button>
  );
}
