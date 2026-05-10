"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { MentorId } from "@/types/app";
import { loadChatMessages, saveChatMessages, type ChatMessage } from "@/lib/storage";
import { getMentorById } from "@/config/mentors";

const QUICK_REPLIES = [
  "Дыхательное упражнение",
  "Что делать прямо сейчас?",
  "Напомни, почему я бросаю",
  "Очень тянет, помоги пережить волну",
];

interface ChatMessengerProps {
  mentorId: MentorId;
  crisisBoot?: boolean;
}

export function ChatMessenger({ mentorId, crisisBoot }: ChatMessengerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const crisisSent = useRef(false);

  useEffect(() => {
    setMessages(loadChatMessages());
  }, []);

  useEffect(() => {
    saveChatMessages(messages);
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const requestReply = useCallback(
    async (history: ChatMessage[]) => {
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mentorId,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Ошибка сети");
        const assistant: ChatMessage = { role: "assistant", content: data.reply ?? "" };
        setMessages([...history, assistant]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Не удалось отправить");
        setMessages(history);
      } finally {
        setLoading(false);
      }
    },
    [mentorId]
  );

  useEffect(() => {
    if (!crisisBoot || crisisSent.current) return;
    const existing = loadChatMessages();
    if (existing.length > 0) return;
    crisisSent.current = true;
    const mentor = getMentorById(mentorId);
    const boot: ChatMessage = {
      role: "user",
      content: `Сейчас очень тяжело. Мне плохо, нужна срочная поддержка. Наставник: ${mentor?.name ?? ""}.`,
    };
    setMessages([boot]);
    void requestReply([boot]);
  }, [crisisBoot, mentorId, requestReply]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    await requestReply(history);
  };

  const onQuick = async (text: string) => {
    if (loading) return;
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages(history);
    await requestReply(history);
  };

  return (
    <div className="flex h-[min(70vh,640px)] flex-col rounded-3xl border border-slate-700/80 bg-quit-card/40">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !crisisBoot && (
          <p className="text-center text-slate-400">Напишите наставнику — ответ появится здесь.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={`${i}-${m.role}-${m.content.slice(0, 24)}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-base ${
                m.role === "user"
                  ? "bg-quit-accent/20 text-slate-50 ring-1 ring-quit-accent/40"
                  : "bg-slate-800/90 text-slate-100 ring-1 ring-slate-700"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-800/90 px-4 py-3 text-slate-300 ring-1 ring-slate-700">
              <Loader2 className="h-5 w-5 animate-spin text-quit-accent" />
              Наставник печатает…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="border-t border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-200">{error}</div>
      )}

      <div className="border-t border-slate-700/80 p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onQuick(q)}
              disabled={loading}
              className="rounded-full bg-slate-800/80 px-3 py-1.5 text-sm text-slate-200 ring-1 ring-slate-600 transition hover:bg-slate-700 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-slate-600 bg-slate-900/80 px-4 py-3 text-base text-slate-100 outline-none ring-quit-accent/30 placeholder:text-slate-500 focus:ring-2"
            placeholder="Сообщение…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center rounded-2xl bg-quit-accent px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
