import { Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {
  SocketEvent,
  type ReceiptReadEventPayload,
} from "@repo/shared";
import { MessagesService } from "../messages/messages.service";
import { UsersService } from "../users/users.service";

@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class ReceiptGateway {
  private readonly logger = new Logger(ReceiptGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @SubscribeMessage(SocketEvent.RECEIPT_READ)
  async handleReceiptRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: ReceiptReadEventPayload,
  ) {
    try {
      const userId = socket.data.userId;

      const enabled = await this.usersService.getReadReceiptsEnabled(userId);
      if (!enabled) return;

      const grouped = await this.messagesService.markAsRead(
        userId,
        payload.conversationId,
        payload.messageIds,
      );

      for (const [senderId, updates] of Object.entries(grouped)) {
        this.server.to(`user:${senderId}`).emit(SocketEvent.RECEIPT_UPDATE, updates);
      }
    } catch (err) {
      this.logger.error(`handleReceiptRead failed`, err);
      socket.emit(SocketEvent.ERROR, { message: "Failed to mark as read" });
    }
  }
}
