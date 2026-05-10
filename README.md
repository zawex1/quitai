# QuitAI.ru

Фронтенд SaaS на **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide React**.

## Возможности

- Онбординг: выбор одной из 7 зависимостей и наставника (system prompt для чата).
- Главный экран: «чистое время», оценка сэкономленных денег, кнопка **«МНЕ ПЛОХО»** → чат с авто-сообщением.
- Чат с AI через `POST /api/chat` (**DeepSeek** при наличии ключа, иначе **GigaChat** при client credentials).
- Регистрация (демо-кнопки Telegram / Yandex / Google) + **триал 72 часа** с `createdAt` в `localStorage`.
- Пэйволл после окончания триала; демо-кнопка «Оплатить доступ».

## Быстрый старт

```bash
cd C:\quitai
npm install
copy .env.example .env.local
# укажите DEEPSEEK_API_KEY и/или GIGACHAT_*
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Переменные окружения

См. `.env.example`. Без ключей чат вернёт `503` с подсказкой.

## Структура

- `src/config/mentors.ts` — наставники и system prompt.
- `src/config/addictions.ts` — зависимости и дефолтный расход ₽/день.
- `src/components/AddictionPicker.tsx` — выбор зависимости.
- `src/lib/storage.ts` — прогресс в `localStorage` до бэкенда.
- `src/app/api/chat/route.ts` — прокси к LLM.

## Продакшен

Подключите реальный OAuth (Telegram / Yandex / Google), серверную проверку подписки и защиту `/api/chat` (сейчас триал только на клиенте).
