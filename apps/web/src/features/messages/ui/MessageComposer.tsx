"use client";

import { useState, useRef, useCallback } from "react";
import { useSendMessage } from "../hooks/useSendMessage";

interface MessageComposerProps {
  conversationId: string;
  disabled?: boolean;
}

export function MessageComposer({
  conversationId,
  disabled = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage(conversationId);

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;

    sendMessage.mutate(
      {
        content: trimmed,
        clientId: `client-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      {
        onSuccess: () => {
          setContent("");
          inputRef.current?.focus();
        },
      },
    );
  }, [content, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-border bg-surface px-4 py-3">
      <div className="flex items-end gap-2">
        <button
          type="button"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Attach file"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <button
          type="button"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Send image"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message Product..."
            disabled={disabled || sendMessage.isPending}
            rows={1}
            className="w-full px-4 py-2.5 bg-surface-muted border-0 rounded-xl text-sm text-text placeholder:text-text-muted resize-none outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
            style={{ maxHeight: "120px" }}
          />
        </div>

        <button
          type="button"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Add emoji"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>

        <button
          type="button"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Record voice message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim() || sendMessage.isPending || disabled}
          className="shrink-0 w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-text-inverse hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
