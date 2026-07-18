"use client";

import { useState, useCallback } from "react";
import type { MessageDto } from "@repo/shared";

export interface ReplyTarget {
  messageId: string;
  senderName: string;
  content: string;
}

export function useReplyTo() {
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);

  const startReply = useCallback((message: MessageDto, senderName: string) => {
    setReplyTarget({
      messageId: message.id,
      senderName,
      content: message.content ?? "",
    });
  }, []);

  const cancelReply = useCallback(() => {
    setReplyTarget(null);
  }, []);

  return { replyTarget, startReply, cancelReply };
}
