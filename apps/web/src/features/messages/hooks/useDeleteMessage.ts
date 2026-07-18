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

export function useDeleteMessage(conversationId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  return useMutation<MessageDto, Error, { messageId: string }, MutationContext>({
    mutationFn: async ({ messageId }) => {
      if (socket?.connected) {
        return new Promise<MessageDto>((resolve, reject) => {
          const timeout = setTimeout(() => {
            socket.off(SocketEvent.MESSAGE_DELETE, handleDelete);
            socket.off(SocketEvent.ERROR, handleError);
            reject(new Error("Socket timeout"));
          }, 8000);

          const handleDelete = (message: MessageDto) => {
            if (message.id === messageId) {
              clearTimeout(timeout);
              socket.off(SocketEvent.MESSAGE_DELETE, handleDelete);
              socket.off(SocketEvent.ERROR, handleError);
              resolve(message);
            }
          };

          const handleError = (err: { message: string }) => {
            clearTimeout(timeout);
            socket.off(SocketEvent.MESSAGE_DELETE, handleDelete);
            socket.off(SocketEvent.ERROR, handleError);
            reject(new Error(err.message));
          };

          socket.on(SocketEvent.MESSAGE_DELETE, handleDelete);
          socket.on(SocketEvent.ERROR, handleError);
          socket.emit(SocketEvent.MESSAGE_DELETE, { messageId, conversationId });
        }).catch(() => {
          return restFallback(messageId);
        });
      }

      return restFallback(messageId);

      async function restFallback(mid: string) {
        const token = await getToken();
        if (!token) throw new Error("No auth token");
        return messageService.deleteMessage(conversationId, mid, token);
      }
    },
    onMutate: async ({ messageId }) => {
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
                  ? { ...msg, isDeleted: true, content: null, attachments: [] }
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
