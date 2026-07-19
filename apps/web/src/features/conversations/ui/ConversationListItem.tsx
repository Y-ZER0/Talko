"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/shared/ui/components/Avatar";
import { usePresence } from "@/features/presence/hooks/usePresence";
import { useTypingIndicator } from "@/features/typing/hooks/useTypingIndicator";
import { useDeleteConversation } from "../hooks/useDeleteConversation";
import { useDeleteGroup } from "../hooks/useDeleteGroup";
import type { ConversationDto } from "@repo/shared";
import {
  formatTimestamp,
  getDisplayName,
  getLastMessagePreview,
} from "../lib/conversation-helpers";

interface ConversationListItemProps {
  conversation: ConversationDto;
  isActive?: boolean;
  onClick?: () => void;
  currentUserId?: string;
}

type ConfirmAction = "leave" | "delete" | null;

export function ConversationListItem({
  conversation,
  isActive = false,
  onClick,
  currentUserId,
}: ConversationListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isOnline } = usePresence();
  const typingUsers = useTypingIndicator(conversation.id, currentUserId);
  const leave = useDeleteConversation();
  const deleteGroup = useDeleteGroup();

  const displayName = getDisplayName(conversation, currentUserId);
  const preview = getLastMessagePreview(conversation);
  const timestamp = conversation.lastMessage
    ? formatTimestamp(conversation.lastMessage.createdAt)
    : "";
  const hasUnread = conversation.unreadCount > 0;
  const isTyping = typingUsers.length > 0;

  const currentMember = currentUserId
    ? conversation.members.find((m) => m.user.id === currentUserId)
    : undefined;
  const isAdmin = currentMember?.role === "admin";

  const otherUserId =
    !conversation.isGroup && currentUserId
      ? conversation.members.find((m) => m.user.id !== currentUserId)?.user.id
      : undefined;

  const online = otherUserId ? isOnline(otherUserId) : false;
  const isPending = leave.isPending || deleteGroup.isPending;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmAction(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: ConfirmAction) => {
    if (confirmAction !== action) {
      setConfirmAction(action);
      return;
    }
    if (action === "leave") {
      leave.mutate(conversation.id);
    } else if (action === "delete") {
      deleteGroup.mutate(conversation.id);
    }
    setMenuOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={`relative w-full flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-left transition-colors ${
          isActive
            ? "bg-surface shadow-sm"
            : "bg-transparent hover:bg-surface-muted/60"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary-500" />
        )}

        <Avatar
          name={displayName}
          userId={conversation.id}
          size="sm"
          showPresenceDot={!conversation.isGroup}
          isOnline={online}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-sans text-sm truncate ${
                hasUnread ? "font-semibold text-text" : "font-medium text-text"
              }`}
            >
              {conversation.isGroup && (
                <span className="text-text-muted mr-1">#</span>
              )}
              {displayName}
            </span>
            {timestamp && (
              <span className="font-mono text-[10px] text-text-muted shrink-0">
                {timestamp}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            {isTyping ? (
              <p
                className="text-xs text-primary-500 italic truncate"
                aria-live="polite"
                role="status"
              >
                {typingUsers.length === 1
                  ? `${typingUsers[0].username} is typing...`
                  : typingUsers.length === 2
                    ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
                    : `${typingUsers
                        .slice(0, -1)
                        .map((u) => u.username)
                        .join(", ")}, and ${typingUsers[typingUsers.length - 1].username} are typing...`}
              </p>
            ) : (
              <p
                className={`text-xs truncate ${
                  hasUnread ? "text-text font-medium" : "text-text-muted"
                }`}
              >
                {preview}
              </p>
            )}

            {hasUnread && (
              <span className="shrink-0 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-text-inverse font-mono text-[10px] font-semibold">
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>

      <div
        ref={menuRef}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); setConfirmAction(null); }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted bg-surface/0 hover:bg-surface hover:text-text hover:shadow-sm transition-colors"
          aria-label="Conversation options"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[200px] bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
            {confirmAction === "delete" ? (
              <div className="p-3.5">
                <p className="text-xs text-text-muted mb-3 leading-relaxed">
                  This will delete the group for everyone. Are you sure?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmAction(null); }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-muted text-text hover:bg-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleAction("delete"); }}
                    disabled={isPending}
                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-60"
                  >
                    {deleteGroup.isPending ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ) : confirmAction === "leave" ? (
              <div className="p-3.5">
                <p className="text-xs text-text-muted mb-3 leading-relaxed">
                  {conversation.isGroup ? "Leave this group?" : "Delete this conversation?"}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setConfirmAction(null); }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-muted text-text hover:bg-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleAction("leave"); }}
                    disabled={isPending}
                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-60"
                  >
                    {leave.isPending ? "..." : "Leave"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-1.5">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleAction("leave"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  {conversation.isGroup ? "Leave group" : "Delete conversation"}
                </button>

                {conversation.isGroup && isAdmin && (
                  <>
                    <div className="h-px bg-border mx-3 my-1" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleAction("delete"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete group
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}