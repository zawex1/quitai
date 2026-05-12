"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loadOnboarding, loadUser } from "@/lib/storage";
import { hasFullAccess } from "@/lib/trial";

const PUBLIC = new Set(["/", "/onboarding", "/register", "/paywall"]);

function isPublicPath(pathname: string | null) {
  if (pathname == null || pathname === "") return false;
  return PUBLIC.has(pathname);
}

export function AccessGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const bootTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(() => isPublicPath(pathname));

  useLayoutEffect(() => {
    const finish = () => {
      if (bootTimeoutRef.current) {
        clearTimeout(bootTimeoutRef.current);
        bootTimeoutRef.current = null;
      }
      setReady(true);
    };

    try {
      const ob = loadOnboarding();
      const user = loadUser();

      if (!isPublicPath(pathname) && !ob) {
        router.replace("/onboarding");
        return;
      }

      if ((pathname === "/dashboard" || pathname === "/chat") && ob && !user) {
        router.replace("/register");
        return;
      }

      if ((pathname === "/dashboard" || pathname === "/chat") && user && !hasFullAccess(user)) {
        router.replace("/paywall");
        return;
      }

      if (pathname === "/paywall" && user && hasFullAccess(user)) {
        router.replace("/dashboard");
        return;
      }

      if (pathname === "/register" && user) {
        router.replace("/dashboard");
        return;
      }
    } catch (e) {
      console.error("[AccessGate]", e);
    } finally {
      finish();
    }
  }, [pathname, router]);

  useLayoutEffect(() => {
    if (ready) return;
    bootTimeoutRef.current = setTimeout(() => {
      console.error("[AccessGate] timeout: принудительно показываем интерфейс (проверьте загрузку JS / консоль).");
      setReady(true);
    }, 4000);
    return () => {
      if (bootTimeoutRef.current) clearTimeout(bootTimeoutRef.current);
    };
  }, [ready, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center text-slate-400">
        <p>Загрузка…</p>
        <p className="max-w-md text-sm text-slate-500">
          Если так висит долго: откройте инструменты разработчика (F12) → вкладка «Сеть» и проверьте, нет ли ошибок
          загрузки файлов из <span className="font-mono text-slate-400">/_next/static/</span>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
