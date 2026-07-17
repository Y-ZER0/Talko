"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/shared/ui/components/Avatar";
import { ReadReceiptIcon } from "@/features/receipts/ui/ReadReceiptIcon";
import { ImageAttachmentCard } from "@/features/media/ui/ImageAttachmentCard";
import { FileAttachmentRow } from "@/features/media/ui/FileAttachmentRow";
import { VoiceNoteBubble } from "@/features/media/ui/VoiceNoteBubble";
import { MessageMediaType } from "@repo/shared";
import type { MessageDto } from "@repo/shared";

interface MessageBubbleProps {
  message: MessageDto;
  isOwn: boolean;
  senderName?: string;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  observeRef?: (el: HTMLElement, messageId: string) => () => void;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function AttachmentsRenderer({
  attachments,
  isOwn,
}: {
  attachments: MessageDto["attachments"];
  isOwn: boolean;
}) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {attachments.map((att) => {
        switch (att.mediaType) {
          case MessageMediaType.IMAGE:
          case MessageMediaType.VIDEO:
            return <ImageAttachmentCard key={att.id} attachment={att} />;
          case MessageMediaType.AUDIO:
            return <VoiceNoteBubble key={att.id} attachment={att} isOwn={isOwn} />;
          case MessageMediaType.DOCUMENT:
          default:
            return <FileAttachmentRow key={att.id} attachment={att} />;
        }
      })}
    </div>
  );
}

export function MessageBubble({
  message,
  isOwn,
  senderName = "User",
  showAvatar = true,
  showTimestamp = true,
  observeRef,
}: MessageBubbleProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!observeRef || !wrapperRef.current) return;
    return observeRef(wrapperRef.current, message.id);
  }, [observeRef, message.id]);

  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <div
      ref={wrapperRef}
      className={`flex flex-col gap-1 max-w-[70%] ${
        isOwn ? "self-end items-end" : "self-start items-start"
      }`}
    >
      <div className="flex items-end gap-2">
        {!isOwn && showAvatar && (
          <Avatar name={senderName} userId={message.senderId} size="sm" />
        )}
        <div
          className={
            hasAttachments && !message.content
              ? ""
              : `px-4 py-2.5 ${
                  isOwn
                    ? "bg-primary-500 text-text-inverse rounded-2xl rounded-br-md"
                    : "bg-surface text-text rounded-2xl rounded-bl-md border border-border"
                }`
          }
        >
          {message.content && (
            <p
              className={
                hasAttachments
                  ? "text-sm leading-relaxed whitespace-pre-wrap break-words mb-2"
                  : "text-sm leading-relaxed whitespace-pre-wrap break-words"
              }
            >
              {message.content}
            </p>
          )}
          <AttachmentsRenderer
            attachments={message.attachments}
            isOwn={isOwn}
          />
        </div>
      </div>

      {showTimestamp && (
        <div
          className={`flex items-center gap-1.5 px-1 ${
            isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-mono text-[10px] text-text-muted">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && <ReadReceiptIcon messageId={message.id} />}
        </div>
      )}
    </div>
  );
}
