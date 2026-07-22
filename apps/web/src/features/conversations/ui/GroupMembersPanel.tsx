"use client";

import { useEffect } from "react";
import { Avatar } from "@/shared/ui/components/Avatar";
import { PresenceDot } from "@/features/presence/ui/PresenceDot";
import { usePresence } from "@/features/presence/hooks/usePresence";
import { formatLastSeen } from "@/features/presence/lib/presence-helpers";
import type { ConversationMemberWithUserDto } from "@repo/shared";

interface GroupMembersPanelProps {
  members: ConversationMemberWithUserDto[];
  onClose?: () => void;
}

export function GroupMembersPanel({ members, onClose }: GroupMembersPanelProps) {
  const { isOnline, getLastSeen, fetchPresence } = usePresence();

  useEffect(() => {
    for (const member of members) {
      fetchPresence(member.user.id);
    }
  }, [members, fetchPresence]);

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="font-semibold text-text text-sm">Members</h3>
          <p className="font-mono text-[10px] text-text-muted tracking-label uppercase mt-0.5">
            {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>
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
        {members.map((member) => {
          const online = isOnline(member.user.id);
          const lastSeen = getLastSeen(member.user.id);
          const statusText = online
            ? "Online"
            : lastSeen
              ? formatLastSeen(lastSeen)
              : undefined;

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors"
            >
              <Avatar
                name={member.user.username}
                userId={member.user.id}
                imageUrl={member.user.avatarUrl}
                size="md"
                showPresenceDot
                isOnline={online}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text truncate">
                    {member.user.username}
                  </span>
                  {member.role === "admin" && (
                    <span className="font-mono text-[9px] tracking-label uppercase text-primary-500 bg-primary-500/10 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>
                {statusText && (
                  <p className={`text-xs font-mono truncate ${online ? "text-online" : "text-text-muted"}`}>
                    {statusText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
