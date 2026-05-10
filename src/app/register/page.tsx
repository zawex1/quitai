"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Chrome } from "lucide-react";
import { saveUser, loadUser, loadOnboarding } from "@/lib/storage";
import type { UserAccount } from "@/types/app";
import { useEffect } from "react";

function signIn(provider: NonNullable<UserAccount["provider"]>) {
  const user: UserAccount = {
    createdAt: new Date().toISOString(),
    hasPaidAccess: false,
    provider,
  };
  saveUser(user);
}

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (!loadOnboarding()) {
      router.replace("/onboarding");
      return;
    }
    if (loadUser()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const onTelegram = () => {
    signIn("telegram");
    router.push("/dashboard");
  };
  const onYandex = () => {
    signIn("yandex");
    router.push("/dashboard");
  };
  const onGoogle = () => {
    signIn("google");
    router.push("/dashboard");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-center text-3xl font-semibold text-slate-50">Вход в QuitAI.ru</h1>
      <p className="mb-10 text-center text-slate-400">
        Сохраним прогресс и активируем 72 часа полного доступа бесплатно.
      </p>

      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={onTelegram}
          className="flex items-center justify-center gap-3 rounded-2xl border border-slate-600 bg-slate-800/50 py-4 font-medium text-slate-100 transition hover:bg-slate-800"
        >
          <MessageCircle className="h-6 w-6 text-sky-400" />
          Вход через Telegram
        </button>
        <button
          type="button"
          onClick={onYandex}
          className="flex items-center justify-center gap-3 rounded-2xl border border-slate-600 bg-slate-800/50 py-4 font-medium text-slate-100 transition hover:bg-slate-800"
        >
          <span className="text-xl font-bold text-red-400">Я</span>
          Yandex ID
        </button>
        <button
          type="button"
          onClick={onGoogle}
          className="flex items-center justify-center gap-3 rounded-2xl border border-slate-600 bg-slate-800/50 py-4 font-medium text-slate-100 transition hover:bg-slate-800"
        >
          <Chrome className="h-6 w-6 text-quit-accent" />
          Google
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Демо: кнопки имитируют OAuth и записывают <code className="text-slate-400">createdAt</code> в
        localStorage. Подключите реальные провайдеры в продакшене.
      </p>
    </main>
  );
}
