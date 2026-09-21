const BASE = "/api";

async function getJSON(path) {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

async function readError(response) {
  try {
    const body = await response.json();
    return body.detail || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export const getProviders = () => getJSON("/providers");
export const getTopics = () => getJSON("/topics");
export const getHeadlines = (topic) =>
  getJSON(`/headlines?topic=${encodeURIComponent(topic)}&limit=8`);

/**
 * Streams an answer. Calls handlers as server-sent events arrive.
 * handlers: { onSources, onMeta, onToken, onError, onDone }
 */
export async function streamChat(payload, handlers, signal) {
  const response = await fetch(`${BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    handlers.onError?.(await readError(response));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      let event = "message";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      if (event === "sources") handlers.onSources?.(parsed.sources ?? []);
      else if (event === "meta") handlers.onMeta?.(parsed);
      else if (event === "token") handlers.onToken?.(parsed.text ?? "");
      else if (event === "error") handlers.onError?.(parsed.message);
      else if (event === "done") handlers.onDone?.();
    }
  }
}
