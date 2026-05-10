import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AccessGate } from "@/components/AccessGate";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuitAI.ru — свобода от зависимостей",
  description: "SaaS-сервис поддержки при отказе от зависимостей: наставники, трекер чистого времени и AI-чат.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className={`${inter.className} min-h-screen`}>
        <AccessGate>{children}</AccessGate>
      </body>
    </html>
  );
}
