import { Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SocketEvent } from "@repo/shared";
import { ConversationMembersRepository } from "../conversations/repositories/conversation-members.repository";

@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class ConversationGateway {
  private readonly logger = new Logger(ConversationGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly memberRepo: ConversationMembersRepository,
  ) {}

  @SubscribeMessage(SocketEvent.CONVERSATION_JOIN)
  handleConversationJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    socket.join(payload.conversationId);
  }

  @SubscribeMessage(SocketEvent.CONVERSATION_LEAVE)
  handleConversationLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    socket.leave(payload.conversationId);
  }

  @SubscribeMessage(SocketEvent.CONVERSATION_OPEN)
  async handleConversationOpen(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const userId = socket.data.userId;
      await this.memberRepo.updateLastReadAt(
        payload.conversationId,
        userId,
        new Date(),
      );

      socket.emit(SocketEvent.CONVERSATION_OPENED, {
        conversationId: payload.conversationId,
        readBy: userId,
      });

      const members = await this.memberRepo.findByConversation(payload.conversationId);
      for (const member of members) {
        if (member.userId !== userId) {
          this.server
            .to(`user:${member.userId}`)
            .emit(SocketEvent.CONVERSATION_OPENED, {
              conversationId: payload.conversationId,
              readBy: userId,
            });
        }
      }
    } catch (err) {
      this.logger.error(`handleConversationOpen failed`, err);
    }
  }
}
