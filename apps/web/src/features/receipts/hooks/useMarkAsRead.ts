"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { SocketEvent } from "@repo/shared";

export function useMarkAsRead(conversationId: string) {
  const { socket } = useSocket();
  const pendingRef = useRef<Set<string>>(new Set());

  const flush = useMemo(
    () =>
      (() => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        return () => {
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            if (!pendingRef.current.size || !socket) return;
            if (document.hidden) return;
            socket.emit(SocketEvent.RECEIPT_READ, {
              conversationId,
              messageIds: [...pendingRef.current],
            });
            pendingRef.current.clear();
            timeoutId = null;
          }, 500);
        };
      })(),
    [socket, conversationId],
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        flush();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [flush]);

  const observe = useCallback(
    (el: HTMLElement, messageId: string) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            if (!messageId.startsWith("temp-") && !document.hidden) {
              pendingRef.current.add(messageId);
              flush();
            }
            observer.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    },
    [flush],
  );

  return observe;
}
