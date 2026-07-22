"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useSocket } from "../hooks/useSocket";
import { presenceService } from "../services/presence.service";
import { SocketEvent } from "@repo/shared";
import type { PresenceEventPayload } from "@repo/shared";

interface PresenceContextValue {
  getPresence: (userId: string) => PresenceEventPayload | undefined;
  isOnline: (userId: string) => boolean;
  getLastSeen: (userId: string) => string | undefined;
  fetchPresence: (userId: string) => Promise<void>;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);

const PING_INTERVAL_MS = 30_000;

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const { socket } = useSocket();
  const [presenceMap, setPresenceMap] = useState<
    Map<string, PresenceEventPayload>
  >(new Map());
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handlePresenceUpdate = (payload: PresenceEventPayload) => {
      setPresenceMap((prev) => {
        const next = new Map(prev);
        next.set(payload.userId, payload);
        return next;
      });
    };

    socket.on(SocketEvent.PRESENCE_UPDATE, handlePresenceUpdate);

    return () => {
      socket.off(SocketEvent.PRESENCE_UPDATE, handlePresenceUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket?.connected) {
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
      return;
    }

    pingRef.current = setInterval(() => {
      socket.emit(SocketEvent.PING);
    }, PING_INTERVAL_MS);

    return () => {
      if (pingRef.current) {
        clearInterval(pingRef.current);
        pingRef.current = null;
      }
    };
  }, [socket?.connected]);

  const fetchPresence = useCallback(
    async (userId: string) => {
      try {
        const token = await getToken();
        if (!token) return;
        const presence = await presenceService.getPresence(userId, token);
        setPresenceMap((prev) => {
          const next = new Map(prev);
          next.set(userId, presence);
          return next;
        });
      } catch {
        // ignore
      }
    },
    [getToken],
  );

  const getPresence = useCallback(
    (userId: string) => presenceMap.get(userId),
    [presenceMap],
  );

  const isOnline = useCallback(
    (userId: string) => presenceMap.get(userId)?.status === "online",
    [presenceMap],
  );

  const getLastSeen = useCallback(
    (userId: string) => presenceMap.get(userId)?.lastSeen,
    [presenceMap],
  );

  const value = useMemo(
    () => ({ getPresence, isOnline, getLastSeen, fetchPresence }),
    [getPresence, isOnline, getLastSeen, fetchPresence],
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}
