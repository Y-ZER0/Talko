"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { conversationService } from "../services/conversation.service";
import { conversationKeys } from "./conversationKeys";

export function useConversation(conversationId: string | undefined) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: [...conversationKeys.all, "detail", conversationId] as const,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return conversationService.getConversation(conversationId!, token);
    },
    enabled: isSignedIn && !!conversationId,
    staleTime: 10 * 1000,
  });
}
