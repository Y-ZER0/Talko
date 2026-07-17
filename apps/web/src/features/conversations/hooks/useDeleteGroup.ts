"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { conversationService } from "../services/conversation.service";
import { conversationKeys } from "./conversationKeys";

export function useDeleteGroup() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, string>({
    mutationFn: async (conversationId) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return conversationService.deleteGroup(conversationId, token);
    },
    onSuccess: (_data, conversationId) => {
      const chatPath = `/${conversationId}`;
      if (window.location.pathname.endsWith(chatPath)) {
        router.push("/");
      }
      queryClient.setQueryData<{ id: string }[]>(
        conversationKeys.list(),
        (old) => old?.filter((c) => c.id !== conversationId) ?? [],
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });
}