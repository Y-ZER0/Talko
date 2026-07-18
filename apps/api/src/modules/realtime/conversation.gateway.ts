import { Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { SocketEvent } from "@repo/shared";
import { ConversationMembersRepository } from "../conversations/repositories/conversation-members.repository";

@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class ConversationGateway {
  private readonly logger = new Logger(ConversationGateway.name);

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

  @SubscribeMessage(SocketEvent.CONVERSATION_OPEN)
  async handleConversationOpen(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      await this.memberRepo.updateLastReadAt(
        payload.conversationId,
        socket.data.userId,
        new Date(),
      );
    } catch (err) {
      this.logger.error(`handleConversationOpen failed`, err);
    }
  }
}
