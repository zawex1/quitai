export type AddictionId =
  | "alcohol"
  | "cigarettes"
  | "vaping"
  | "sugar"
  | "gambling"
  | "social"
  | "porn";

export type MentorId = "viktor" | "elena" | "artem";

export interface OnboardingState {
  addictionId: AddictionId;
  mentorId: MentorId;
  /** ISO — момент начала «чистого» отсчёта */
  cleanStartAt: string;
  /** Расход в ₽ в день на выбранную зависимость */
  dailySpendRub: number;
}

export interface UserAccount {
  createdAt: string;
  /** mock: после «оплаты» */
  hasPaidAccess: boolean;
  provider?: "telegram" | "yandex" | "google";
}
