import { useEffect, useRef } from "react";

function renderWithCitations(text, sources) {
  const parts = text.split(/(\[\d{1,2}\])/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[(\d{1,2})\]$/);
    if (!match) return <span key={index}>{part}</span>;
    const source = sources?.[Number(match[1]) - 1];
    if (!source) return <span key={index}>{part}</span>;
    return (
      <a
        key={index}
        className="cite"
        href={source.url}
        target="_blank"
        rel="noreferrer"
        title={source.title}
      >
        {match[1]}
      </a>
    );
  });
}

function Empty({ headlines, onAsk }) {
  const seeds = headlines.slice(0, 3);
  return (
    <div className="empty">
      <p className="empty-lead">
        Pick a story from the wire, or start with one of these.
      </p>
      <div className="seeds">
        {seeds.map((article) => (
          <button
            key={article.url}
            type="button"
            className="seed"
            onClick={() => onAsk(`What is the background to: ${article.title}`)}
          >
            {article.title}
          </button>
        ))}
        <button
          type="button"
          className="seed"
          onClick={() => onAsk("Give me a three-point summary of today's top stories.")}
        >
          Summarise today in three points
        </button>
      </div>
    </div>
  );
}

export default function Thread({ messages, headlines, onAsk }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <section className="thread">
        <Empty headlines={headlines} onAsk={onAsk} />
      </section>
    );
  }

  return (
    <section className="thread">
      {messages.map((message) =>
        message.role === "user" ? (
          <article key={message.id} className="turn turn-user">
            <p>{message.content}</p>
          </article>
        ) : (
          <article key={message.id} className="turn turn-assistant">
            {message.content ? (
              message.content.split("\n\n").map((para, index) => (
                <p key={index}>{renderWithCitations(para, message.sources)}</p>
              ))
            ) : message.error ? (
              <p className="turn-error">{message.error}</p>
            ) : (
              <p className="thinking">Reading the wire…</p>
            )}

            {message.sources?.length > 0 && (
              <details className="sources">
                <summary>{message.sources.length} sources used</summary>
                <ol>
                  {message.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>{" "}
                      <span className="source-name">{source.source}</span>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            {message.meta && (
              <p className="turn-meta">
                {message.meta.provider} / {message.meta.model}
              </p>
            )}
          </article>
        ),
      )}
      <div ref={endRef} />
    </section>
  );
}
