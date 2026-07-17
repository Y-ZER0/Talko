"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSendMessage } from "../hooks/useSendMessage";
import { useUploadMedia } from "@/features/media/hooks/useUploadMedia";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { SocketEvent } from "@repo/shared";

const TYPING_DEBOUNCE_MS = 3_000;

interface PendingUpload {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  url?: string;
}

interface MessageComposerProps {
  conversationId: string;
  disabled?: boolean;
  displayName?: string;
  currentUserId?: string;
}

function fileIcon(file: File): string {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

export function MessageComposer({
  conversationId,
  disabled = false,
  displayName = "Chat",
  currentUserId,
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
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, TYPING_DEBOUNCE_MS);
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
          inputRef.current?.focus();
        },
      },
    );
  }, [content, pendingUploads, sendMessage, emitTypingStop]);

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

  return (
    <div className="border-t border-border bg-surface px-4 py-3">
      {pendingUploads.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {pendingUploads.map((upload) => (
            <div
              key={upload.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                upload.status === "error"
                  ? "border-danger bg-danger-bg"
                  : "border-border bg-surface-muted"
              }`}
            >
              {upload.status === "uploading" ? (
                <div className="w-3 h-3 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              ) : upload.status === "error" ? (
                <span className="text-danger">Failed</span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span className="text-text truncate max-w-[120px]">
                {upload.file.name}
              </span>
              <button
                type="button"
                onClick={() => removeUpload(upload.id)}
                className="text-text-muted hover:text-text transition-colors"
                aria-label="Remove attachment"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
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

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors disabled:opacity-50"
          aria-label="Attach file"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || uploading}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors disabled:opacity-50"
          aria-label="Send image"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${displayName}...`}
            disabled={disabled || sendMessage.isPending || uploading}
            rows={1}
            className="w-full px-4 py-2.5 bg-surface-muted border-0 rounded-xl text-sm text-text placeholder:text-text-muted resize-none outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
            style={{ maxHeight: "120px" }}
          />
        </div>

        <button
          type="button"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Add emoji"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>

        <button
          type="button"
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors"
          aria-label="Record voice message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={(!content.trim() && readyCount === 0) || sendMessage.isPending || disabled || uploading}
          className="shrink-0 w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-text-inverse hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
