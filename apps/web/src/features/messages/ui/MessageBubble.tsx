"use client";

import { useEffect, useRef, useCallback } from "react";
import { Avatar } from "@/shared/ui/components/Avatar";
import { ReadReceiptIcon } from "@/features/receipts/ui/ReadReceiptIcon";
import { MessageActions } from "./MessageActions";
import { ReactionPills } from "./ReactionPills";
import { AttachmentsRenderer } from "./AttachmentsRenderer";
import { InlineEditor } from "./InlineEditor";
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
  editingMessageId?: string;
  onStartEdit?: (messageId: string) => void;
  onSaveEdit?: (messageId: string, content: string) => void;
  onCancelEdit?: () => void;
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
  editingMessageId,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: MessageBubbleProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isEditing = editingMessageId === message.id;

  useEffect(() => {
    if (!observeRef || !wrapperRef.current) return;
    return observeRef(wrapperRef.current, message.id);
  }, [observeRef, message.id]);

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

          {isEditing && (
            <InlineEditor
              initialContent={message.content ?? ""}
              onSave={(content) => onSaveEdit?.(message.id, content)}
              onCancel={() => onCancelEdit?.()}
            />
          )}

          {!isEditing && (
            <MessageActions
              isOwn={isOwn}
              onEdit={() => onStartEdit?.(message.id)}
              onDelete={() => onDelete?.(message.id)}
              onReact={(emoji) => onAddReaction?.(message.id, emoji)}
            />
          )}
        </div>
      </div>

      {!isEditing && (
        <ReactionPills
          reactions={message.reactions}
          currentUserId={currentUserId}
          onToggleReaction={handleToggleReaction}
        />
      )}

      {showTimestamp && (
        <div className={`flex items-center gap-1.5 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="font-mono text-[10px] text-text-muted tracking-wide">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && <ReadReceiptIcon messageId={message.id} />}
        </div>
      )}
    </div>
  );
}