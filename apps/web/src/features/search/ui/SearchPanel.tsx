"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearchMessages } from "../hooks/useSearchMessages";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useConversations } from "@/features/conversations/hooks/useConversations";
import { getDisplayName } from "@/features/conversations/lib/conversation-helpers";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onResultClick?: (conversationId: string, messageId: string) => void;
}

function highlightMatch(text: string, query: string): { text: string; isMatch: boolean }[] {
  if (!query.trim()) return [{ text, isMatch: false }];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part) => ({
    text: part,
    isMatch: regex.test(part) && (regex.lastIndex = 0, true),
  }));
}

function formatSearchTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SearchPanel({
  isOpen,
  onClose,
  currentUserId,
  onResultClick,
}: SearchPanelProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: results, isLoading } = useSearchMessages(debouncedQuery);
  const { data: conversations } = useConversations();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const getConversationName = useCallback(
    (conversationId: string) => {
      const conv = conversations?.find((c) => c.id === conversationId);
      if (!conv) return "Conversation";
      return getDisplayName(conv, currentUserId);
    },
    [conversations, currentUserId],
  );

  const handleResultClick = useCallback(
    (conversationId: string, messageId: string) => {
      if (onResultClick) {
        onResultClick(conversationId, messageId);
      } else {
        router.push(`/${conversationId}?messageId=${messageId}`);
      }
      onClose();
    },
    [router, onResultClick, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface-muted border border-border rounded-xl font-sans text-sm text-text placeholder:text-text-muted outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Close search"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {debouncedQuery.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <svg
              className="mb-3 opacity-40"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-sm">Type at least 2 characters to search</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-[3px] border-border border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : results && results.length > 0 ? (
          <div className="py-2">
            {results.map((result) => (
              <button
                key={result.messageId}
                type="button"
                onClick={() =>
                  handleResultClick(result.conversationId, result.messageId)
                }
                className="w-full text-left px-4 py-3 hover:bg-surface-muted transition-colors cursor-pointer border-b border-border/50 last:border-b-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-text">
                    {result.senderName}
                  </span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {formatSearchTimestamp(result.messageTimestamp)}
                  </span>
                </div>
                <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                  {highlightMatch(result.messageContent, debouncedQuery).map(
                    (part, i) =>
                      part.isMatch ? (
                        <mark
                          key={i}
                          className="bg-primary-500/15 text-primary-600 rounded-sm px-0.5"
                        >
                          {part.text}
                        </mark>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                  )}
                </p>
                <p className="text-[10px] font-mono text-text-muted mt-1 tracking-wide uppercase">
                  {getConversationName(result.conversationId)}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <svg
              className="mb-3 opacity-40"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-sm">No messages found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
