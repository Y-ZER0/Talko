export interface MessageAttachmentDto {
  id: string;
  messageId: string;
  mediaUrl: string;
  mediaType: string;
  thumbnailUrl: string | null;
  fileSizeBytes: number | null;
  createdAt: string;
}
