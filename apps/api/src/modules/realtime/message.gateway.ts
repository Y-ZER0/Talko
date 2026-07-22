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
  type SendMessageEventPayload,
} from "@repo/shared";
import { MessagesService } from "../messages/messages.service";
import { UsersService } from "../users/users.service";
import { ConversationMembersRepository } from "../conversations/repositories/conversation-members.repository";
@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class MessageGateway {
  private readonly logger = new Logger(MessageGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly memberRepo: ConversationMembersRepository,
    private readonly usersService: UsersService,
  ) {}

  @SubscribeMessage(SocketEvent.MESSAGE_NEW)
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: SendMessageEventPayload,
  ) {
    try {
      if (!payload.clientId || !payload.conversationId) {
        socket.emit(SocketEvent.ERROR, { message: "Missing required fields" });
        return;
      }

      const senderId = socket.data.userId;
      const message = await this.messagesService.create(
        senderId,
        payload.conversationId,
        {
          content: payload.content ?? undefined,
          parentId: payload.parentId ?? undefined,
          clientId: payload.clientId,
          attachments: payload.attachments?.map((a) => ({
            mediaUrl: a.mediaUrl,
            mediaType: a.mediaType as any,
            fileSize: a.fileSize,
          })),
        },
      );

      socket.emit(SocketEvent.MESSAGE_ACK, {
        clientId: payload.clientId,
        message,
      });

      socket.broadcast
        .to(payload.conversationId)
        .emit(SocketEvent.MESSAGE_NEW, message);

      this.notifyMemberUserRooms(
        payload.conversationId,
        senderId,
        message,
      );
    } catch (err) {
      this.logger.error(`handleMessage failed for clientId=${payload?.clientId}`, err);
      socket.emit(SocketEvent.ERROR, { message: "Failed to send message" });
    }
  }

  private async notifyMemberUserRooms(
    conversationId: string,
    senderId: string,
    message: { id: string; content: string | null; senderId: string; conversationId: string; parentId: string | null },
  ): Promise<void> {
    try {
      const members = await this.memberRepo.findByConversation(conversationId);
      for (const member of members) {
        if (member.userId !== senderId) {
          this.server.to(`user:${member.userId}`).emit(SocketEvent.MESSAGE_NEW, message);
        }
      }
    } catch (err) {
      this.logger.error("notifyMemberUserRooms failed", err);
    }
  }
}
