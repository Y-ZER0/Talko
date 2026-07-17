import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { verifyToken, clerkClient } from "@clerk/clerk-sdk-node";
import { Server, Socket } from "socket.io";
import {
  SocketEvent,
  type SendMessageEventPayload,
  type ReceiptReadEventPayload,
} from "@repo/shared";
import { MessagesService } from "../messages/messages.service";
import { UsersService } from "../users/users.service";
import { ConversationMembersRepository } from "../conversations/repositories/conversation-members.repository";
import { NotificationsService } from "../notifications/services/notifications.service";

@WebSocketGateway({
  cors: { origin: "*", credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly memberRepo: ConversationMembersRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        this.logger.warn("connection rejected: no token");
        socket.disconnect();
        return;
      }

      const secretKey = this.configService.get<string>("app.clerkSecretKey");
      if (!secretKey) {
        this.logger.error("connection rejected: clerkSecretKey missing in config");
        socket.disconnect();
        return;
      }

      const verifiedSession = await verifyToken(token, { secretKey });

      let user = await this.usersService.findByClerkId(verifiedSession.sub);

      if (!user) {
        const clerkUser = await clerkClient.users.getUser(verifiedSession.sub);
        user = await this.usersService.upsert({
          id: clerkUser.id,
          username:
            clerkUser.username ??
            clerkUser.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
            `user_${clerkUser.id.slice(-8)}`,
          imageUrl: clerkUser.imageUrl ?? undefined,
        });
      }

      socket.data.userId = user.id;
      socket.join(`user:${user.id}`);
    } catch (err) {
      this.logger.error("connection rejected: token verification failed", err);
      socket.disconnect();
    }
  }

  async handleDisconnect(_socket: Socket) {}

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

      this.notifyOfflineRecipients(
        payload.conversationId,
        senderId,
        message,
      ).catch((err) =>
        this.logger.error("Push notification dispatch failed", err),
      );
    } catch (err) {
      this.logger.error(`handleMessage failed for clientId=${payload?.clientId}`, err);
      socket.emit(SocketEvent.ERROR, { message: "Failed to send message" });
    }
  }

  private async notifyOfflineRecipients(
    conversationId: string,
    senderId: string,
    message: { id: string; content: string | null; senderId: string; conversationId: string },
  ): Promise<void> {
    try {
      const members = await this.memberRepo.findByConversation(conversationId);
      const recipientIds = members
        .map((m) => m.userId)
        .filter((id) => id !== senderId);

      if (recipientIds.length === 0) return;

      const socketsInRoom = await this.server
        .in(conversationId)
        .fetchSockets();
      const userIdsInRoom = new Set(socketsInRoom.map((s) => s.data.userId));

      const sender = await this.usersService.findById(senderId);
      const senderName = sender?.username ?? "Someone";

      for (const recipientId of recipientIds) {
        if (!userIdsInRoom.has(recipientId)) {
          const preview =
            message.content?.slice(0, 120) ?? "Sent an attachment";
          await this.notificationsService.notifyUser(
            recipientId,
            conversationId,
            senderName,
            preview,
            { messageId: message.id },
          );
        }
      }
    } catch (err) {
      this.logger.error("notifyOfflineRecipients failed", err);
    }
  }

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
