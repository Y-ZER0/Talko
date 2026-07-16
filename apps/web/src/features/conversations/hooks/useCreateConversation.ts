"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "../services/conversation.service";
import { conversationKeys } from "./conversationKeys";
import type {
  CreateConversationResponseDto,
  ConversationDto,
} from "@repo/shared";
import type { CreateConversationRequest } from "../services/conversation.service";

export function useCreateConversation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    CreateConversationResponseDto,
    Error,
    CreateConversationRequest
  >({
    mutationFn: async (data) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return conversationService.createConversation(data, token);
    },
    onSuccess: (newConversation) => {
      queryClient.setQueryData<ConversationDto[]>(
        conversationKeys.list(),
        (old) => {
          if (!old) return [newConversation as ConversationDto];
          const exists = old.some((c) => c.id === newConversation.id);
          if (exists) return old;
          return [newConversation as ConversationDto, ...old];
        },
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });
}
