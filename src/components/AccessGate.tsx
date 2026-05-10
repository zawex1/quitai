"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadOnboarding, loadUser } from "@/lib/storage";
import { hasFullAccess } from "@/lib/trial";

const PUBLIC = new Set(["/", "/onboarding", "/register", "/paywall"]);

export function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ob = loadOnboarding();
    const user = loadUser();

    if (!PUBLIC.has(pathname) && !ob) {
      router.replace("/onboarding");
      setReady(true);
      return;
    }

    if ((pathname === "/dashboard" || pathname === "/chat") && ob && !user) {
      router.replace("/register");
      setReady(true);
      return;
    }

    if ((pathname === "/dashboard" || pathname === "/chat") && user && !hasFullAccess(user)) {
      router.replace("/paywall");
      setReady(true);
      return;
    }

    if (pathname === "/paywall" && user && hasFullAccess(user)) {
      router.replace("/dashboard");
      setReady(true);
      return;
    }

    if (pathname === "/register" && user) {
      router.replace("/dashboard");
      setReady(true);
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">Загрузка…</div>
    );
  }

  return <>{children}</>;
}
