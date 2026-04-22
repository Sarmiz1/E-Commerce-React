import React from "react";
import { RefreshCw, Send } from "lucide-react";

const ACCENT = "#5636F3";

export function ChatInput({ input, setInput, handleKey, sendMessage, isLoading, colors, isDark, inputRef }) {
  return (
    <div style={{ padding: "10px 13px 14px", background: colors.surface.primary, borderTop: `1px solid ${colors.border.subtle}`, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: isDark ? colors.surface.tertiary : "#f3f4f6", borderRadius: 20, padding: "7px 7px 7px 15px", border: `1.5px solid ${colors.border.default}`, transition: "border-color 0.2s" }}
        onFocus={() => { }} >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask me anything…"
          disabled={isLoading}
          style={{ flex: 1, background: "transparent", border: "none", fontSize: 13, color: colors.text.primary, outline: "none", fontFamily: "inherit" }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          style={{ width: 34, height: 34, borderRadius: 13, border: "none", background: (input.trim() && !isLoading) ? `linear-gradient(135deg, ${ACCENT}, #7c3aed)` : colors.border.default, cursor: (input.trim() && !isLoading) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}
        >
          {isLoading
            ? <RefreshCw size={14} color="#fff" style={{ animation: "woo-wave 0.9s linear infinite" }} />
            : <Send size={14} color="#fff" fill="#fff" />
          }
        </button>
      </div>
    </div>
  );
}
