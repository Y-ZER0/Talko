import type { MessageAttachmentDto } from "./message-attachment.dto";
import type { ReactionDto } from "./reaction.dto";

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  parentId: string | null;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  attachments: MessageAttachmentDto[];
  reactions: ReactionDto[];
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
