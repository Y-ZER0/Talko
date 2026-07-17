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
import { useSocket } from "../hooks/useSocket";
import { SocketEvent } from "@repo/shared";
import type { PresenceEventPayload } from "@repo/shared";

interface PresenceContextValue {
  getPresence: (userId: string) => PresenceEventPayload | undefined;
  isOnline: (userId: string) => boolean;
  getLastSeen: (userId: string) => string | undefined;
}

export const PresenceContext = createContext<PresenceContextValue | null>(null);

const PING_INTERVAL_MS = 30_000;

export function PresenceProvider({ children }: { children: ReactNode }) {
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
    () => ({ getPresence, isOnline, getLastSeen }),
    [getPresence, isOnline, getLastSeen],
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}
