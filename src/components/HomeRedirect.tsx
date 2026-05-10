"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadOnboarding, loadUser } from "@/lib/storage";
import { hasFullAccess } from "@/lib/trial";

export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const ob = loadOnboarding();
    const user = loadUser();

    if (!ob) {
      router.replace("/onboarding");
      return;
    }
    if (!user) {
      router.replace("/register");
      return;
    }
    if (!hasFullAccess(user)) {
      router.replace("/paywall");
      return;
    }
    router.replace("/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <p className="text-slate-400">Перенаправление…</p>
    </main>
  );
}
