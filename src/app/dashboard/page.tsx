"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CleanTimeWidget } from "@/components/CleanTimeWidget";
import { MoneySavedWidget } from "@/components/MoneySavedWidget";
import { FeelBadButton } from "@/components/FeelBadButton";
import { loadOnboarding } from "@/lib/storage";
import { getAddictionById } from "@/config/addictions";
import { getMentorById } from "@/config/mentors";
import { MessageCircle, User } from "lucide-react";

export default function DashboardPage() {
  const ob = useMemo(() => loadOnboarding(), []);
  const addiction = ob ? getAddictionById(ob.addictionId) : undefined;
  const mentor = ob ? getMentorById(ob.mentorId) : undefined;

  if (!ob) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-quit-muted">QuitAI.ru</p>
          <h1 className="text-2xl font-semibold text-slate-50">Ваш путь</h1>
          <p className="mt-1 text-slate-400">
            {addiction?.label} · наставник{" "}
            <span className="text-quit-accent">
              {mentor?.name} ({mentor?.archetype})
            </span>
          </p>
        </div>
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800/60"
        >
          <MessageCircle className="h-5 w-5 text-quit-accent" />
          Чат
        </Link>
      </header>

      <div className="space-y-6">
        <CleanTimeWidget startedAtIso={ob.cleanStartAt} />
        <MoneySavedWidget startedAtIso={ob.cleanStartAt} dailySpendRub={ob.dailySpendRub} />
        <div className="flex justify-center py-4">
          <FeelBadButton />
        </div>
      </div>

      <footer className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500">
        <User className="h-4 w-4" />
        Данные хранятся локально до синхронизации с бэкендом.
      </footer>
    </main>
  );
}
