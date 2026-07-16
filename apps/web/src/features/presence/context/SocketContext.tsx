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
import type { Socket } from "socket.io-client";
import { createSocket, disconnectSocket } from "@/shared/lib/socket-client";
import { SocketEvent } from "@repo/shared";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  activeRooms: string[];
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeRooms, setActiveRooms] = useState<string[]>([]);
  const pendingJoins = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isSignedIn) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      setActiveRooms([]);
      pendingJoins.current.clear();
      return;
    }

    let cancelled = false;

    const initSocket = async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      const s = createSocket(token);
      setSocket(s);

      s.on("connect", () => {
        console.log("[socket] connected", s.id);
        if (cancelled) return;
        setIsConnected(true);
        pendingJoins.current.forEach((roomId) => {
          s.emit(SocketEvent.CONVERSATION_JOIN, { conversationId: roomId });
        });
      });

      s.on("disconnect", (reason) => {
        console.warn("[socket] disconnected, reason:", reason);
        if (!cancelled) setIsConnected(false);
      });

      s.on("connect_error", (err) => {
        console.error("[socket] connect_error:", err.message, err);
        if (!cancelled) setIsConnected(false);
      });

      s.connect();
    };

    initSocket();

    return () => {
      cancelled = true;
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isSignedIn, getToken]);

  const joinRoom = useCallback(
    (conversationId: string) => {
      pendingJoins.current.add(conversationId);
      setActiveRooms(Array.from(pendingJoins.current));
      if (socket?.connected) {
        socket.emit(SocketEvent.CONVERSATION_JOIN, { conversationId });
      }
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (conversationId: string) => {
      pendingJoins.current.delete(conversationId);
      setActiveRooms(Array.from(pendingJoins.current));
      if (socket?.connected) {
        socket.emit(SocketEvent.CONVERSATION_LEAVE, { conversationId });
      }
    },
    [socket],
  );

  const value = useMemo(
    () => ({ socket, isConnected, activeRooms, joinRoom, leaveRoom }),
    [socket, isConnected, activeRooms, joinRoom, leaveRoom],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
