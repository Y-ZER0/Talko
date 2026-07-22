"use client";

import { useAuth } from "@clerk/nextjs";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { messageService } from "../services/message.service";
import { messageKeys } from "./messageKeys";
import type { MessagesCursorResponse } from "@repo/shared";

export function useMessages(conversationId: string) {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

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
    select: (data) => {
      const existing = queryClient.getQueryData<InfiniteData<MessagesCursorResponse>>(
        messageKeys.list(conversationId),
      );
      if (!existing?.pages?.length) return data;
      const existingIds = new Set(
        existing.pages.flatMap((p) => p.data.map((m) => m.id)),
      );
      const existingClientIds = new Set(
        existing.pages.flatMap((p) => p.data.map((m) => m.clientId).filter(Boolean)),
      );
      const merged = {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          data: [
            ...page.data,
            ...existing.pages
              .flatMap((p) => p.data)
              .filter(
                (m) =>
                  !existingIds.has(m.id) &&
                  (!m.clientId || !existingClientIds.has(m.clientId)),
              ),
          ],
        })),
      };
      return merged;
    },
  });
}
