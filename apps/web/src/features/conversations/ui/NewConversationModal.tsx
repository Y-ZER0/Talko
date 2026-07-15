"use client";

import { useState } from "react";
import { useCreateConversation } from "../hooks/useCreateConversation";
import { DirectMessageForm, GroupChatForm } from "./ConversationForm";

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const createConversation = useCreateConversation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="New conversation"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-surface rounded-2xl border border-border w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          New Conversation
        </h2>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === "direct"
                ? "bg-primary-500 text-text-inverse"
                : "bg-surface-muted text-text-muted hover:bg-surface"
            }`}
          >
            Direct Message
          </button>
          <button
            type="button"
            onClick={() => setMode("group")}
            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === "group"
                ? "bg-primary-500 text-text-inverse"
                : "bg-surface-muted text-text-muted hover:bg-surface"
            }`}
          >
            Group Chat
          </button>
        </div>

        {mode === "direct" ? (
          <DirectMessageForm
            onCreated={onConversationCreated}
            onClose={onClose}
            mutate={createConversation.mutate}
            isPending={createConversation.isPending}
            error={createConversation.error}
          />
        ) : (
          <GroupChatForm
            onCreated={onConversationCreated}
            onClose={onClose}
            mutate={createConversation.mutate}
            isPending={createConversation.isPending}
            error={createConversation.error}
          />
        )}
      </div>
    </div>
  );
}
