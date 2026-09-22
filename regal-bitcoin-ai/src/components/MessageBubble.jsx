/**
 * Very small markdown-ish renderer — enough for the AI's headers, bold text,
 * bullet lists and tables without pulling in a full markdown dependency.
 */
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function renderBlock(block, idx) {
  const lines = block.split('\n');

  if (lines[0]?.startsWith('## ')) {
    return <h3 key={idx}>{lines[0].replace(/^##\s*/, '')}</h3>;
  }
  if (lines[0]?.startsWith('### ')) {
    return <h4 key={idx}>{lines[0].replace(/^###\s*/, '')}</h4>;
  }
  if (lines.every((l) => l.trim().startsWith('|'))) {
    const rows = lines.filter((l) => !/^\|[\s-]+\|$/.test(l.trim()));
    return (
      <table key={idx} className="msg-table">
        <tbody>
          {rows.map((row, r) => {
            const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
            const Tag = r === 0 ? 'th' : 'td';
            return (
              <tr key={r}>
                {cells.map((cell, c) => (
                  <Tag key={c}>{renderInline(cell)}</Tag>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
  if (lines.every((l) => /^[•\-*]\s/.test(l.trim()) || l.trim() === '')) {
    return (
      <ul key={idx}>
        {lines
          .filter((l) => l.trim())
          .map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^[•\-*]\s*/, ''))}</li>
          ))}
      </ul>
    );
  }
  return <p key={idx}>{renderInline(block)}</p>;
}

function MarkdownLite({ text }) {
  const blocks = text.split(/\n\n+/);
  return <>{blocks.map(renderBlock)}</>;
}

export default function MessageBubble({ role, text, sources }) {
  const isUser = role === 'user';
  return (
    <div className={`msg-row ${isUser ? 'msg-row--user' : 'msg-row--bot'}`}>
      <div className={`msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--bot'}`}>
        <MarkdownLite text={text} />
        {sources?.length > 0 && (
          <div className="msg-sources">
            {sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
