export interface ConversationDto {
  id: string;
  isGroup: boolean;
  groupName: string | null;
  createdAt: string;
}

export interface ConversationMemberDto {
  id: string;
  conversationId: string;
  userId: string;
  role: string;
  joinedAt: string;
}
