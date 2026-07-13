export interface ReceiptReadEventPayload {
  conversationId: string;
  messageIds: string[];
}

export interface ReceiptUpdateEventPayload {
  messageId: string;
  userId: string;
  status: "delivered" | "read";
  readAt?: string;
}
