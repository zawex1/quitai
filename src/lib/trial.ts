import type { UserAccount } from "@/types/app";

const TRIAL_MS = 72 * 60 * 60 * 1000;

export function trialEndsAt(user: UserAccount): Date {
  return new Date(new Date(user.createdAt).getTime() + TRIAL_MS);
}

export function isTrialActive(user: UserAccount, now = new Date()): boolean {
  if (user.hasPaidAccess) return true;
  return now.getTime() < trialEndsAt(user).getTime();
}

export function hasFullAccess(user: UserAccount | null, now = new Date()): boolean {
  if (!user) return false;
  return user.hasPaidAccess || isTrialActive(user, now);
}
