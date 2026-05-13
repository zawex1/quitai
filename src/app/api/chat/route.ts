import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getMentorById } from "@/config/mentors";
import type { MentorId } from "@/types/app";
import { runGigaChatChat } from "@/lib/gigachat";

export const runtime = "nodejs";
/** Лимит времени функции (сек). На бесплатном Vercel фактический максимум может быть ~10. */
export const maxDuration = 60;

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_MODEL = "deepseek-chat";

type ChatBody = {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  mentorId: MentorId;
};

function createDeepSeekClient(apiKey: string) {
  return new OpenAI({
    baseURL: DEEPSEEK_BASE_URL,
    apiKey,
  });
}

async function deepSeekChat(system: string, messages: ChatBody["messages"]) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;

  const client = createDeepSeekClient(key);

  const completion = await client.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages: [{ role: "system", content: system }, ...messages],
    temperature: 0.7,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("DeepSeek: пустой ответ");
  return text;
}

async function gigaChat(system: string, messages: ChatBody["messages"]) {
  return runGigaChatChat(system, messages);
}

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  if (!body.mentorId || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "Нужны mentorId и messages" }, { status: 400 });
  }

  const mentor = getMentorById(body.mentorId);
  const system = mentor?.systemPrompt ?? "Ты поддерживающий наставник QuitAI.ru. Отвечай по-русски.";

  const messages = body.messages.filter((m) => m.role !== "system");

  try {
    let reply: string | null = null;
    const hasDeepSeekKey = Boolean(process.env.DEEPSEEK_API_KEY);

    if (hasDeepSeekKey) {
      try {
        reply = await deepSeekChat(system, messages);
      } catch (err) {
        if (err instanceof OpenAI.APIError && err.status === 402) {
          console.warn("[api/chat] DeepSeek 402 (нет средств), пробуем GigaChat");
          try {
            reply = await gigaChat(system, messages);
            if (!reply) {
              return NextResponse.json(
                {
                  error:
                    "На балансе DeepSeek закончились средства. Добавьте GIGACHAT_CLIENT_ID и GIGACHAT_CLIENT_SECRET в Vercel (или пополните баланс DeepSeek).",
                },
                { status: 402 }
              );
            }
          } catch (gErr) {
            console.error("[api/chat] GigaChat после 402:", gErr);
            return NextResponse.json(
              {
                error:
                  "На балансе DeepSeek закончились средства. Запасной GigaChat не сработал — пополните баланс DeepSeek или настройте GIGACHAT_CLIENT_ID и GIGACHAT_CLIENT_SECRET в переменных окружения.",
              },
              { status: 402 }
            );
          }
        } else {
          throw err;
        }
      }
    }

    if (!reply) {
      reply = await gigaChat(system, messages);
    }
    if (!reply) {
      return NextResponse.json(
        {
          error:
            "Не настроен провайдер LLM. Добавьте DEEPSEEK_API_KEY или GIGACHAT_CLIENT_ID/GIGACHAT_CLIENT_SECRET в .env",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[api/chat] full error:", error);

    if (error instanceof OpenAI.APIError) {
      const status = error.status;

      if (status === 401) {
        return NextResponse.json({ error: "Ошибка авторизации (проверь API ключ)" }, { status: 401 });
      }
      if (status === 402) {
        return NextResponse.json({ error: "На балансе DeepSeek закончились средства" }, { status: 402 });
      }
      if (status === 429) {
        return NextResponse.json({ error: "Слишком много запросов, подожди немного" }, { status: 429 });
      }
      if (status === 500) {
        return NextResponse.json(
          { error: "Ошибка на стороне нейросети, попробуй позже" },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Сервис чата временно недоступен. Мы уже разбираемся — попробуйте ещё раз через несколько минут.",
        },
        { status: 500 }
      );
    }

    const detail =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Неизвестная ошибка";
    const hint =
      /certificate|CERT|TLS|SSL|UNABLE_TO_VERIFY|self signed|unknown ca/i.test(detail)
        ? " Для GigaChat в Node.js часто нужен корневой сертификат Минцифры — см. раздел про сертификаты в документации GigaChat на developers.sber.ru."
        : "";
    return NextResponse.json(
      {
        error: `${detail.slice(0, 600)}${hint}`,
      },
      { status: 502 }
    );
  }
}
