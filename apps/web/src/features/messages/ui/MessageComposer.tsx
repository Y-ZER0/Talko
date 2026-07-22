"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSendMessage } from "../hooks/useSendMessage";
import { useUploadMedia } from "@/features/media/hooks/useUploadMedia";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { ToolbarButton } from "@/shared/ui/components/ToolbarButton";
import { PendingUploadList } from "./PendingUploadList";
import type { PendingUpload } from "./PendingUploadList";
import { ReplyPreview } from "./ReplyPreview";
import { SocketEvent } from "@repo/shared";
import type { ReplyTarget } from "../hooks/useReplyTo";

const TYPING_DEBOUNCE_MS = 3_000;

interface MessageComposerProps {
  conversationId: string;
  disabled?: boolean;
  displayName?: string;
  currentUserId?: string;
  replyTarget?: ReplyTarget | null;
  onCancelReply?: () => void;
}

export function MessageComposer({
  conversationId,
  disabled = false,
  displayName = "Chat",
  currentUserId,
  replyTarget,
  onCancelReply,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendMessage = useSendMessage(conversationId, currentUserId);
  const uploadMedia = useUploadMedia();
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const emitTypingStop = useCallback(() => {
    if (!socket || !isTypingRef.current) return;
    socket.emit(SocketEvent.TYPING_STOP, { conversationId });
    isTypingRef.current = false;
  }, [socket, conversationId]);

  const emitTypingStart = useCallback(() => {
    if (!socket) return;
    if (!isTypingRef.current) {
      socket.emit(SocketEvent.TYPING_START, { conversationId });
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(emitTypingStop, TYPING_DEBOUNCE_MS);
  }, [socket, conversationId, emitTypingStop]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTypingStop();
    };
  }, [emitTypingStop]);

  const handleFilesSelected = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newUploads: PendingUpload[] = Array.from(files).map((file) => ({
        id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        status: "uploading" as const,
      }));

      setPendingUploads((prev) => [...prev, ...newUploads]);

      for (const upload of newUploads) {
        try {
          const result = await uploadMedia.mutateAsync(upload.file);
          setPendingUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "done" as const, url: result.url }
                : u,
            ),
          );
        } catch {
          setPendingUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id ? { ...u, status: "error" as const } : u,
            ),
          );
        }
      }
    },
    [uploadMedia],
  );

  const removeUpload = useCallback((id: string) => {
    setPendingUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    const readyAttachments = pendingUploads.filter(
      (u) => u.status === "done" && u.url,
    );

    if (!trimmed && readyAttachments.length === 0) return;
    if (sendMessage.isPending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTypingStop();

    sendMessage.mutate(
      {
        content: trimmed || undefined,
        parentId: replyTarget?.messageId,
        parentMessage: replyTarget
          ? { id: replyTarget.messageId, senderId: "", senderName: replyTarget.senderName, content: replyTarget.content }
          : undefined,
        attachments: readyAttachments.map((u) => ({
          mediaUrl: u.url!,
          mediaType: u.file.type.startsWith("image/")
            ? "IMAGE"
            : u.file.type.startsWith("audio/")
              ? "AUDIO"
              : u.file.type.startsWith("video/")
                ? "VIDEO"
                : "DOCUMENT",
          fileSize: u.file.size,
        })),
        clientId: `client-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      {
        onSuccess: () => {
          setContent("");
          setPendingUploads([]);
          onCancelReply?.();
          inputRef.current?.focus();
        },
      },
    );
  }, [content, pendingUploads, sendMessage, emitTypingStop, replyTarget, onCancelReply]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    emitTypingStart();
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const uploading = pendingUploads.some((u) => u.status === "uploading");
  const readyCount = pendingUploads.filter((u) => u.status === "done").length;
  const canSend = (content.trim() || readyCount > 0) && !sendMessage.isPending && !disabled && !uploading;

  return (
    <div className="border-t border-border bg-surface">
      {replyTarget && (
        <ReplyPreview
          senderName={replyTarget.senderName}
          content={replyTarget.content}
          onCancel={onCancelReply ?? (() => {})}
        />
      )}
      <div className="px-5 py-3.5">
        <PendingUploadList uploads={pendingUploads} onRemove={removeUpload} />

        <div className="flex items-end gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.zip,.txt"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            label="Attach file"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || uploading}
            label="Send image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </ToolbarButton>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={content}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${displayName}...`}
              disabled={disabled || sendMessage.isPending || uploading}
              rows={1}
              className="w-full px-4 py-2.5 bg-surface-muted border border-transparent rounded-xl text-sm text-text placeholder:text-text-muted resize-none outline-none transition-shadow focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/10 disabled:opacity-50"
              style={{ maxHeight: "120px" }}
            />
          </div>

          <ToolbarButton label="Add emoji">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </ToolbarButton>

          <ToolbarButton label="Record voice message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={handleSubmit}
            disabled={!canSend}
            label="Send message"
            variant="primary"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
}