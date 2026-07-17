"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SocketEvent } from "@repo/shared";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { conversationKeys } from "@/features/conversations/hooks/conversationKeys";
import type { ConversationDto, TypingEventPayload } from "@repo/shared";

export interface TypingUser {
  userId: string;
  username: string;
}

interface TypingEntry {
  username: string;
  timeout: ReturnType<typeof setTimeout>;
}

interface TypingContextValue {
  getTypingUsers: (conversationId: string) => TypingUser[];
}

export const TypingContext = createContext<TypingContextValue | null>(null);

const TYPING_AUTO_EXPIRE_MS = 5_000;

export function TypingProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const typingMapRef = useRef<Map<string, Map<string, TypingEntry>>>(
    new Map(),
  );
  const [, forceRender] = useState(0);

  const resolveUsername = useCallback(
    (conversationId: string, userId: string): string => {
      const conversations = queryClient.getQueryData<ConversationDto[]>(
        conversationKeys.list(),
      );
      const conversation = conversations?.find((c) => c.id === conversationId);
      const member = conversation?.members.find((m) => m.user.id === userId);
      return member?.user.username ?? "Someone";
    },
    [queryClient],
  );

  const addTypingUser = useCallback(
    (conversationId: string, userId: string) => {
      const existing = typingMapRef.current
        .get(conversationId)
        ?.get(userId);
      if (existing) {
        clearTimeout(existing.timeout);
      }

      const username = resolveUsername(conversationId, userId);
      const timeout = setTimeout(() => {
        removeTypingUser(conversationId, userId);
      }, TYPING_AUTO_EXPIRE_MS);

      if (!typingMapRef.current.has(conversationId)) {
        typingMapRef.current.set(conversationId, new Map());
      }
      typingMapRef.current.get(conversationId)!.set(userId, {
        username,
        timeout,
      });
      forceRender((n) => n + 1);
    },
    [resolveUsername],
  );

  const removeTypingUser = useCallback(
    (conversationId: string, userId: string) => {
      const entry = typingMapRef.current.get(conversationId)?.get(userId);
      if (entry) {
        clearTimeout(entry.timeout);
        typingMapRef.current.get(conversationId)!.delete(userId);
        if (typingMapRef.current.get(conversationId)!.size === 0) {
          typingMapRef.current.delete(conversationId);
        }
        forceRender((n) => n + 1);
      }
    },
    [],
  );

  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = (payload: TypingEventPayload) => {
      addTypingUser(payload.conversationId, payload.userId);
    };

    const handleTypingStop = (payload: TypingEventPayload) => {
      removeTypingUser(payload.conversationId, payload.userId);
    };

    socket.on(SocketEvent.TYPING_START, handleTypingStart);
    socket.on(SocketEvent.TYPING_STOP, handleTypingStop);

    return () => {
      socket.off(SocketEvent.TYPING_START, handleTypingStart);
      socket.off(SocketEvent.TYPING_STOP, handleTypingStop);
    };
  }, [socket, addTypingUser, removeTypingUser]);

  const getTypingUsers = useCallback(
    (conversationId: string): TypingUser[] => {
      const entries = typingMapRef.current.get(conversationId);
      if (!entries || entries.size === 0) return [];
      return Array.from(entries.entries()).map(([userId, entry]) => ({
        userId,
        username: entry.username,
      }));
    },
    [],
  );

  return (
    <TypingContext.Provider value={{ getTypingUsers }}>
      {children}
    </TypingContext.Provider>
  );
}
