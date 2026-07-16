"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { useConversation } from "@/features/conversations/hooks/useConversation";
import { getDisplayName } from "@/features/conversations/lib/conversation-helpers";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";

interface MessageTimelineProps {
  conversationId: string;
}

export function MessageTimeline({ conversationId }: MessageTimelineProps) {
  const { userId: clerkId } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const currentUserId = profile?.id ?? clerkId ?? undefined;
  const { socket, joinRoom, leaveRoom } = useSocket();
  const { data: conversation, isLoading } = useConversation(conversationId);

  const displayName = conversation
    ? getDisplayName(conversation, currentUserId)
    : "Chat";

  const otherMember = conversation && !conversation.isGroup
    ? conversation.members.find((m) => m.user.id !== currentUserId)
    : null;

  const avatarLabel = otherMember
    ? otherMember.user.username.charAt(0).toUpperCase()
    : conversation?.groupName?.charAt(0).toUpperCase() ?? "?";

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
            {avatarLabel}
          </div>
          <div>
            <h2 className="font-semibold text-text">
              {isLoading ? "Loading..." : displayName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        currentUserId={currentUserId}
      />

      <MessageComposer conversationId={conversationId} displayName={displayName} currentUserId={currentUserId} />
    </div>
  );
}
