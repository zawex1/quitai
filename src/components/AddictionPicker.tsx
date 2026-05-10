"use client";

import type { AddictionId } from "@/types/app";
import { ADDICTIONS } from "@/config/addictions";
import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Candy,
  Check,
  Cigarette,
  Dices,
  Smartphone,
  Wine,
  Wind,
} from "lucide-react";

const ICONS: Record<AddictionId, LucideIcon> = {
  alcohol: Wine,
  cigarettes: Cigarette,
  vaping: Wind,
  sugar: Candy,
  gambling: Dices,
  social: Smartphone,
  porn: Brain,
};

interface AddictionPickerProps {
  value: AddictionId | null;
  onChange: (id: AddictionId) => void;
}

export function AddictionPicker({ value, onChange }: AddictionPickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ADDICTIONS.map((a) => {
        const active = value === a.id;
        const Icon = ICONS[a.id];

        return (
          <button
            key={a.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(a.id)}
            className={[
              "group relative flex flex-col gap-4 rounded-3xl border p-5 text-left transition-all duration-200",
              "bg-gradient-to-br from-slate-800/90 via-slate-900/80 to-slate-950/90",
              "shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]",
              active
                ? "border-quit-accent/70 shadow-[0_0_0_1px_rgba(34,197,94,0.35),0_20px_50px_-24px_rgba(34,197,94,0.45)] ring-1 ring-quit-accent/40"
                : "border-slate-700/60 hover:-translate-y-0.5 hover:border-slate-500/70 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.9)]",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={[
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200",
                  active
                    ? "bg-gradient-to-br from-quit-accent/25 to-emerald-600/10 text-quit-accent shadow-inner"
                    : "bg-slate-800/80 text-slate-300 ring-1 ring-slate-600/50 group-hover:bg-slate-700/80 group-hover:text-quit-accent",
                ].join(" ")}
              >
                <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </span>

              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                  active
                    ? "border-quit-accent bg-quit-accent text-slate-950 shadow-[0_0_20px_-4px_rgba(34,197,94,0.8)]"
                    : "border-slate-600/80 bg-slate-900/50 text-transparent group-hover:border-slate-500",
                ].join(" ")}
                aria-hidden
              >
                <Check className={`h-4 w-4 ${active ? "opacity-100" : "opacity-0"}`} strokeWidth={3} />
              </span>
            </div>

            <div className="space-y-1">
              <span className="block text-lg font-semibold leading-snug tracking-tight text-slate-50">
                {a.label}
              </span>
              <span className="block text-sm text-slate-400">
                {active ? "Выбрано — дальше настроим путь" : "Нажмите, чтобы выбрать фокус"}
              </span>
            </div>

            <span
              className={[
                "pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent transition-opacity",
                active ? "via-quit-accent/60 to-transparent opacity-100" : "via-slate-500/40 to-transparent opacity-0 group-hover:opacity-70",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
