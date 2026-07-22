"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { messageKeys } from "./messageKeys";
import { SocketEvent } from "@repo/shared";
import type { MessageDto, MessagesCursorResponse, ReactionDto } from "@repo/shared";

export function useRealtimeMessages(
  conversationId: string,
  effectiveUserId?: string,
) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const updateCache = (
      updater: (msg: MessageDto) => MessageDto | null,
      filter?: (msg: MessageDto) => boolean,
    ) => {
      queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.reduce<MessageDto[]>((acc, msg) => {
                if (filter && !filter(msg)) {
                  acc.push(msg);
                  return acc;
                }
                const updated = updater(msg);
                if (updated) acc.push(updated);
                return acc;
              }, []),
            })),
          };
        },
      );
    };

    const handleMessageAck = (payload: { clientId: string; message: MessageDto }) => {
      updateCache((msg) =>
        msg.clientId === payload.clientId ? payload.message : msg,
      );
    };

    const handleNewMessage = (message: MessageDto) => {
      if (message.senderId === effectiveUserId) return;

      const state = queryClient.getQueryState<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
      );
      const hasData = (state?.data?.pages?.length ?? 0) > 0;

      if (hasData) {
        const exists = state!.data!.pages.some((page) =>
          page.data.some(
            (msg) => msg.id === message.id || msg.clientId === message.clientId,
          ),
        );
        if (!exists) {
          queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
            messageKeys.list(conversationId),
            (old) => {
              if (!old) return old;
              return {
                ...old,
                pages: old.pages.map((page, index) =>
                  index === 0 ? { ...page, data: [...page.data, message] } : page,
                ),
              };
            },
          );
        }
      }
    };

    const handleEdit = (message: MessageDto) => {
      updateCache((msg) => (msg.id === message.id ? message : msg));
    };

    const handleDelete = (message: MessageDto) => {
      updateCache((msg) => (msg.id === message.id ? message : msg));
    };

    const handleReactionAdd = (payload: {
      messageId: string;
      conversationId: string;
      emoji: string;
      reaction: ReactionDto;
    }) => {
      updateCache((msg) => {
        if (msg.id !== payload.messageId) return msg;
        const filtered = msg.reactions.filter(
          (r) => r.userId !== payload.reaction.userId,
        );
        return { ...msg, reactions: [...filtered, payload.reaction] };
      });
    };

    const handleReactionRemove = (payload: {
      messageId: string;
      conversationId: string;
      emoji: string;
      userId: string;
    }) => {
      updateCache((msg) => {
        if (msg.id !== payload.messageId) return msg;
        return {
          ...msg,
          reactions: msg.reactions.filter(
            (r) => !(r.userId === payload.userId && r.emoji === payload.emoji),
          ),
        };
      });
    };

    socket.on(SocketEvent.MESSAGE_ACK, handleMessageAck);
    socket.on(SocketEvent.MESSAGE_NEW, handleNewMessage);
    socket.on(SocketEvent.MESSAGE_EDIT, handleEdit);
    socket.on(SocketEvent.MESSAGE_DELETE, handleDelete);
    socket.on(SocketEvent.REACTION_ADD, handleReactionAdd);
    socket.on(SocketEvent.REACTION_REMOVE, handleReactionRemove);

    return () => {
      socket.off(SocketEvent.MESSAGE_ACK, handleMessageAck);
      socket.off(SocketEvent.MESSAGE_NEW, handleNewMessage);
      socket.off(SocketEvent.MESSAGE_EDIT, handleEdit);
      socket.off(SocketEvent.MESSAGE_DELETE, handleDelete);
      socket.off(SocketEvent.REACTION_ADD, handleReactionAdd);
      socket.off(SocketEvent.REACTION_REMOVE, handleReactionRemove);
    };
  }, [socket, conversationId, queryClient, effectiveUserId]);
}
