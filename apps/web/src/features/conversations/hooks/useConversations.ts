"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { conversationService } from "../services/conversation.service";
import { conversationKeys } from "./conversationKeys";
import type { ConversationDto } from "@repo/shared";

export function useConversations() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<ConversationDto[]>({
    queryKey: conversationKeys.list(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return conversationService.getMyConversations(token);
    },
    enabled: isSignedIn,
    staleTime: 10 * 1000,
  });
}
