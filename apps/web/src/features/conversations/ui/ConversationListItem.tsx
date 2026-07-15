"use client";

import { Avatar } from "@/shared/ui/components/Avatar";
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
}

export function ConversationListItem({
  conversation,
  isActive = false,
  onClick,
}: ConversationListItemProps) {
  const displayName = getDisplayName(conversation);
  const preview = getLastMessagePreview(conversation);
  const timestamp = conversation.lastMessage
    ? formatTimestamp(conversation.lastMessage.createdAt)
    : "";
  const hasUnread = conversation.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive
          ? "bg-surface-muted"
          : "bg-transparent hover:bg-surface-muted/50"
      }`}
    >
      <Avatar
        name={displayName}
        userId={conversation.id}
        size="sm"
        showPresenceDot={!conversation.isGroup}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
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
            <span className="font-mono text-[10px] text-text-muted ml-2 shrink-0">
              {timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p
            className={`text-xs truncate ${
              hasUnread ? "text-text font-medium" : "text-text-muted"
            }`}
          >
            {preview}
          </p>

          {hasUnread && (
            <span className="ml-2 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-text-inverse text-[10px] font-bold">
              {conversation.unreadCount > 99
                ? "99+"
                : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
