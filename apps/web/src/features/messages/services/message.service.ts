import { apiClient } from "@/shared/lib/api-client";
import type { MessageDto, MessagesCursorResponse, AttachmentPayload } from "@repo/shared";

export interface SendMessageRequest {
  content?: string;
  parentId?: string;
  clientId: string;
  attachments?: AttachmentPayload[];
}

export const messageService = {
  getMessages: (
    conversationId: string,
    token: string,
    cursor?: string,
    limit?: number,
  ) => {
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (limit) params.set("limit", limit.toString());
    const qs = params.toString();
    return apiClient<MessagesCursorResponse>(
      `/conversations/${conversationId}/messages${qs ? `?${qs}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },

  sendMessage: (
    conversationId: string,
    data: SendMessageRequest,
    token: string,
  ) =>
    apiClient<MessageDto>(`/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  editMessage: (
    conversationId: string,
    messageId: string,
    content: string,
    token: string,
  ) =>
    apiClient<MessageDto>(
      `/conversations/${conversationId}/messages/${messageId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ content }),
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  deleteMessage: (
    conversationId: string,
    messageId: string,
    token: string,
  ) =>
    apiClient<MessageDto>(
      `/conversations/${conversationId}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  addReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    token: string,
  ) =>
    apiClient<{ id: string; messageId: string; userId: string; emoji: string; createdAt: string }>(
      `/conversations/${conversationId}/messages/${messageId}/reactions`,
      {
        method: "POST",
        body: JSON.stringify({ emoji }),
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  removeReaction: (
    conversationId: string,
    messageId: string,
    emoji: string,
    token: string,
  ) =>
    apiClient<void>(
      `/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    ),
};
