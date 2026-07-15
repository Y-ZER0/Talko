export interface ConversationDto {
  id: string;
  isGroup: boolean;
  groupName: string | null;
  createdAt: string;
  lastMessage: ConversationLastMessageDto | null;
  members: ConversationMemberWithUserDto[];
  unreadCount: number;
}

export interface ConversationMemberDto {
  id: string;
  conversationId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface ConversationMemberWithUserDto extends ConversationMemberDto {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface ConversationLastMessageDto {
  content: string | null;
  createdAt: string;
  senderId: string;
}

export interface CreateConversationResponseDto {
  id: string;
  isGroup: boolean;
  groupName: string | null;
  createdAt: string;
  members: ConversationMemberWithUserDto[];
}
