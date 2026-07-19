"use client";

import type { ReactionDto } from "@repo/shared";

interface ReactionPillsProps {
  reactions: ReactionDto[];
  currentUserId?: string;
  onToggleReaction: (emoji: string) => void;
}

export function ReactionPills({ reactions, currentUserId, onToggleReaction }: ReactionPillsProps) {
  if (!reactions || reactions.length === 0) return null;

  const grouped = reactions.reduce<Record<string, { emoji: string; count: number; hasOwn: boolean }>>(
    (acc, r) => {
      if (!acc[r.emoji]) {
        acc[r.emoji] = { emoji: r.emoji, count: 0, hasOwn: false };
      }
      acc[r.emoji].count++;
      if (r.userId === currentUserId) {
        acc[r.emoji].hasOwn = true;
      }
      return acc;
    },
    {},
  );

  const pills = Object.values(grouped);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {pills.map((pill) => (
        <button
          key={pill.emoji}
          type="button"
          onClick={() => onToggleReaction(pill.emoji)}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
            pill.hasOwn
              ? "bg-primary-500/10 border-primary-500/40 text-primary-600"
              : "bg-surface border-border text-text-muted hover:border-primary-500/30 hover:bg-surface-muted"
          }`}
        >
          <span>{pill.emoji}</span>
          <span className="font-mono text-[11px]">{pill.count}</span>
        </button>
      ))}
    </div>
  );
}