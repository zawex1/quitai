import type { Metadata } from "next";
import "./globals.css";
import { AccessGate } from "@/components/AccessGate";

export const metadata: Metadata = {
  title: "QuitAI.ru — свобода от зависимостей",
  description: "SaaS-сервис поддержки при отказе от зависимостей: наставники, трекер чистого времени и AI-чат.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen">
        <AccessGate>{children}</AccessGate>
      </body>
    </html>
  );
}
