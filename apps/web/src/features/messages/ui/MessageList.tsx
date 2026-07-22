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
import { useReceipts } from "@/features/receipts/hooks/useReceipts";
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
  onReply?: (message: MessageDto) => void;
  members?: { user: { id: string; username: string } }[];
}

function ReceiptSeeder({ messages }: { messages: MessageDto[] }) {
  const { seedReceipts } = useReceipts();

  useEffect(() => {
    if (messages.length === 0) return;
    const receiptMap = new Map<string, { userId: string; status: string; readAt: string | null }>();
    for (const msg of messages) {
      if (msg.receipts.length > 0) {
        receiptMap.set(msg.id, msg.receipts[0]);
      }
    }
    if (receiptMap.size > 0) seedReceipts(receiptMap);
  }, [messages, seedReceipts]);

  return null;
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
  onReply,
  members,
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
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <div className="w-3.5 h-3.5 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" />
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <ReceiptProvider>
      <ReceiptSeeder messages={sortedMessages} />
      <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-1">
          {hasNextPage && (
            <div ref={sentinelRef} className="py-4 text-center">
              <p className="font-mono text-[10px] text-text-muted tracking-label uppercase">
                {isFetchingNextPage ? "Loading more..." : "Load older messages"}
              </p>
            </div>
          )}

          {sortedMessages.map((message, index) => {
            const previousMessage = sortedMessages[index - 1];
            const isOwn = message.senderId === effectiveUserId;
            const showDate = shouldShowDateSeparator(message, previousMessage);
            const showName = shouldShowSenderName(message, previousMessage, isOwn);
            const member = members?.find((m) => m.user.id === message.senderId);
            const senderName = member?.user.username ?? "User";

            return (
              <div
                key={message.id}
                data-message-id={message.id}
                className={`flex flex-col ${showDate ? "" : showName ? "mt-3" : "mt-0.5"}`}
              >
                {showDate && (
                  <div className="flex items-center justify-center py-5">
                    <span className="font-mono text-[10px] text-text-muted tracking-label uppercase bg-surface-muted px-3 py-1.5 rounded-full">
                      {formatDateSeparator(message.createdAt)}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  senderName={senderName}
                  showAvatar={showName}
                  showTimestamp={showName}
                  observeRef={observe}
                  currentUserId={effectiveUserId ?? undefined}
                  onAddReaction={onAddReaction}
                  onRemoveReaction={onRemoveReaction}
                  onDelete={onDelete}
                  onReply={onReply}
                  editingMessageId={editingMessageId}
                  onStartEdit={onStartEdit}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                />
              </div>
            );
          })}

          {sortedMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text">No messages yet</p>
                <p className="text-xs text-text-muted mt-0.5">Start the conversation!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ReceiptProvider>
  );
}