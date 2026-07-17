"use client";

import { useConversationAttachments } from "../hooks/useConversationAttachments";
import { FileAttachmentRow } from "./FileAttachmentRow";
import { MessageMediaType } from "@repo/shared";
import type { MessageAttachmentDto } from "@repo/shared";

interface SharedMediaPanelProps {
  conversationId: string;
  onClose?: () => void;
}

function buildThumbnailUrl(baseUrl: string): string {
  return `${baseUrl}?tr=w-120,h-120,fo-auto`;
}

function ImageThumb({ attachment }: { attachment: MessageAttachmentDto }) {
  return (
    <a
      href={attachment.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block aspect-square rounded-lg overflow-hidden bg-surface-muted hover:opacity-80 transition-opacity"
    >
      <img
        src={buildThumbnailUrl(attachment.mediaUrl)}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover"
      />
    </a>
  );
}

export function SharedMediaPanel({ conversationId, onClose }: SharedMediaPanelProps) {
  const { images, files } = useConversationAttachments(conversationId);

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-text text-sm">Shared Media</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted transition-colors lg:hidden"
            aria-label="Close panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {images.length > 0 && (
          <div className="px-4 py-3">
            <h4 className="font-mono text-[11px] font-medium text-text-muted tracking-label uppercase mb-3">
              Images
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((att) => (
                <ImageThumb key={att.id} attachment={att} />
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="px-4 py-3 border-t border-border">
            <h4 className="font-mono text-[11px] font-medium text-text-muted tracking-label uppercase mb-2">
              Files
            </h4>
            <div className="flex flex-col">
              {files.map((att) => (
                <FileAttachmentRow key={att.id} attachment={att} />
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center mb-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A8478"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className="text-sm text-text-muted">No shared media yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
