import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client.js';
import MessageBubble from './MessageBubble.jsx';

const WELCOME = {
  role: 'bot',
  text: "👋 **Hi, I'm Regal AI.** Ask me about live prices, coin fundamentals, trading strategy, risk management, DeFi, or wallet security.",
};

export default function ChatPanel({ market }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = { role: 'user', text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const { reply, sources } = await api.chat({
        message: text,
        market,
        conversation: nextMessages.slice(-8),
      });
      setMessages((prev) => [...prev, { role: 'bot', text: reply, sources }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: `Sorry, something went wrong: ${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel__header">
        <span className="chat-panel__dot" />
        Regal AI
      </div>

      <div className="chat-panel__messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} sources={m.sources} />
        ))}
        {sending && (
          <div className="msg-row msg-row--bot">
            <div className="msg-bubble msg-bubble--bot typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      <div className="chat-panel__input">
        <textarea
          rows={1}
          value={input}
          placeholder="Ask about prices, trading, DeFi, security…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button onClick={send} disabled={sending || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
