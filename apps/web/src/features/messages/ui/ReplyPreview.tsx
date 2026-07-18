"use client";

interface ReplyPreviewProps {
  senderName: string;
  content: string;
  onCancel: () => void;
}

export function ReplyPreview({ senderName, content, onCancel }: ReplyPreviewProps) {
  const truncated = content.length > 80 ? content.slice(0, 80) + "..." : content;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface-muted border-b border-border">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-primary-500">
          Replying to {senderName}
        </p>
        {truncated && (
          <p className="text-xs text-text-muted truncate">{truncated}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:bg-border transition-colors"
        aria-label="Cancel reply"
      >
        <svg
          width="14"
          height="14"
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
  );
}
