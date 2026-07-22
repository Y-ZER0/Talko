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
  type ReactionEventPayload,
} from "@repo/shared";
import { MessagesService } from "../messages/messages.service";

@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class ReactionGateway {
  private readonly logger = new Logger(ReactionGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  @SubscribeMessage(SocketEvent.REACTION_ADD)
  async handleReactionAdd(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: ReactionEventPayload,
  ) {
    try {
      if (!payload.messageId || !payload.emoji) {
        socket.emit(SocketEvent.ERROR, { message: "Missing required fields" });
        return;
      }

      const userId = socket.data.userId;
      const { reaction, replacedEmoji } = await this.messagesService.addReaction(
        userId,
        payload.messageId,
        payload.emoji,
      );

      if (replacedEmoji) {
        socket.broadcast
          .to(payload.conversationId)
          .emit(SocketEvent.REACTION_REMOVE, {
            messageId: payload.messageId,
            conversationId: payload.conversationId,
            emoji: replacedEmoji,
            userId,
          });
      }

      socket.broadcast
        .to(payload.conversationId)
        .emit(SocketEvent.REACTION_ADD, {
          messageId: payload.messageId,
          conversationId: payload.conversationId,
          emoji: payload.emoji,
          reaction,
        });
    } catch (err) {
      this.logger.error(`handleReactionAdd failed`, err);
      socket.emit(SocketEvent.ERROR, { message: "Failed to add reaction" });
    }
  }

  @SubscribeMessage(SocketEvent.REACTION_REMOVE)
  async handleReactionRemove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: ReactionEventPayload,
  ) {
    try {
      if (!payload.messageId || !payload.emoji) {
        socket.emit(SocketEvent.ERROR, { message: "Missing required fields" });
        return;
      }

      const userId = socket.data.userId;
      await this.messagesService.removeReaction(
        userId,
        payload.messageId,
        payload.emoji,
      );

      socket.broadcast
        .to(payload.conversationId)
        .emit(SocketEvent.REACTION_REMOVE, {
          messageId: payload.messageId,
          conversationId: payload.conversationId,
          emoji: payload.emoji,
          userId,
        });
    } catch (err) {
      this.logger.error(`handleReactionRemove failed`, err);
      socket.emit(SocketEvent.ERROR, { message: "Failed to remove reaction" });
    }
  }
}
