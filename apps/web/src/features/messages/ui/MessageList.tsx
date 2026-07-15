"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMessages } from "../hooks/useMessages";
import { MessageBubble } from "./MessageBubble";
import type { MessageDto } from "@repo/shared";

interface MessageListProps {
  conversationId: string;
  currentUserId?: string;
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return "TODAY";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.getTime() === yesterday.getTime()) {
    return "YESTERDAY";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

function shouldShowDateSeparator(
  current: MessageDto,
  previous: MessageDto | undefined,
): boolean {
  if (!previous) return true;

  const currentDate = new Date(current.createdAt);
  const previousDate = new Date(previous.createdAt);

  return (
    currentDate.getFullYear() !== previousDate.getFullYear() ||
    currentDate.getMonth() !== previousDate.getMonth() ||
    currentDate.getDate() !== previousDate.getDate()
  );
}

function shouldShowSenderName(
  current: MessageDto,
  previous: MessageDto | undefined,
  isOwn: boolean,
): boolean {
  if (isOwn) return false;
  if (!previous) return true;
  if (previous.senderId !== current.senderId) return true;

  const currentDate = new Date(current.createdAt);
  const previousDate = new Date(previous.createdAt);
  const timeDiff = currentDate.getTime() - previousDate.getTime();
  const fiveMinutes = 5 * 60 * 1000;

  return timeDiff > fiveMinutes;
}

export function MessageList({ conversationId, currentUserId }: MessageListProps) {
  const { getToken, userId } = useAuth();
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMessages(conversationId);

  const effectiveUserId = currentUserId ?? userId;

  const messages = data?.pages.flatMap((page) => page.data) ?? [];
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isFetchingNextPage) {
      scrollToBottom();
    }
  }, [isLoading, isFetchingNextPage, scrollToBottom]);

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: containerRef.current,
        rootMargin: "100px",
      },
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
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2"
    >
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
          const showName = shouldShowSenderName(
            message,
            previousMessage,
            isOwn,
          );

          return (
            <div key={message.id} className="flex flex-col">
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
  );
}
