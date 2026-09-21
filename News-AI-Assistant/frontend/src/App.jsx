import { useCallback, useEffect, useRef, useState } from "react";
import HeadlineRail from "./components/HeadlineRail.jsx";
import ModelBar from "./components/ModelBar.jsx";
import Thread from "./components/Thread.jsx";
import Composer from "./components/Composer.jsx";
import { getHeadlines, getProviders, getTopics, streamChat } from "./api.js";

export default function App() {
  const [topics, setTopics] = useState(["world"]);
  const [topic, setTopic] = useState("world");
  const [headlines, setHeadlines] = useState([]);
  const [railState, setRailState] = useState("loading");

  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState(null);
  const [model, setModel] = useState(null);

  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [railOpen, setRailOpen] = useState(false);

  const abortRef = useRef(null);

  useEffect(() => {
    getProviders()
      .then((list) => {
        setProviders(list);
        const ready = list.find((item) => item.configured);
        if (ready) {
          setProvider(ready.id);
          setModel(ready.default_model);
        } else {
          setNotice(
            "No model keys detected. Copy .env.example to .env and add one key, then restart the API.",
          );
        }
      })
      .catch(() => setNotice("The API is not responding on port 8000."));

    getTopics()
      .then(setTopics)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRailState("loading");
    getHeadlines(topic)
      .then((items) => {
        if (cancelled) return;
        setHeadlines(items);
        setRailState(items.length ? "ready" : "empty");
      })
      .catch(() => !cancelled && setRailState("error"));
    return () => {
      cancelled = true;
    };
  }, [topic]);

  const send = useCallback(
    async (text) => {
      const question = text.trim();
      if (!question || busy) return;

      setNotice(null);
      setBusy(true);
      setRailOpen(false);

      const history = messages.map(({ role, content }) => ({ role, content }));
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: question },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
          sources: [],
          meta: null,
        },
      ]);

      const patchLast = (patch) =>
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = {
            ...last,
            ...(typeof patch === "function" ? patch(last) : patch),
          };
          return next;
        });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat(
          {
            message: question,
            history,
            provider,
            model,
            topic,
            use_live_news: true,
          },
          {
            onSources: (sources) => patchLast({ sources }),
            onMeta: (meta) => patchLast({ meta }),
            onToken: (token) =>
              patchLast((last) => ({ content: last.content + token })),
            onError: (message) => {
              patchLast({ error: message });
              setNotice(message);
            },
          },
          controller.signal,
        );
      } catch (error) {
        if (error.name !== "AbortError") setNotice(error.message);
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [busy, messages, model, provider, topic],
  );

  const stop = () => abortRef.current?.abort();

  return (
    <div className="shell">
      <aside className={railOpen ? "rail rail-open" : "rail"}>
        <HeadlineRail
          topics={topics}
          topic={topic}
          onTopic={setTopic}
          headlines={headlines}
          state={railState}
          onAsk={send}
        />
      </aside>

      <main className="stage">
        <header className="masthead">
          <div>
            <h1>Beacon</h1>
            <p className="masthead-note">
              Ask about today&rsquo;s news. Answers are built only from the
              headlines showing in the wire.
            </p>
          </div>
          <button
            type="button"
            className="rail-toggle"
            onClick={() => setRailOpen((open) => !open)}
          >
            {railOpen ? "Hide wire" : "Show wire"}
          </button>
        </header>

        <ModelBar
          providers={providers}
          provider={provider}
          model={model}
          onProvider={(id) => {
            setProvider(id);
            const chosen = providers.find((item) => item.id === id);
            setModel(chosen?.default_model ?? null);
          }}
          onModel={setModel}
        />

        {notice && <p className="notice">{notice}</p>}

        <Thread messages={messages} headlines={headlines} onAsk={send} />
        <Composer onSend={send} onStop={stop} busy={busy} />
      </main>
    </div>
  );
}
