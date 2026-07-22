"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/shared/ui/components/Avatar";
import type { ReceiptUpdateEventPayload } from "@repo/shared";

interface ReadByPopoverProps {
  receipts: ReceiptUpdateEventPayload[];
  members?: { user: { id: string; username: string } }[];
  onClose: () => void;
}

function formatReadTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function ReadByPopover({ receipts, members, onClose }: ReadByPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const readReceipts = receipts.filter((r) => r.status === "read");

  if (readReceipts.length === 0) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 right-0 bg-surface border border-border rounded-xl shadow-lg z-20 py-2 min-w-[180px] max-h-[200px] overflow-y-auto"
    >
      <div className="px-3 py-1.5 border-b border-border">
        <p className="font-mono text-[10px] text-text-muted tracking-label uppercase">
          Read by
        </p>
      </div>
      <div className="py-1">
        {readReceipts.map((receipt) => {
          const member = members?.find((m) => m.user.id === receipt.userId);
          const username = member?.user.username ?? "User";
          return (
            <div
              key={receipt.userId}
              className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-surface-muted transition-colors"
            >
              <Avatar name={username} userId={receipt.userId} size="sm" />
              <span className="text-sm text-text truncate flex-1">{username}</span>
              {receipt.readAt && (
                <span className="font-mono text-[10px] text-text-muted shrink-0">
                  {formatReadTime(receipt.readAt)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
