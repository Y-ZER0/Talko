"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useMessages } from "../hooks/useMessages";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { messageKeys } from "../hooks/messageKeys";
import { MessageBubble } from "./MessageBubble";
import {
  formatDateSeparator,
  shouldShowDateSeparator,
  shouldShowSenderName,
} from "../lib/message-helpers";
import { SocketEvent } from "@repo/shared";
import type { MessageDto, MessagesCursorResponse } from "@repo/shared";

interface MessageListProps {
  conversationId: string;
  currentUserId?: string;
}

export function MessageList({ conversationId, currentUserId }: MessageListProps) {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
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

  useEffect(() => {
    if (!socket) return;

    const handleMessageAck = (payload: { clientId: string; message: MessageDto }) => {
      queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg.clientId === payload.clientId ? payload.message : msg,
              ),
            })),
          };
        },
      );
    };

    const handleNewMessage = (message: MessageDto) => {
      if (message.senderId === effectiveUserId) return;
      queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                if (page.data.some((m) => m.id === message.id || m.clientId === message.clientId)) return page;
                return { ...page, data: [...page.data, message] };
              }
              return page;
            }),
          };
        },
      );
    };

    socket.on(SocketEvent.MESSAGE_ACK, handleMessageAck);
    socket.on(SocketEvent.MESSAGE_NEW, handleNewMessage);
    return () => {
      socket.off(SocketEvent.MESSAGE_ACK, handleMessageAck);
      socket.off(SocketEvent.MESSAGE_NEW, handleNewMessage);
    };
  }, [socket, conversationId, queryClient, effectiveUserId]);

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
