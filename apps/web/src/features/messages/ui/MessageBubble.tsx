"use client";

import { Avatar } from "@/shared/ui/components/Avatar";
import type { MessageDto } from "@repo/shared";

interface MessageBubbleProps {
  message: MessageDto;
  isOwn: boolean;
  senderName?: string;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessageBubble({
  message,
  isOwn,
  senderName = "User",
  showAvatar = true,
  showTimestamp = true,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex flex-col gap-1 max-w-[70%] ${
        isOwn ? "self-end items-end" : "self-start items-start"
      }`}
    >
      <div className="flex items-end gap-2">
        {!isOwn && showAvatar && (
          <Avatar name={senderName} userId={message.senderId} size="sm" />
        )}
        <div
          className={`px-4 py-2.5 ${
            isOwn
              ? "bg-primary-500 text-text-inverse rounded-2xl rounded-br-md"
              : "bg-surface text-text rounded-2xl rounded-bl-md border border-border"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
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
          {isOwn && (
            <span className="font-mono text-[10px] text-text-muted">
              ✓✓ DELIVERED
            </span>
          )}
        </div>
      )}
    </div>
  );
}
