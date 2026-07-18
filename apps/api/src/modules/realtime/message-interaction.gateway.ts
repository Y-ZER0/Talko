import { Logger, UnauthorizedException } from "@nestjs/common";
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
  type EditMessageEventPayload,
  type DeleteMessageEventPayload,
} from "@repo/shared";
import { MessagesService } from "../messages/messages.service";

@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class MessageInteractionGateway {
  private readonly logger = new Logger(MessageInteractionGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  @SubscribeMessage(SocketEvent.MESSAGE_EDIT)
  async handleMessageEdit(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: EditMessageEventPayload,
  ) {
    try {
      if (!payload.messageId || !payload.content) {
        socket.emit(SocketEvent.ERROR, { message: "Missing required fields" });
        return;
      }

      const userId = socket.data.userId;
      const edited = await this.messagesService.edit(userId, payload.messageId, payload.content);

      socket.broadcast
        .to(edited.conversationId)
        .emit(SocketEvent.MESSAGE_EDIT, edited);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        socket.emit(SocketEvent.ERROR, { message: "Not your message to edit" });
        return;
      }
      this.logger.error(`handleMessageEdit failed`, err);
      socket.emit(SocketEvent.ERROR, { message: "Failed to edit message" });
    }
  }

  @SubscribeMessage(SocketEvent.MESSAGE_DELETE)
  async handleMessageDelete(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: DeleteMessageEventPayload,
  ) {
    try {
      if (!payload.messageId) {
        socket.emit(SocketEvent.ERROR, { message: "Missing messageId" });
        return;
      }

      const userId = socket.data.userId;
      const deleted = await this.messagesService.delete(userId, payload.messageId);

      socket.broadcast
        .to(deleted.conversationId)
        .emit(SocketEvent.MESSAGE_DELETE, deleted);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        socket.emit(SocketEvent.ERROR, { message: "Not your message to delete" });
        return;
      }
      this.logger.error(`handleMessageDelete failed`, err);
      socket.emit(SocketEvent.ERROR, { message: "Failed to delete message" });
    }
  }
}
