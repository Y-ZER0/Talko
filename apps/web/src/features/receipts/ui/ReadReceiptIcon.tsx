"use client";

import { useReceipts } from "../hooks/useReceipts";

interface ReadReceiptIconProps {
  messageId: string;
}

function formatReceiptTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function SingleCheck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 8 6.5 11.5 13 5" />
    </svg>
  );
}

function DoubleCheck() {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 22 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 8 4.5 11.5 11 5" />
      <polyline points="6 8 9.5 11.5 16 5" />
    </svg>
  );
}

export function ReadReceiptIcon({ messageId }: ReadReceiptIconProps) {
  const { getReceipt } = useReceipts();
  const receipt = getReceipt(messageId);

  if (!receipt) {
    return (
      <span className="inline-flex items-center gap-0.5 text-text-muted">
        <SingleCheck />
        <span className="font-mono text-[10px] tracking-label uppercase">
          SENT
        </span>
      </span>
    );
  }

  if (receipt.status === "delivered") {
    return (
      <span className="inline-flex items-center gap-0.5 text-text-muted">
        <DoubleCheck />
        <span className="font-mono text-[10px] tracking-label uppercase">
          DELIVERED
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-primary-500">
      <DoubleCheck />
      <span className="font-mono text-[10px] tracking-label uppercase">
        READ
      </span>
      {receipt.readAt && (
        <span className="font-mono text-[10px] text-text-muted ml-0.5">
          {formatReceiptTime(receipt.readAt)}
        </span>
      )}
    </span>
  );
}
