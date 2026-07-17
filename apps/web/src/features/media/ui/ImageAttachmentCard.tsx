"use client";

import { useState } from "react";
import type { MessageAttachmentDto } from "@repo/shared";

function buildThumbnailUrl(baseUrl: string): string {
  return `${baseUrl}?tr=w-300,h-300,fo-auto`;
}

function buildFullUrl(baseUrl: string): string {
  return `${baseUrl}?tr=w-1200`;
}

interface ImageAttachmentCardProps {
  attachment: MessageAttachmentDto;
}

export function ImageAttachmentCard({ attachment }: ImageAttachmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        aria-label="View image full size"
      >
        <div className="relative bg-surface-muted">
          {!loaded && (
            <div className="aspect-square flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={buildThumbnailUrl(attachment.mediaUrl)}
            alt=""
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`w-full object-cover transition-opacity ${
              loaded ? "opacity-100" : "opacity-0 absolute inset-0"
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setExpanded(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            aria-label="Close preview"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={buildFullUrl(attachment.mediaUrl)}
            alt=""
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
