"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SocketEvent } from "@repo/shared";
import { conversationService } from "../services/conversation.service";
import { conversationKeys } from "./conversationKeys";
import { useSocket } from "@/features/presence/hooks/useSocket";
import type { ConversationDto, MessageDto } from "@repo/shared";

export function useConversations() {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const query = useQuery<ConversationDto[]>({
    queryKey: conversationKeys.list(),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return conversationService.getMyConversations(token);
    },
    enabled: isSignedIn,
    staleTime: 10 * 1000,
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewConversation = () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    };

    const handleLeaveConversation = () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    };

    const handleDeletedConversation = () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    };

    const handleMessageNew = (_message: MessageDto) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    };

    socket.on(SocketEvent.CONVERSATION_NEW, handleNewConversation);
    socket.on(SocketEvent.CONVERSATION_LEAVE, handleLeaveConversation);
    socket.on(SocketEvent.CONVERSATION_DELETED, handleDeletedConversation);
    socket.on(SocketEvent.MESSAGE_NEW, handleMessageNew);
    return () => {
      socket.off(SocketEvent.CONVERSATION_NEW, handleNewConversation);
      socket.off(SocketEvent.CONVERSATION_LEAVE, handleLeaveConversation);
      socket.off(SocketEvent.CONVERSATION_DELETED, handleDeletedConversation);
      socket.off(SocketEvent.MESSAGE_NEW, handleMessageNew);
    };
  }, [socket, queryClient]);

  return query;
}
