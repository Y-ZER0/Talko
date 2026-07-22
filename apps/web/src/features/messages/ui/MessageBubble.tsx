"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Avatar } from "@/shared/ui/components/Avatar";
import { ReadReceiptIcon } from "@/features/receipts/ui/ReadReceiptIcon";
import { ReadByPopover } from "@/features/receipts/ui/ReadByPopover";
import { useReceipts } from "@/features/receipts/hooks/useReceipts";
import { MessageActions } from "./MessageActions";
import { ReactionPills } from "./ReactionPills";
import { AttachmentsRenderer } from "./AttachmentsRenderer";
import { formatMessageTime } from "./formatMessageTime";
import type { MessageDto } from "@repo/shared";

interface MessageBubbleProps {
  message: MessageDto;
  isOwn: boolean;
  senderName?: string;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  observeRef?: (el: HTMLElement, messageId: string) => () => void;
  currentUserId?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: MessageDto) => void;
  editingMessageId?: string;
  onStartEdit?: (messageId: string) => void;
  members?: { user: { id: string; username: string } }[];
}

export function MessageBubble({
  message,
  isOwn,
  senderName = "User",
  showAvatar = true,
  showTimestamp = true,
  observeRef,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  onDelete,
  onReply,
  editingMessageId,
  onStartEdit,
  members,
}: MessageBubbleProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showReadBy, setShowReadBy] = useState(false);
  const { getReceipts } = useReceipts();
  const readReceipts = isOwn ? getReceipts(message.id) : [];
  const hasReadBy = readReceipts.some((r) => r.status === "read");

  const isEditing = editingMessageId === message.id;

  useEffect(() => {
    if (!observeRef || !wrapperRef.current) return;
    if (isOwn) return;
    return observeRef(wrapperRef.current, message.id);
  }, [observeRef, message.id, isOwn]);

  const handleToggleReaction = useCallback(
    (emoji: string) => {
      const existing = message.reactions.find(
        (r) => r.userId === currentUserId && r.emoji === emoji,
      );
      if (existing) {
        onRemoveReaction?.(message.id, emoji);
      } else {
        onAddReaction?.(message.id, emoji);
      }
    },
    [message.id, message.reactions, currentUserId, onAddReaction, onRemoveReaction],
  );

  const hasAttachments = message.attachments && message.attachments.length > 0;

  if (message.isDeleted) {
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
          <div className="px-4 py-2.5 bg-surface-muted rounded-2xl rounded-bl-md border border-border">
            <p className="text-sm text-text-muted italic">Message deleted</p>
          </div>
        </div>
        {showTimestamp && (
          <div className={`flex items-center gap-1.5 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
            <span className="font-mono text-[10px] text-text-muted">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className={`group relative flex flex-col gap-1 max-w-[70%] ${
        isOwn ? "self-end items-end" : "self-start items-start"
      }`}
    >
      <div className="flex items-end gap-2">
        {!isOwn && showAvatar && (
          <Avatar name={senderName} userId={message.senderId} size="sm" />
        )}

        <div className="relative">
          {message.parentMessage && (
            <div className={`flex items-center gap-2 px-3 py-1.5 mb-0.5 rounded-t-2xl border-b ${
              isOwn
                ? "bg-primary-500/20 border-primary-500/30"
                : "bg-surface-muted border-border"
            }`}>
              <div className="w-0.5 self-stretch rounded-full bg-primary-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-semibold ${isOwn ? "text-text-inverse/80" : "text-primary-500"}`}>
                  {message.parentMessage.senderName}
                </p>
                <p className={`text-[11px] truncate ${isOwn ? "text-text-inverse/60" : "text-text-muted"}`}>
                  {message.parentMessage.content ?? "Attachment"}
                </p>
              </div>
            </div>
          )}
          <div
            className={
              hasAttachments && !message.content
                ? ""
                : `px-4 py-2.5 shadow-sm ${
                    isOwn
                      ? "bg-primary-500 text-text-inverse rounded-2xl rounded-br-md"
                      : "bg-surface text-text rounded-2xl rounded-bl-md border border-border"
                  }`
            }
          >
            {message.content && (
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  hasAttachments ? "mb-2" : ""
                }`}
              >
                {message.content}
              </p>
            )}
            <AttachmentsRenderer attachments={message.attachments} isOwn={isOwn} />
            {message.editedAt && (
              <p className="text-[10px] font-mono opacity-60 mt-1 tracking-label uppercase">
                edited
              </p>
            )}
          </div>
        </div>

        {!isEditing && (
          <MessageActions
            isOwn={isOwn}
            onEdit={() => onStartEdit?.(message.id)}
            onDelete={() => onDelete?.(message.id)}
            onReact={handleToggleReaction}
            onReply={() => onReply?.(message)}
          />
        )}
      </div>

      {!isEditing && (
        <ReactionPills
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggleReaction={handleToggleReaction}
        />
      )}

      <div className={`flex items-center gap-1.5 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
        {showTimestamp && (
          <span className="font-mono text-[10px] text-text-muted tracking-wide">
            {formatMessageTime(message.createdAt)}
          </span>
        )}
        {isOwn && (
          <div className="relative">
            <ReadReceiptIcon messageId={message.id} />
            {hasReadBy && (
              <>
                <button
                  type="button"
                  onClick={() => setShowReadBy((p) => !p)}
                  className="inline-flex items-center justify-center w-4 h-4 text-text-muted hover:text-text transition-colors ml-0.5"
                  aria-label="Show who read this message"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {showReadBy && (
                  <ReadByPopover
                    receipts={readReceipts}
                    members={members}
                    onClose={() => setShowReadBy(false)}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}