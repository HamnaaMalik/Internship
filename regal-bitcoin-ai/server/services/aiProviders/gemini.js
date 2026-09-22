import { config } from '../../config/env.js';
import { buildSystemPrompt, normalizeHistory } from '../../utils/promptBuilder.js';

function toGeminiHistory(history) {
  return history.map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.text }],
  }));
}

export async function askGemini({ message, market, conversation, newsQuestion }) {
  const history = normalizeHistory(conversation, config.chatHistoryLimit);

  const body = {
    systemInstruction: { parts: [{ text: buildSystemPrompt(market, newsQuestion) }] },
    contents: [...toGeminiHistory(history), { role: 'user', parts: [{ text: message }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: config.chatMaxOutputTokens,
    },
  };

  if (newsQuestion) body.tools = [{ google_search: {} }];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      config.gemini.model
    )}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.gemini.apiKey },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify(body),
    }
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `Gemini request failed with status ${res.status}`);
  }

  const reply = (json?.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || '')
    .join('')
    .trim();

  if (!reply) throw new Error('Gemini returned an empty response.');

  const grounding = json?.candidates?.[0]?.groundingMetadata;
  const sources = (grounding?.groundingChunks || [])
    .map((chunk) => chunk?.web)
    .filter(Boolean)
    .slice(0, 3)
    .map((web) => ({ title: web.title || 'Source', url: web.uri || '' }))
    .filter((s) => s.url);

  return { reply, sources };
}
