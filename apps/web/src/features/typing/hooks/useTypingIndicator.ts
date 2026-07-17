"use client";

import { useContext } from "react";
import { TypingContext, type TypingUser } from "../context/TypingContext";

export function useTypingIndicator(
  conversationId: string,
  currentUserId?: string,
): TypingUser[] {
  const context = useContext(TypingContext);
  if (!context) {
    throw new Error(
      "useTypingIndicator must be used within a TypingProvider",
    );
  }

  const allTyping = context.getTypingUsers(conversationId);
  if (!currentUserId) return allTyping;
  return allTyping.filter((u) => u.userId !== currentUserId);
}
