"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import type { ConversationDto } from "@repo/shared";
import { SocketEvent } from "@repo/shared";

interface MessageTimelineProps {
  conversationId: string;
}

export function MessageTimeline({ conversationId }: MessageTimelineProps) {
  const { userId } = useAuth();
  const { socket, joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    joinRoom(conversationId);
    return () => {
      leaveRoom(conversationId);
    };
  }, [conversationId, joinRoom, leaveRoom]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-text-inverse font-semibold text-sm">
            PS
          </div>
          <div>
            <h2 className="font-semibold text-text">Product · Sprint 14</h2>
            <p className="text-xs text-text-muted font-mono uppercase tracking-label">
              Last seen 2h ago
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
            aria-label="Voice call"
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
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
            aria-label="Video call"
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
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
            aria-label="Search"
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
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
            aria-label="More options"
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
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <MessageList
        conversationId={conversationId}
        currentUserId={userId ?? undefined}
      />

      <MessageComposer conversationId={conversationId} />
    </div>
  );
}
