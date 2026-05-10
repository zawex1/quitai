"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";

interface MoneySavedWidgetProps {
  startedAtIso: string;
  dailySpendRub: number;
}

export function MoneySavedWidget({ startedAtIso, dailySpendRub }: MoneySavedWidgetProps) {
  const start = useMemo(() => new Date(startedAtIso), [startedAtIso]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ms = Math.max(0, now.getTime() - start.getTime());
  const daysExact = ms / (24 * 60 * 60 * 1000);
  const saved = dailySpendRub * daysExact;

  const formatted = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Math.round(saved));

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-quit-card/50 p-6">
      <div className="mb-2 flex items-center gap-2 text-quit-muted">
        <Wallet className="h-5 w-5 text-quit-accent" />
        <h2 className="text-base font-medium text-slate-200">Сэкономлено</h2>
      </div>
      <p className="text-4xl font-semibold tracking-tight text-slate-50">{formatted}</p>
      <p className="mt-2 text-sm text-slate-400">
        Оценка по вашему расходу ~{dailySpendRub}₽ в день. Можно изменить в настройках позже.
      </p>
    </section>
  );
}
