"use client";

import type { MessageAttachmentDto } from "@repo/shared";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromUrl(url: string): string {
  const segments = url.split("/");
  const last = segments[segments.length - 1] ?? "file";
  return decodeURIComponent(last.split("?")[0]);
}

function fileExtension(url: string): string {
  const name = fileNameFromUrl(url);
  const parts = name.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1]!.toLowerCase()}` : "";
}

function fileIconColor(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "text-danger",
    ".zip": "text-accent-gold",
    ".doc": "text-accent-blue",
    ".docx": "text-accent-blue",
    ".txt": "text-text-muted",
  };
  return map[ext] ?? "text-text-muted";
}

interface FileAttachmentRowProps {
  attachment: MessageAttachmentDto;
}

export function FileAttachmentRow({ attachment }: FileAttachmentRowProps) {
  const name = fileNameFromUrl(attachment.mediaUrl);
  const ext = fileExtension(attachment.mediaUrl);
  const iconColor = fileIconColor(ext);
  const size = attachment.fileSizeBytes ? formatFileSize(attachment.fileSizeBytes) : null;

  return (
    <a
      href={attachment.mediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-muted transition-colors group"
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor} bg-surface-muted`}
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate group-hover:text-primary-500 transition-colors">
          {name}
        </p>
        {size && (
          <p className="text-[11px] font-mono text-text-muted">{size}</p>
        )}
      </div>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <path d="M7 17l9.2-9.2M17 17V7H7" />
      </svg>
    </a>
  );
}
