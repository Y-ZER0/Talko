"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { messageService } from "../services/message.service";
import { messageKeys } from "./messageKeys";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { SocketEvent } from "@repo/shared";
import type { MessageDto, MessagesCursorResponse, ReactionDto } from "@repo/shared";

interface MutationContext {
  previousData: InfiniteData<MessagesCursorResponse> | undefined;
}

export function useReaction(conversationId: string, currentUserId?: string) {
  const { getToken, userId: clerkId } = useAuth();
  const effectiveUserId = currentUserId ?? clerkId;
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const updateCache = (messageId: string, emoji: string, add: boolean) => {
    queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
      messageKeys.list(conversationId),
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((msg) => {
              if (msg.id !== messageId) return msg;
              if (add) {
                const filtered = msg.reactions.filter(
                  (r) => r.userId !== effectiveUserId,
                );
                const newReaction: ReactionDto = {
                  id: `temp-${Date.now()}`,
                  messageId,
                  userId: effectiveUserId ?? "",
                  emoji,
                  createdAt: new Date().toISOString(),
                };
                return { ...msg, reactions: [...filtered, newReaction] };
              }
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  (r) => !(r.userId === effectiveUserId && r.emoji === emoji),
                ),
              };
            }),
          })),
        };
      },
    );
  };

  const addReaction = useMutation<void, Error, { messageId: string; emoji: string }, MutationContext>({
    mutationFn: async ({ messageId, emoji }) => {
      updateCache(messageId, emoji, true);

      if (socket?.connected) {
        socket.emit(SocketEvent.REACTION_ADD, {
          messageId,
          conversationId,
          emoji,
        });
        return;
      }

      const token = await getToken();
      if (!token) throw new Error("No auth token");
      await messageService.addReaction(conversationId, messageId, emoji, token);
    },
    onError: (_err, _data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previousData,
        );
      }
    },
  });

  const removeReaction = useMutation<void, Error, { messageId: string; emoji: string }, MutationContext>({
    mutationFn: async ({ messageId, emoji }) => {
      updateCache(messageId, emoji, false);

      if (socket?.connected) {
        socket.emit(SocketEvent.REACTION_REMOVE, {
          messageId,
          conversationId,
          emoji,
        });
        return;
      }

      const token = await getToken();
      if (!token) throw new Error("No auth token");
      await messageService.removeReaction(conversationId, messageId, emoji, token);
    },
    onError: (_err, _data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previousData,
        );
      }
    },
  });

  return { addReaction, removeReaction };
}
