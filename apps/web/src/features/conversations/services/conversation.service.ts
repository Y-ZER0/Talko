import { apiClient } from "@/shared/lib/api-client";
import type {
  ConversationDto,
  CreateConversationResponseDto,
} from "@repo/shared";

export type CreateConversationRequest =
  | { type: "direct"; participantId: string }
  | { type: "group"; participantIds: string[]; groupName: string };

export const conversationService = {
  getMyConversations: (token: string) =>
    apiClient<ConversationDto[]>("/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getConversation: (conversationId: string, token: string) =>
    apiClient<ConversationDto>(`/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  createConversation: (data: CreateConversationRequest, token: string) =>
    apiClient<CreateConversationResponseDto>("/conversations", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteConversation: (conversationId: string, token: string) =>
    apiClient<void>(`/conversations/${conversationId}/leave`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteGroup: (conversationId: string, token: string) =>
    apiClient<void>(`/conversations/${conversationId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
