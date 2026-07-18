"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { messageService } from "../services/message.service";
import { messageKeys } from "./messageKeys";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { SocketEvent } from "@repo/shared";
import type { MessageDto, MessagesCursorResponse } from "@repo/shared";

interface MutationContext {
  previousData: InfiniteData<MessagesCursorResponse> | undefined;
}

export function useEditMessage(conversationId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  return useMutation<MessageDto, Error, { messageId: string; content: string }, MutationContext>({
    mutationFn: async ({ messageId, content }) => {
      if (socket?.connected) {
        return new Promise<MessageDto>((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.off(SocketEvent.MESSAGE_EDIT, handleEdit);
            socket.off(SocketEvent.ERROR, handleError);
            reject(new Error("Socket timeout"));
          }, 8000);

          const handleEdit = (message: MessageDto) => {
            if (message.id === messageId) {
              clearTimeout(timeout);
              socket.off(SocketEvent.MESSAGE_EDIT, handleEdit);
              socket.off(SocketEvent.ERROR, handleError);
              resolve(message);
            }
          };

          const handleError = (err: { message: string }) => {
            clearTimeout(timeout);
            socket.off(SocketEvent.MESSAGE_EDIT, handleEdit);
            socket.off(SocketEvent.ERROR, handleError);
            reject(new Error(err.message));
          };

          socket.on(SocketEvent.MESSAGE_EDIT, handleEdit);
          socket.on(SocketEvent.ERROR, handleError);
          socket.emit(SocketEvent.MESSAGE_EDIT, { messageId, content });
        }).catch(() => {
          return restFallback(messageId, content);
        });
      }

      return restFallback(messageId, content);

      async function restFallback(mid: string, c: string) {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return messageService.editMessage(conversationId, mid, c, token);
      }
    },
    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previousData = queryClient.getQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
      );

      queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg.id === messageId
                  ? { ...msg, content, editedAt: new Date().toISOString() }
                  : msg,
              ),
            })),
          };
        },
      );

      return { previousData };
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
}
