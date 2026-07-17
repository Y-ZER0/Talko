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
};
