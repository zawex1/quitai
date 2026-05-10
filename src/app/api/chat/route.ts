import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getMentorById } from "@/config/mentors";
import type { MentorId } from "@/types/app";
import { fetchGigaChatAccessToken, gigachatCompletion } from "@/lib/gigachat";

export const runtime = "nodejs";

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
  const id = process.env.GIGACHAT_CLIENT_ID;
  const secret = process.env.GIGACHAT_CLIENT_SECRET;
  if (!id || !secret) return null;

  const token = await fetchGigaChatAccessToken(id, secret);
  const payload = [
    { role: "system", content: system },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  return gigachatCompletion(token, payload);
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
    let reply: string | null = await deepSeekChat(system, messages);
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

    return NextResponse.json(
      {
        error: "Не удалось получить ответ. Проверьте соединение и попробуйте снова чуть позже.",
      },
      { status: 500 }
    );
  }
}
