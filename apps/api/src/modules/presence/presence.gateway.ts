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
import { SocketEvent } from "@repo/shared";
import type { TypingEventPayload } from "@repo/shared";
import { UsersService } from "../users/users.service";
import { PresenceService } from "./services/presence.service";
import { TypingService } from "./services/typing.service";

@WebSocketGateway({
  cors: { origin: "*", credentials: true },
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(PresenceGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly typingService: TypingService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      const secretKey = this.configService.get<string>("app.clerkSecretKey");
      if (!secretKey) {
        this.logger.error("clerkSecretKey missing in config");
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

      const payload = await this.presenceService.setOnline(user.id);
      this.server.emit(SocketEvent.PRESENCE_UPDATE, payload);
    } catch (err) {
      this.logger.error("connection rejected", err);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

    const payload = await this.presenceService.setOffline(userId);
    this.server.emit(SocketEvent.PRESENCE_UPDATE, payload);

    const typingConversations = socket.data.typingConversations as Set<string> | undefined;
    if (typingConversations) {
      for (const conversationId of typingConversations) {
        const broadcastPayload: TypingEventPayload = { conversationId, userId };
        this.server.to(conversationId).emit(SocketEvent.TYPING_STOP, broadcastPayload);
      }
    }
  }

  @SubscribeMessage(SocketEvent.TYPING_START)
  async handleTypingStart(
    @MessageBody() payload: TypingEventPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

    const typingConversations: Set<string> =
      socket.data.typingConversations ?? new Set();
    typingConversations.add(payload.conversationId);
    socket.data.typingConversations = typingConversations;

    const broadcastPayload = await this.typingService.handleTypingStart(
      payload.conversationId,
      userId,
    );

    socket.to(payload.conversationId).emit(SocketEvent.TYPING_START, broadcastPayload);
  }

  @SubscribeMessage(SocketEvent.TYPING_STOP)
  async handleTypingStop(
    @MessageBody() payload: TypingEventPayload,
    @ConnectedSocket() socket: Socket,
  ) {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

    const typingConversations = socket.data.typingConversations as Set<string> | undefined;
    if (typingConversations) {
      typingConversations.delete(payload.conversationId);
    }

    const broadcastPayload = await this.typingService.handleTypingStop(
      payload.conversationId,
      userId,
    );

    socket.to(payload.conversationId).emit(SocketEvent.TYPING_STOP, broadcastPayload);
  }

  @SubscribeMessage(SocketEvent.PING)
  async handlePing(@ConnectedSocket() socket: Socket) {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

    await this.presenceService.handleHeartbeat(userId);
    socket.emit(SocketEvent.PONG);
  }
}
