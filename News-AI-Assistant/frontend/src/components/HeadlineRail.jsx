export default function HeadlineRail({
  topics,
  topic,
  onTopic,
  headlines,
  state,
  onAsk,
}) {
  return (
    <div className="rail-inner">
      <div className="rail-head">
        <h2>The wire</h2>
        <span className="rail-count">
          {state === "ready" ? `${headlines.length} stories` : ""}
        </span>
      </div>

      <div className="topics" role="tablist" aria-label="News topic">
        {topics.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={name === topic}
            className={name === topic ? "topic topic-on" : "topic"}
            onClick={() => onTopic(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {state === "loading" && <p className="rail-msg">Pulling headlines…</p>}
      {state === "error" && (
        <p className="rail-msg">
          The wire is down. Check that the API is running on port 8000.
        </p>
      )}
      {state === "empty" && (
        <p className="rail-msg">
          Nothing came back for this topic. Try another one.
        </p>
      )}

      <ol className="headlines">
        {headlines.map((article, index) => (
          <li key={article.url} className="headline">
            <span className="headline-index">{index + 1}</span>
            <div>
              <a href={article.url} target="_blank" rel="noreferrer">
                {article.title}
              </a>
              <p className="headline-source">{article.source}</p>
              <button
                type="button"
                className="headline-ask"
                onClick={() => onAsk(`Explain this story: ${article.title}`)}
              >
                Ask about this
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
