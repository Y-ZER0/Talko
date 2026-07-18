import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { SocketEvent } from "@repo/shared";
import type { TypingEventPayload } from "@repo/shared";
import { PresenceService } from "./services/presence.service";
import { TypingService } from "./services/typing.service";

@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class PresenceGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(PresenceGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly presenceService: PresenceService,
    private readonly typingService: TypingService,
  ) {}

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

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
