import type { AddictionId } from "@/types/app";

export interface AddictionOption {
  id: AddictionId;
  label: string;
  /** Рекомендуемый средний расход ₽/день для оценки экономии */
  defaultDailySpendRub: number;
}

export const ADDICTIONS: AddictionOption[] = [
  { id: "alcohol", label: "Алкоголь", defaultDailySpendRub: 500 },
  { id: "cigarettes", label: "Курение (сигареты)", defaultDailySpendRub: 350 },
  { id: "vaping", label: "Вейпинг / Электронные сигареты", defaultDailySpendRub: 400 },
  { id: "sugar", label: "Сахар / Переедание", defaultDailySpendRub: 200 },
  { id: "gambling", label: "Игромания (лудомания)", defaultDailySpendRub: 800 },
  { id: "social", label: "Соцсети / Экранное время", defaultDailySpendRub: 0 },
  { id: "porn", label: "Порнозависимость", defaultDailySpendRub: 0 },
];

export function getAddictionById(id: AddictionId): AddictionOption | undefined {
  return ADDICTIONS.find((a) => a.id === id);
}
