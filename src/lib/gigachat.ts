/**
 * Минимальная интеграция GigaChat (client credentials).
 * Документация: https://developers.sber.ru/docs/ru/gigachat/api/overview
 */

interface GigaTokenResponse {
  access_token: string;
  expires_at?: number;
}

export async function fetchGigaChatAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const rqUid = crypto.randomUUID();

  const body = new URLSearchParams({
    scope: "GIGACHAT_API_PERS",
    grant_type: "client_credentials",
  });

  const res = await fetch("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${basic}`,
      RqUID: rqUid,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GigaChat OAuth ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as GigaTokenResponse;
  if (!data.access_token) throw new Error("GigaChat: нет access_token");
  return data.access_token;
}

export async function gigachatCompletion(
  accessToken: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const res = await fetch("https://gigachat.devices.sberbank.ru/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      model: "GigaChat",
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GigaChat chat ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("GigaChat: пустой ответ");
  return content;
}
