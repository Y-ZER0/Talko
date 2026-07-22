import type { MessageAttachmentDto } from "./message-attachment.dto";
import type { ReactionDto } from "./reaction.dto";

export interface MessageReceiptDto {
  userId: string;
  status: string;
  readAt: string | null;
}

export interface ParentMessageDto {
  id: string;
  senderId: string;
  senderName: string;
  content: string | null;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  parentId: string | null;
  parentMessage: ParentMessageDto | null;
  content: string | null;
  attachments: MessageAttachmentDto[];
  reactions: ReactionDto[];
  receipts: MessageReceiptDto[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  clientId: string;
}

export interface MessagesCursorResponse {
  data: MessageDto[];
  nextCursor: string | null;
  hasMore: boolean;
}
