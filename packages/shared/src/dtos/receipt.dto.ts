export interface ReceiptDto {
  id: string;
  messageId: string;
  userId: string;
  status: "delivered" | "read";
  readAt: string | null;
}
