import { config } from '../../config/env.js';
import { buildSystemPrompt, normalizeHistory } from '../../utils/promptBuilder.js';

function toOpenAiHistory(history) {
  return history.map((item) => ({ role: item.role, content: item.text }));
}

export async function askOpenAI({ message, market, conversation, newsQuestion }) {
  const history = normalizeHistory(conversation, config.chatHistoryLimit);

  const body = {
    model: config.openai.model,
    temperature: 0.2,
    max_tokens: config.chatMaxOutputTokens,
    messages: [
      { role: 'system', content: buildSystemPrompt(market, newsQuestion) },
      ...toOpenAiHistory(history),
      { role: 'user', content: message },
    ],
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openai.apiKey}`,
    },
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `OpenAI request failed with status ${res.status}`);
  }

  const reply = json?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('OpenAI returned an empty response.');

  // Note: plain chat completions have no built-in web search grounding,
  // so news questions are answered from the model's own knowledge here.
  return { reply, sources: [] };
}
