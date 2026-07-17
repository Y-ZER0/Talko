"use client";

import { useTypingIndicator } from "../hooks/useTypingIndicator";

interface TypingIndicatorProps {
  conversationId: string;
  currentUserId?: string;
}

function formatTypingText(usernames: string[]): string {
  if (usernames.length === 0) return "";
  if (usernames.length === 1) return `${usernames[0]} is typing...`;
  if (usernames.length === 2) return `${usernames[0]} and ${usernames[1]} are typing...`;
  const last = usernames[usernames.length - 1];
  const rest = usernames.slice(0, -1).join(", ");
  return `${rest}, and ${last} are typing...`;
}

export function TypingIndicator({
  conversationId,
  currentUserId,
}: TypingIndicatorProps) {
  const typingUsers = useTypingIndicator(conversationId, currentUserId);

  if (typingUsers.length === 0) return null;

  const text = formatTypingText(typingUsers.map((u) => u.username));

  return (
    <p
      className="text-xs text-primary-500 italic truncate"
      aria-live="polite"
      role="status"
    >
      {text}
    </p>
  );
}
