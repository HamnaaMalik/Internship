import { useState } from "react";

export default function Composer({ onSend, onStop, busy }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim() || busy) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="composer">
      <textarea
        rows={2}
        value={text}
        placeholder="Ask about a story in the wire"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      {busy ? (
        <button type="button" className="send send-stop" onClick={onStop}>
          Stop
        </button>
      ) : (
        <button
          type="button"
          className="send"
          onClick={submit}
          disabled={!text.trim()}
        >
          Ask
        </button>
      )}
    </div>
  );
}
