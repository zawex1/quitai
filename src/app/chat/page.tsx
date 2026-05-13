"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ChatMessenger } from "@/components/ChatMessenger";
import { loadOnboarding } from "@/lib/storage";
import { getMentorById } from "@/config/mentors";
import { Suspense, useMemo } from "react";

function ChatInner() {
  const params = useSearchParams();
  const crisis = params.get("crisis") === "1";
  const ob = useMemo(() => loadOnboarding(), []);
  const mentor = ob ? getMentorById(ob.mentorId) : undefined;

  if (!ob) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-4 px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-slate-100">Чат пока недоступен</h1>
        <p className="text-slate-400">
          Сначала нужно пройти короткую настройку (зависимость и наставник). Так мы сохраним данные в браузере.
        </p>
        <Link
          href="/onboarding"
          className="mx-auto rounded-2xl bg-quit-accent px-6 py-3 font-semibold text-slate-950 hover:brightness-110"
        >
          Перейти к настройке
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-3 py-2 text-slate-200 hover:bg-slate-800/60"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-slate-50">Чат с наставником</h1>
          <p className="text-sm text-slate-400">
            {mentor?.name} — {mentor?.archetype}
          </p>
        </div>
      </div>
      <ChatMessenger mentorId={ob.mentorId} crisisBoot={crisis} />
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-slate-400">Загрузка чата…</main>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
