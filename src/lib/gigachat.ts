/**
 * GigaChat API (OAuth2 client_credentials).
 * Документация: https://developers.sber.ru/docs/ru/gigachat/api/overview
 */

interface GigaTokenResponse {
  access_token: string;
  expires_at?: number;
}

/** Base64(Client ID:Client Secret) или готовый «Ключ авторизации» из кабинета Сбера */
function getAuthorizationKey(): string | null {
  const ready = process.env.GIGACHAT_AUTHORIZATION_KEY?.trim();
  if (ready) return ready;

  const id = process.env.GIGACHAT_CLIENT_ID?.trim();
  const secret = process.env.GIGACHAT_CLIENT_SECRET?.trim();
  if (id && secret) {
    return Buffer.from(`${id}:${secret}`).toString("base64");
  }
  return null;
}

function getScope(): string {
  return process.env.GIGACHAT_SCOPE?.trim() || "GIGACHAT_API_PERS";
}

function getModel(): string {
  return process.env.GIGACHAT_MODEL?.trim() || "GigaChat";
}

export function isGigaChatConfigured(): boolean {
  return getAuthorizationKey() !== null;
}

/** Кэш access_token: один OAuth на «сессию» сервера — меньше лимитов и стабильнее второй запрос подряд. */
let accessTokenCache: { token: string; expiresAt: number } | null = null;
let accessTokenInflight: Promise<GigaTokenResponse> | null = null;

function parseExpiresAtMs(data: GigaTokenResponse, fallbackMsFromNow: number): number {
  const raw = data.expires_at;
  if (raw == null) return Date.now() + fallbackMsFromNow;
  const n = Number(raw);
  if (!Number.isFinite(n)) return Date.now() + fallbackMsFromNow;
  if (n > 1e12) return n;
  if (n > 1e9) return n * 1000;
  return Date.now() + fallbackMsFromNow;
}

async function requestTokenResponse(authorizationKey: string): Promise<GigaTokenResponse> {
  const rqUid = crypto.randomUUID();
  const scope = getScope();
  const body = new URLSearchParams({
    scope,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${authorizationKey}`,
      RqUID: rqUid,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GigaChat OAuth ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = (await res.json()) as GigaTokenResponse;
  if (!data.access_token) throw new Error("GigaChat: нет access_token в ответе");
  return data;
}

export function invalidateGigaChatAccessTokenCache(): void {
  accessTokenCache = null;
}

/** Access token с кэшем (обновление за ~60 с до истечения). */
export async function getGigaChatAccessTokenCached(authorizationKey: string): Promise<string> {
  const now = Date.now();
  if (accessTokenCache && accessTokenCache.expiresAt > now + 60_000) {
    return accessTokenCache.token;
  }

  if (accessTokenInflight) {
    const data = await accessTokenInflight;
    return data.access_token;
  }

  accessTokenInflight = requestTokenResponse(authorizationKey);
  try {
    const data = await accessTokenInflight;
    const expiresAt = parseExpiresAtMs(data, 25 * 60 * 1000);
    accessTokenCache = { token: data.access_token, expiresAt };
    return data.access_token;
  } finally {
    accessTokenInflight = null;
  }
}

export async function gigachatCompletion(
  accessToken: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const model = getModel();

  const res = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GigaChat chat ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("GigaChat: пустой ответ");
  return content;
}

/**
 * Полный запрос к GigaChat. Возвращает null, если в .env нет ключей.
 * При 401 на completions — один повтор с новым токеном.
 */
export async function runGigaChatChat(
  systemPrompt: string,
  messages: { role: "user" | "assistant" | "system"; content: string }[]
): Promise<string | null> {
  const authKey = getAuthorizationKey();
  if (!authKey) return null;

  const payload = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const tryOnce = async () => {
    const token = await getGigaChatAccessTokenCached(authKey);
    return gigachatCompletion(token, payload);
  };

  try {
    return await tryOnce();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("GigaChat chat 401")) {
      invalidateGigaChatAccessTokenCache();
      return tryOnce();
    }
    throw e;
  }
}
