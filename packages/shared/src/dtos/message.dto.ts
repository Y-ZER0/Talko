export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  parentId: string | null;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  clientId: string;
}
