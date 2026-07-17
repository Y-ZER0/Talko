"use client";

import { useMemo } from "react";
import { useMessages } from "@/features/messages/hooks/useMessages";
import type { MessageAttachmentDto } from "@repo/shared";
import { MessageMediaType } from "@repo/shared";

export function useConversationAttachments(conversationId: string) {
  const { data } = useMessages(conversationId);

  return useMemo(() => {
    const messages = data?.pages.flatMap((page) => page.data) ?? [];
    const allAttachments: MessageAttachmentDto[] = [];
    const seen = new Set<string>();

    for (const msg of messages) {
      for (const att of msg.attachments) {
        if (!seen.has(att.id)) {
          seen.add(att.id);
          allAttachments.push(att);
        }
      }
    }

    const images = allAttachments.filter(
      (a) => a.mediaType === MessageMediaType.IMAGE || a.mediaType === MessageMediaType.VIDEO,
    );

    const files = allAttachments.filter(
      (a) => a.mediaType === MessageMediaType.DOCUMENT,
    );

    return { images, files, all: allAttachments };
  }, [data]);
}
