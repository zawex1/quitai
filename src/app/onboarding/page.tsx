"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddictionPicker } from "@/components/AddictionPicker";
import { MentorPicker } from "@/components/MentorPicker";
import { loadOnboarding, saveOnboarding } from "@/lib/storage";
import { getAddictionById } from "@/config/addictions";
import type { AddictionId, MentorId } from "@/types/app";
import { Leaf } from "lucide-react";

type Step = 1 | 2;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [addictionId, setAddictionId] = useState<AddictionId | null>(null);
  const [mentorId, setMentorId] = useState<MentorId | null>(null);

  useEffect(() => {
    const existing = loadOnboarding();
    if (existing) {
      router.replace("/register");
    }
  }, [router]);

  const finish = () => {
    if (!addictionId || !mentorId) return;
    const addiction = getAddictionById(addictionId);
    saveOnboarding({
      addictionId,
      mentorId,
      cleanStartAt: new Date().toISOString(),
      dailySpendRub: addiction?.defaultDailySpendRub ?? 0,
    });
    router.push("/register");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6">
      <header className="mb-10 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-quit-accent/15 text-quit-accent">
          <Leaf className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-sm uppercase tracking-widest text-quit-muted">QuitAI.ru</p>
          <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">Первый шаг к свободе</h1>
        </div>
      </header>

      <div className="mb-6 flex gap-2 text-sm text-slate-400">
        <span className={step === 1 ? "text-quit-accent" : ""}>1. Зависимость</span>
        <span>→</span>
        <span className={step === 2 ? "text-quit-accent" : ""}>2. Наставник</span>
      </div>

      {step === 1 && (
        <section className="space-y-6">
          <h2 className="text-xl font-medium text-slate-100">Что вы хотите преодолеть?</h2>
          <AddictionPicker value={addictionId} onChange={setAddictionId} />
          <button
            type="button"
            disabled={!addictionId}
            onClick={() => setStep(2)}
            className="w-full rounded-2xl bg-quit-accent py-4 text-lg font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-10"
          >
            Далее
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-6">
          <h2 className="text-xl font-medium text-slate-100">Кто будет вашим наставником в чате?</h2>
          <p className="text-slate-400">
            Личность наставника задаёт стиль ответов ИИ — от строгого стоика до тёплой поддержки и
            научных объяснений.
          </p>
          <MentorPicker value={mentorId} onChange={setMentorId} />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-2xl border border-slate-600 px-8 py-3 text-slate-200 hover:bg-slate-800/50"
            >
              Назад
            </button>
            <button
              type="button"
              disabled={!mentorId}
              onClick={finish}
              className="rounded-2xl bg-quit-accent px-10 py-3 text-lg font-semibold text-slate-950 hover:brightness-110 disabled:opacity-40"
            >
              Сохранить и продолжить
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
