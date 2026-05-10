import type { AddictionId, MentorId, OnboardingState, UserAccount } from "@/types/app";

const KEYS = {
  onboarding: "quitai_onboarding_v1",
  user: "quitai_user_v1",
  chatDraft: "quitai_chat_messages_v1",
} as const;

function readJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadOnboarding(): OnboardingState | null {
  if (typeof window === "undefined") return null;
  return readJson<OnboardingState>(localStorage.getItem(KEYS.onboarding));
}

export function saveOnboarding(state: OnboardingState): void {
  localStorage.setItem(KEYS.onboarding, JSON.stringify(state));
}

export function loadUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  return readJson<UserAccount>(localStorage.getItem(KEYS.user));
}

export function saveUser(user: UserAccount): void {
  localStorage.setItem(KEYS.user, JSON.stringify(user));
}

export function clearProgress(): void {
  localStorage.removeItem(KEYS.onboarding);
  localStorage.removeItem(KEYS.user);
  localStorage.removeItem(KEYS.chatDraft);
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function loadChatMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  return readJson<ChatMessage[]>(localStorage.getItem(KEYS.chatDraft)) ?? [];
}

export function saveChatMessages(messages: ChatMessage[]): void {
  localStorage.setItem(KEYS.chatDraft, JSON.stringify(messages));
}

export function updateOnboardingPartial(patch: Partial<OnboardingState>): void {
  const cur = loadOnboarding();
  if (!cur) return;
  saveOnboarding({ ...cur, ...patch });
}

export type { AddictionId, MentorId };
