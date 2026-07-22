"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { SocketEvent } from "@repo/shared";
import type { ReceiptUpdateEventPayload, MessageReceiptDto } from "@repo/shared";

type ReceiptMap = Map<string, ReceiptUpdateEventPayload>;

interface ReceiptContextValue {
  getReceipt: (messageId: string) => ReceiptUpdateEventPayload | undefined;
  seedReceipts: (messageReceipts: Map<string, MessageReceiptDto>) => void;
}

export const ReceiptContext = createContext<ReceiptContextValue | null>(null);

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const { socket } = useSocket();
  const [receipts, setReceipts] = useState<ReceiptMap>(new Map());
  const batchRef = useRef<ReceiptUpdateEventPayload[]>([]);
  const flushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushBatch = useCallback(() => {
    if (!batchRef.current.length) return;
    const batch = batchRef.current;
    batchRef.current = [];
    setReceipts((prev) => {
      const next = new Map(prev);
      for (const update of batch) {
        next.set(update.messageId, update);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReceiptUpdate = (updates: ReceiptUpdateEventPayload[]) => {
      batchRef.current.push(...updates);
      if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = setTimeout(flushBatch, 50);
    };

    socket.on(SocketEvent.RECEIPT_UPDATE, handleReceiptUpdate);
    return () => {
      socket.off(SocketEvent.RECEIPT_UPDATE, handleReceiptUpdate);
      if (flushTimeoutRef.current) clearTimeout(flushTimeoutRef.current);
    };
  }, [socket, flushBatch]);

  const seedReceipts = useCallback(
    (messageReceipts: Map<string, MessageReceiptDto>) => {
      setReceipts((prev) => {
        const next = new Map(prev);
        for (const [messageId, receipt] of messageReceipts) {
          if (!next.has(messageId)) {
            next.set(messageId, {
              messageId,
              userId: receipt.userId,
              status: receipt.status as "delivered" | "read",
              readAt: receipt.readAt ?? undefined,
            });
          }
        }
        return next;
      });
    },
    [],
  );

  const getReceipt = useCallback(
    (messageId: string) => receipts.get(messageId),
    [receipts],
  );

  const value = useMemo(() => ({ getReceipt, seedReceipts }), [getReceipt, seedReceipts]);

  return (
    <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>
  );
}
