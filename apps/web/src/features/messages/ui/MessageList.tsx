"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMessages } from "../hooks/useMessages";
import { useRealtimeMessages } from "../hooks/useRealtimeMessages";
import { MessageBubble } from "./MessageBubble";
import {
  formatDateSeparator,
  shouldShowDateSeparator,
  shouldShowSenderName,
} from "../lib/message-helpers";
import type { MessageDto } from "@repo/shared";
import { ReceiptProvider } from "@/features/receipts/context/ReceiptContext";
import { useMarkAsRead } from "@/features/receipts/hooks/useMarkAsRead";

interface MessageListProps {
  conversationId: string;
  currentUserId?: string;
  editingMessageId?: string;
  scrollToMessageId?: string;
  onStartEdit?: (messageId: string) => void;
  onSaveEdit?: (messageId: string, content: string) => void;
  onCancelEdit?: () => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageList({
  conversationId,
  currentUserId,
  editingMessageId,
  scrollToMessageId,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onAddReaction,
  onRemoveReaction,
  onDelete,
}: MessageListProps) {
  const { userId } = useAuth();
  const effectiveUserId = currentUserId ?? userId;
  const observe = useMarkAsRead(conversationId);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMessages(conversationId);

  useRealtimeMessages(conversationId, effectiveUserId ?? undefined);

  const messages = data?.pages.flatMap((page) => page.data) ?? [];
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !initialLoadDone.current) {
      initialLoadDone.current = true;
      scrollToBottom();
    }
  }, [isLoading, scrollToBottom]);

  useEffect(() => {
    if (!scrollToMessageId || isLoading) return;
    const timer = setTimeout(() => {
      const el = containerRef.current?.querySelector(
        `[data-message-id="${scrollToMessageId}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary-500/30", "rounded-lg");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary-500/30", "rounded-lg");
        }, 2000);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [scrollToMessageId, isLoading]);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: containerRef.current, rootMargin: "100px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading messages...</p>
      </div>
    );
  }

  return (
    <ReceiptProvider>
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex flex-col gap-1">
          {hasNextPage && (
            <div ref={sentinelRef} className="py-4 text-center">
              <p className="text-text-muted text-xs">
                {isFetchingNextPage ? "Loading more..." : "Load older messages"}
              </p>
            </div>
          )}

          {sortedMessages.map((message, index) => {
            const previousMessage = sortedMessages[index - 1];
            const isOwn = message.senderId === effectiveUserId;
            const showDate = shouldShowDateSeparator(message, previousMessage);
            const showName = shouldShowSenderName(message, previousMessage, isOwn);

            return (
              <div key={message.id} data-message-id={message.id} className="flex flex-col">
                {showDate && (
                  <div className="flex items-center justify-center py-4">
                    <span className="font-mono text-[10px] text-text-muted tracking-wider bg-surface-muted px-3 py-1 rounded-full">
                      {formatDateSeparator(message.createdAt)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showName}
                  showTimestamp={showName}
                  observeRef={observe}
                  currentUserId={effectiveUserId ?? undefined}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  onDelete={onDelete}
                  editingMessageId={editingMessageId}
                  onStartEdit={onStartEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                />
              </div>
            );
          })}

          {sortedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          )}
        </div>
      </div>
    </ReceiptProvider>
  );
}
