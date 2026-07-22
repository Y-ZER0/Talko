"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/features/presence/hooks/useSocket";
import { usePresence } from "@/features/presence/hooks/usePresence";
import { formatLastSeen } from "@/features/presence/lib/presence-helpers";
import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { useConversation } from "@/features/conversations/hooks/useConversation";
import { conversationKeys } from "@/features/conversations/hooks/conversationKeys";
import { getDisplayName } from "@/features/conversations/lib/conversation-helpers";
import { SharedMediaPanel } from "@/features/media/ui/SharedMediaPanel";
import { GroupMembersPanel } from "@/features/conversations/ui/GroupMembersPanel";
import { SearchPanel } from "@/features/search/ui/SearchPanel";
import { useEditMessage } from "../hooks/useEditMessage";
import { useDeleteMessage } from "../hooks/useDeleteMessage";
import { useReaction } from "../hooks/useReaction";
import { useReplyTo } from "../hooks/useReplyTo";
import type { InfiniteData } from "@tanstack/react-query";
import { messageKeys } from "../hooks/messageKeys";
import type { MessagesCursorResponse } from "@repo/shared";
import { ConversationHeader } from "./ConversationHeader";
import { MessageList } from "./MessageList";
import { MessageComposer } from "./MessageComposer";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { InlineEditor } from "./InlineEditor";
import { SocketEvent } from "@repo/shared";

interface MessageTimelineProps {
  conversationId: string;
}

export function MessageTimeline({ conversationId }: MessageTimelineProps) {
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [membersPanelOpen, setMembersPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [scrollToMessageId, setScrollToMessageId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const { userId: clerkId } = useAuth();
  const { data: profile } = useCurrentUserProfile();
  const currentUserId = profile?.id ?? clerkId ?? undefined;
  const { socket, joinRoom, leaveRoom } = useSocket();
  const { isOnline, getLastSeen, fetchPresence } = usePresence();
  const { data: conversation, isLoading } = useConversation(conversationId);
  const queryClient = useQueryClient();

  const editMessage = useEditMessage(conversationId);
  const deleteMessage = useDeleteMessage(conversationId);
  const { addReaction, removeReaction } = useReaction(conversationId, currentUserId);
  const { replyTarget, startReply, cancelReply } = useReplyTo();

  const editingMessage = editingMessageId
    ? (() => {
        const data = queryClient.getQueryData<InfiniteData<MessagesCursorResponse>>(
          messageKeys.list(conversationId),
        );
        return data?.pages
          .flatMap((p: MessagesCursorResponse) => p.data)
          .find((m) => m.id === editingMessageId) ?? null;
      })()
    : null;

  const displayName = conversation
    ? getDisplayName(conversation, currentUserId)
    : "Chat";

  const otherMember = conversation && !conversation.isGroup
    ? conversation.members.find((m) => m.user.id !== currentUserId)
    : null;

  const otherUserId = otherMember?.user.id;

  const avatarLabel = otherMember
    ? otherMember.user.username.charAt(0).toUpperCase()
    : conversation?.groupName?.charAt(0).toUpperCase() ?? "?";

  useEffect(() => {
    joinRoom(conversationId);
    if (socket?.connected) {
      socket.emit(SocketEvent.CONVERSATION_OPEN, { conversationId });
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
      }, 200);
      return () => {
        clearTimeout(timer);
        leaveRoom(conversationId);
      };
    }
    return () => {
      leaveRoom(conversationId);
    };
  }, [conversationId, joinRoom, leaveRoom, socket, queryClient]);

  useEffect(() => {
    if (otherUserId) {
      fetchPresence(otherUserId);
    }
  }, [otherUserId, fetchPresence]);

  useEffect(() => {
    const msgId = searchParams.get("messageId");
    if (msgId) {
      setScrollToMessageId(msgId);
      router.replace(`/${conversationId}`, { scroll: false });
    }
  }, [searchParams, conversationId, router]);

  const online = otherUserId ? isOnline(otherUserId) : false;
  const lastSeen = otherUserId ? getLastSeen(otherUserId) : undefined;

  const statusText = !conversation?.isGroup
    ? online
      ? "Online"
      : lastSeen
        ? formatLastSeen(lastSeen)
        : undefined
    : undefined;

  const handleStartEdit = useCallback((messageId: string) => {
    setEditingMessageId(messageId);
    setDeletingMessageId(null);
  }, []);

  const handleSaveEdit = useCallback(
    (messageId: string, content: string) => {
      editMessage.mutate(
        { messageId, content },
        { onSuccess: () => setEditingMessageId(null) },
      );
    },
    [editMessage],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
  }, []);

  const handleRequestDelete = useCallback((messageId: string) => {
    setDeletingMessageId(messageId);
    setEditingMessageId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingMessageId) {
      const mid = deletingMessageId;
      setDeletingMessageId(null);
      deleteMessage.mutate({ messageId: mid });
    }
  }, [deletingMessageId, deleteMessage]);

  const handleCancelDelete = useCallback(() => {
    setDeletingMessageId(null);
  }, []);

  const handleAddReaction = useCallback(
    (messageId: string, emoji: string) => {
      addReaction.mutate({ messageId, emoji });
    },
    [addReaction],
  );

  const handleRemoveReaction = useCallback(
    (messageId: string, emoji: string) => {
      removeReaction.mutate({ messageId, emoji });
    },
    [removeReaction],
  );

  const handleSearchResultClick = useCallback(
    (convId: string, messageId: string) => {
      if (convId === conversationId) {
        setScrollToMessageId(messageId);
      } else {
        router.push(`/${convId}?messageId=${messageId}`);
      }
    },
    [conversationId, router],
  );

  const handleReply = useCallback(
    (message: import("@repo/shared").MessageDto) => {
      const sender = conversation?.members.find((m) => m.user.id === message.senderId);
      const senderName = sender?.user.username ?? "User";
      startReply(message, senderName);
    },
    [conversation?.members, startReply],
  );

  return (
    <div className="flex h-full">
      <div className="flex flex-col flex-1 min-w-0">
        <ConversationHeader
          avatarLabel={avatarLabel}
          displayName={displayName}
          isLoading={isLoading}
          statusText={statusText}
          online={online}
          infoPanelOpen={infoPanelOpen}
          onToggleInfoPanel={() => setInfoPanelOpen((p) => !p)}
          onSearchClick={() => setSearchOpen(true)}
          isGroup={conversation?.isGroup}
          membersPanelOpen={membersPanelOpen}
          onToggleMembersPanel={conversation?.isGroup ? () => setMembersPanelOpen((p) => !p) : undefined}
        />

        <MessageList
          conversationId={conversationId}
          currentUserId={currentUserId}
          editingMessageId={editingMessageId ?? undefined}
          scrollToMessageId={scrollToMessageId ?? undefined}
          onStartEdit={handleStartEdit}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onDelete={handleRequestDelete}
          onReply={handleReply}
          members={conversation?.members}
        />

        <MessageComposer
          conversationId={conversationId}
          displayName={displayName}
          currentUserId={currentUserId}
          replyTarget={replyTarget}
          onCancelReply={cancelReply}
        />
      </div>

      {infoPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setInfoPanelOpen(false)}
          />
          <div className="hidden lg:block w-[320px] shrink-0 border-l border-border">
            <SharedMediaPanel conversationId={conversationId} />
          </div>
          <div className="fixed right-0 top-0 bottom-0 z-50 w-[320px] lg:hidden">
            <SharedMediaPanel
              conversationId={conversationId}
              onClose={() => setInfoPanelOpen(false)}
            />
          </div>
        </>
      )}

      {membersPanelOpen && conversation?.isGroup && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            onClick={() => setMembersPanelOpen(false)}
          />
          <div className="hidden lg:block w-[320px] shrink-0 border-l border-border">
            <GroupMembersPanel members={conversation.members} />
          </div>
          <div className="fixed right-0 top-0 bottom-0 z-50 w-[320px] lg:hidden">
            <GroupMembersPanel
              members={conversation.members}
              onClose={() => setMembersPanelOpen(false)}
            />
          </div>
        </>
      )}

      {deletingMessageId && (
        <DeleteConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {editingMessage && (
        <InlineEditor
          originalContent={editingMessage.content ?? ""}
          onSave={(content) => handleSaveEdit(editingMessage.id, content)}
          onCancel={handleCancelEdit}
        />
      )}

      <SearchPanel
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        currentUserId={currentUserId}
        onResultClick={handleSearchResultClick}
      />
    </div>
  );
}
