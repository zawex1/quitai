"use client";

import { useRouter } from "next/navigation";
import { loadUser, saveUser } from "@/lib/storage";
import { hasFullAccess, trialEndsAt } from "@/lib/trial";
import { Lock } from "lucide-react";
import { useEffect, useMemo } from "react";

export default function PaywallPage() {
  const router = useRouter();
  const user = useMemo(() => loadUser(), []);
  const ends = user ? trialEndsAt(user) : null;

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
    if (hasFullAccess(user)) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  const pay = () => {
    const u = loadUser();
    if (!u) return;
    saveUser({ ...u, hasPaidAccess: true });
    router.replace("/dashboard");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <div className="mb-6 flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-quit-accent/15 text-quit-accent">
          <Lock className="h-8 w-8" />
        </span>
      </div>
      <h1 className="mb-4 text-center text-3xl font-semibold text-slate-50">Доступ ограничен</h1>
      <p className="mb-2 text-center text-lg text-slate-300">
        Твой пробный период закончился. Стоимость свободы —{" "}
        <span className="font-semibold text-quit-accent">750₽</span> в месяц.
      </p>
      {ends && (
        <p className="mb-8 text-center text-sm text-slate-500">
          Триал завершился: {ends.toLocaleString("ru-RU")}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        className="rounded-2xl bg-quit-accent py-4 text-lg font-semibold text-slate-950 transition hover:brightness-110"
      >
        Оплатить доступ
      </button>
      <p className="mt-6 text-center text-sm text-slate-500">
        Демо: кнопка помечает аккаунт как оплаченный в localStorage. Интегрируйте ЮKassa / CloudPayments
        и проверку подписки на сервере.
      </p>
    </main>
  );
}
