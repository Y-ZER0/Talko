"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Avatar } from "@/shared/ui/components/Avatar";
import { ReadReceiptIcon } from "@/features/receipts/ui/ReadReceiptIcon";
import { ImageAttachmentCard } from "@/features/media/ui/ImageAttachmentCard";
import { FileAttachmentRow } from "@/features/media/ui/FileAttachmentRow";
import { VoiceNoteBubble } from "@/features/media/ui/VoiceNoteBubble";
import { MessageActions } from "./MessageActions";
import { ReactionPills } from "./ReactionPills";
import { MessageMediaType } from "@repo/shared";
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

function InlineEditor({
  initialContent,
  onSave,
  onCancel,
}: {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialContent);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length,
      );
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSave(value.trim());
    }
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="absolute inset-0 z-20">
      <div className="flex flex-col gap-1 bg-surface border border-primary-500 rounded-2xl shadow-lg p-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="w-full px-3 py-2 bg-surface-muted rounded-xl text-sm text-text resize-none outline-none focus:ring-2 focus:ring-primary-500/20"
          style={{ maxHeight: "120px" }}
        />
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => {
              onCancel();
              setValue(initialContent);
            }}
            className="px-2 py-1 rounded-lg text-xs text-text-muted hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => value.trim() && onSave(value.trim())}
            disabled={!value.trim()}
            className="px-2 py-1 rounded-lg text-xs font-medium text-text-inverse bg-primary-500 hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
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
                : `px-4 py-2.5 ${
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
              <p className="text-[10px] opacity-60 mt-0.5">edited</p>
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
          <span className="font-mono text-[10px] text-text-muted">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwn && <ReadReceiptIcon messageId={message.id} />}
        </div>
      )}
    </div>
  );
}
