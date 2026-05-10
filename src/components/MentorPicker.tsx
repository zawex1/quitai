"use client";

import type { MentorId } from "@/types/app";
import { MENTORS } from "@/config/mentors";
import { Brain, Heart, Shield } from "lucide-react";

const ICONS = {
  viktor: Shield,
  elena: Heart,
  artem: Brain,
} as const;

interface MentorPickerProps {
  value: MentorId | null;
  onChange: (id: MentorId) => void;
}

export function MentorPicker({ value, onChange }: MentorPickerProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {MENTORS.map((m) => {
        const Icon = ICONS[m.id];
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`flex flex-col gap-3 rounded-2xl border p-5 text-left transition-colors ${
              active
                ? "border-quit-accent bg-quit-card/90 shadow-[0_0_0_1px_#22c55e33]"
                : "border-slate-700/80 bg-quit-card/30 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  active ? "bg-quit-accent/20 text-quit-accent" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-lg font-semibold text-slate-50">
                  {m.name}{" "}
                  <span className="font-normal text-slate-400">({m.archetype})</span>
                </div>
                <div className="text-sm text-quit-muted">{m.tagline}</div>
              </div>
            </div>
            <p className="text-sm italic text-slate-300">&ldquo;{m.quote}&rdquo;</p>
          </button>
        );
      })}
    </div>
  );
}
