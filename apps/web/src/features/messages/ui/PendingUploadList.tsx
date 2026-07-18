"use client";

interface PendingUpload {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  url?: string;
}

interface PendingUploadListProps {
  uploads: PendingUpload[];
  onRemove: (id: string) => void;
}

export type { PendingUpload };

export function PendingUploadList({ uploads, onRemove }: PendingUploadListProps) {
  if (uploads.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {uploads.map((upload) => (
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          <span className="text-text truncate max-w-[120px]">
            {upload.file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemove(upload.id)}
            className="text-text-muted hover:text-text transition-colors"
            aria-label="Remove attachment"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
