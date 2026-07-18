"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { messageService } from "../services/message.service";
import { messageKeys } from "./messageKeys";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { SocketEvent } from "@repo/shared";
import type { MessageDto, MessagesCursorResponse } from "@repo/shared";
import type { SendMessageEventPayload } from "@repo/shared";
import type { SendMessageRequest } from "../services/message.service";

interface MutationContext {
  previousData: InfiniteData<MessagesCursorResponse> | undefined;
}

function sendViaSocket(
  socket: import("socket.io-client").Socket,
  payload: SendMessageEventPayload,
): Promise<MessageDto> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Socket ack timeout"));
    }, 8000);

    const handleAck = (response: { clientId: string; message: MessageDto }) => {
      if (response.clientId !== payload.clientId) return;
      cleanup();
      resolve(response.message);
    };

    const handleError = (error: { message: string }) => {
      cleanup();
      reject(new Error(error.message));
    };

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off(SocketEvent.MESSAGE_ACK, handleAck);
      socket.off(SocketEvent.ERROR, handleError);
    };

    socket.on(SocketEvent.MESSAGE_ACK, handleAck);
    socket.on(SocketEvent.ERROR, handleError);
    socket.emit(SocketEvent.MESSAGE_NEW, payload);
  });
}

export function useSendMessage(conversationId: string, currentUserId?: string) {
  const { getToken, userId: clerkId } = useAuth();
  const effectiveUserId = currentUserId ?? clerkId;
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  return useMutation<MessageDto, Error, SendMessageRequest, MutationContext>({
    mutationFn: async (data) => {
      const payload: SendMessageEventPayload = {
        conversationId,
        content: data.content ?? null,
        parentId: data.parentId,
        clientId: data.clientId,
        attachments: data.attachments,
      };

      if (socket?.connected) {
        try {
          return await sendViaSocket(socket, payload);
        } catch (err) {
          console.error("[sendMessage] socket send failed, falling back to REST:", err);
        }
      }

      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return messageService.sendMessage(conversationId, data, token);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previousData = queryClient.getQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
      );

      const optimisticMessage: MessageDto = {
        id: `temp-${data.clientId}`,
        conversationId,
        senderId: effectiveUserId ?? "",
        parentId: data.parentId ?? null,
        content: data.content ?? null,
        mediaUrl: null,
        mediaType: null,
        attachments: (data.attachments ?? []).map((a, i) => ({
          id: `temp-att-${data.clientId}-${i}`,
          messageId: `temp-${data.clientId}`,
          mediaUrl: a.mediaUrl,
          mediaType: a.mediaType,
          thumbnailUrl: null,
          fileSizeBytes: a.fileSize ?? null,
          createdAt: new Date().toISOString(),
        })),
        reactions: [],
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedAt: null,
        clientId: data.clientId,
      };

      queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) {
            return {
              pages: [{ data: [optimisticMessage], nextCursor: null, hasMore: false }],
              pageParams: [undefined],
            };
          }
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  data: [...page.data, optimisticMessage],
                };
              }
              return page;
            }),
          };
        },
      );

      return { previousData };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((msg) =>
                msg.clientId === variables.clientId ? data : msg,
              ),
            })),
          };
        },
      );
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
