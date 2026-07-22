"use client";

import { useEffect, useRef } from "react";
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
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;
  const { socket } = useSocket();
  const socketRef = useRef(socket);
  socketRef.current = socket;

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
    const s = socketRef.current;
    const qc = queryClientRef.current;
    if (!s) return;

    const invalidate = () => {
      qc.invalidateQueries({ queryKey: conversationKeys.list() });
    };

    const handleNewConversation = () => invalidate();
    const handleLeaveConversation = () => invalidate();
    const handleDeletedConversation = () => invalidate();
    const handleMessageNew = (_message: MessageDto) => invalidate();
    const handleConversationOpened = () => invalidate();

    s.on(SocketEvent.CONVERSATION_NEW, handleNewConversation);
    s.on(SocketEvent.CONVERSATION_LEAVE, handleLeaveConversation);
    s.on(SocketEvent.CONVERSATION_DELETED, handleDeletedConversation);
    s.on(SocketEvent.MESSAGE_NEW, handleMessageNew);
    s.on(SocketEvent.CONVERSATION_OPENED, handleConversationOpened);

    return () => {
      s.off(SocketEvent.CONVERSATION_NEW, handleNewConversation);
      s.off(SocketEvent.CONVERSATION_LEAVE, handleLeaveConversation);
      s.off(SocketEvent.CONVERSATION_DELETED, handleDeletedConversation);
      s.off(SocketEvent.MESSAGE_NEW, handleMessageNew);
      s.off(SocketEvent.CONVERSATION_OPENED, handleConversationOpened);
    };
  }, [socket]);

  return query;
}
