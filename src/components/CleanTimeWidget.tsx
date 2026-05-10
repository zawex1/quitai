"use client";

import { useEffect, useMemo, useState } from "react";
import { Timer } from "lucide-react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function diffParts(from: Date, to: Date) {
  let ms = Math.max(0, to.getTime() - from.getTime());
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  ms -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(ms / (60 * 60 * 1000));
  ms -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(ms / (60 * 1000));
  ms -= minutes * 60 * 1000;
  const seconds = Math.floor(ms / 1000);
  return { days, hours, minutes, seconds };
}

interface CleanTimeWidgetProps {
  startedAtIso: string;
}

export function CleanTimeWidget({ startedAtIso }: CleanTimeWidgetProps) {
  const start = useMemo(() => new Date(startedAtIso), [startedAtIso]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { days, hours, minutes, seconds } = diffParts(start, now);

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-quit-card/50 p-6">
      <div className="mb-4 flex items-center gap-2 text-quit-muted">
        <Timer className="h-5 w-5 text-quit-accent" />
        <h2 className="text-base font-medium tracking-wide text-slate-200">Чистое время</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Дни", value: days, padValue: false },
          { label: "Часы", value: hours, padValue: true },
          { label: "Минуты", value: minutes, padValue: true },
          { label: "Секунды", value: seconds, padValue: true },
        ].map((u) => (
          <div
            key={u.label}
            className="rounded-2xl bg-slate-900/60 px-3 py-4 text-center ring-1 ring-slate-700/60"
          >
            <div className="font-mono text-3xl font-semibold text-quit-accent tabular-nums sm:text-4xl">
              {u.padValue ? pad(u.value) : u.value}
            </div>
            <div className="mt-1 text-sm text-quit-muted">{u.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
