"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { usePresence } from "@/features/presence/hooks/usePresence";
import { formatLastSeen } from "@/features/presence/lib/presence-helpers";
import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { useConversation } from "@/features/conversations/hooks/useConversation";
import { getDisplayName } from "@/features/conversations/lib/conversation-helpers";
import { SharedMediaPanel } from "@/features/media/ui/SharedMediaPanel";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { SocketEvent } from "@repo/shared";

interface MessageTimelineProps {
  conversationId: string;
}

export function MessageTimeline({ conversationId }: MessageTimelineProps) {
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const { userId: clerkId } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const currentUserId = profile?.id ?? clerkId ?? undefined;
  const { socket, joinRoom, leaveRoom } = useSocket();
  const { isOnline, getLastSeen } = usePresence();
  const { data: conversation, isLoading } = useConversation(conversationId);

  const displayName = conversation
    ? getDisplayName(conversation, currentUserId)
    : "Chat";

  const otherMember = conversation && !conversation.isGroup
    ? conversation.members.find((m) => m.user.id !== currentUserId)
    : null;

  const otherUserId = otherMember?.user.id;

  const avatarLabel = otherMember
    ? otherMember.user.username.charAt(0).toUpperCase()
    : conversation?.groupName?.charAt(0).toUpperCase() ?? "?";

  useEffect(() => {
    joinRoom(conversationId);
    if (socket?.connected) {
      socket.emit(SocketEvent.CONVERSATION_OPEN, { conversationId });
    }
    return () => {
      leaveRoom(conversationId);
    };
  }, [conversationId, joinRoom, leaveRoom, socket]);

  const online = otherUserId ? isOnline(otherUserId) : false;
  const lastSeen = otherUserId ? getLastSeen(otherUserId) : undefined;

  const statusText = !conversation?.isGroup
    ? online
      ? "Online"
      : lastSeen
        ? formatLastSeen(lastSeen)
        : undefined
    : undefined;

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-text-inverse font-semibold text-sm">
              {avatarLabel}
            </div>
            <div>
              <h2 className="font-semibold text-text">
                {isLoading ? "Loading..." : displayName}
              </h2>
              {statusText && (
                <p
                  className={`text-xs ${
                    online ? "text-online" : "text-text-muted"
                  }`}
                >
                  {statusText}
                </p>
              )}
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
              onClick={() => setInfoPanelOpen((p) => !p)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                infoPanelOpen
                  ? "bg-primary-500 text-text-inverse"
                  : "text-text-muted hover:bg-surface-muted"
              }`}
              aria-label={infoPanelOpen ? "Close info panel" : "Open info panel"}
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

      {infoPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setInfoPanelOpen(false)}
          />
          <div className="hidden lg:block w-[320px] shrink-0 border-l border-border">
            <SharedMediaPanel conversationId={conversationId} />
          </div>
          <div className="fixed right-0 top-0 bottom-0 z-50 w-[320px] lg:hidden">
            <SharedMediaPanel
              conversationId={conversationId}
              onClose={() => setInfoPanelOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
