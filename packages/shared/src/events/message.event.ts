import { MessageDto } from "../dtos/message.dto";

export interface AttachmentPayload {
  mediaUrl: string;
  mediaType: string;
  fileSize?: number;
}

export interface SendMessageEventPayload {
  conversationId: string;
  content: string | null;
  parentId?: string | null;
  clientId: string;
  attachments?: AttachmentPayload[];
}

export interface MessageAckEventPayload {
  clientId: string;
  message: MessageDto;
}

export interface EditMessageEventPayload {
  messageId: string;
  content: string;
}

export interface DeleteMessageEventPayload {
  messageId: string;
  conversationId: string;
}

export interface ReactionEventPayload {
  messageId: string;
  conversationId: string;
  emoji: string;
}
