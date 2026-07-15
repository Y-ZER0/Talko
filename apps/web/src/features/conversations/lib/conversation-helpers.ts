import type { ConversationDto } from "@repo/shared";

export function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}`;
  if (diffHours < 24) return `${diffHours}`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getDisplayName(
  conversation: ConversationDto,
  currentUserId?: string,
): string {
  if (conversation.isGroup) {
    return conversation.groupName || "Group Chat";
  }
  const otherMember = conversation.members.find(
    (m) => m.user.id !== currentUserId,
  );
  if (otherMember) {
    return otherMember.user.username;
  }
  const self = conversation.members.find((m) => m.user.id === currentUserId);
  return self?.user.username || "Unknown";
}

export function getLastMessagePreview(conversation: ConversationDto): string {
  if (!conversation.lastMessage) return "No messages yet";
  return conversation.lastMessage.content || "Sent a message";
}
