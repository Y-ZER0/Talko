"use client";

import { useAuth } from "@clerk/nextjs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { messageService } from "../services/message.service";
import { messageKeys } from "./messageKeys";
import type { MessagesCursorResponse } from "@repo/shared";

export function useMessages(conversationId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useInfiniteQuery<MessagesCursorResponse>({
    queryKey: messageKeys.list(conversationId),
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return messageService.getMessages(
        conversationId,
        token,
        pageParam as string | undefined,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isSignedIn && !!conversationId,
  });
}
