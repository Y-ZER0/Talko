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
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
            pill.hasOwn
              ? "bg-primary-500/10 border-primary-500/30 text-primary-600"
              : "bg-surface-muted border-border text-text-muted hover:border-primary-500/30"
          }`}
        >
          <span>{pill.emoji}</span>
          <span className="font-mono">{pill.count}</span>
        </button>
      ))}
    </div>
  );
}
