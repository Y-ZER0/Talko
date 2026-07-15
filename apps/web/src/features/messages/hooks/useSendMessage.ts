"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageService } from "../services/message.service";
import { messageKeys } from "./messageKeys";
import type { MessageDto, MessagesCursorResponse } from "@repo/shared";
import type { SendMessageRequest } from "../services/message.service";

interface MutationContext {
  previousMessages: MessagesCursorResponse | undefined;
}

export function useSendMessage(conversationId: string) {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MessageDto, Error, SendMessageRequest, MutationContext>({
    mutationFn: async (data) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return messageService.sendMessage(conversationId, data, token);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previousMessages = queryClient.getQueryData<MessagesCursorResponse>(
        messageKeys.list(conversationId),
      );

      const optimisticMessage: MessageDto = {
        id: `temp-${data.clientId}`,
        conversationId,
        senderId: userId ?? "",
        parentId: data.parentId ?? null,
        content: data.content ?? null,
        mediaUrl: data.mediaUrl ?? null,
        mediaType: data.mediaType ?? null,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedAt: null,
        clientId: data.clientId,
      };

      queryClient.setQueryData<MessagesCursorResponse>(
        messageKeys.list(conversationId),
        (old) => {
          if (!old) {
            return {
              data: [optimisticMessage],
              nextCursor: null,
              hasMore: false,
            };
          }
          return {
            ...old,
            data: [...old.data, optimisticMessage],
          };
        },
      );

      return { previousMessages };
    },
    onError: (_err, _data, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(conversationId),
      });
    },
  });
}
