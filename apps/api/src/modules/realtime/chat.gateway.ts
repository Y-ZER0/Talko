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
import { verifyToken, clerkClient } from "@clerk/clerk-sdk-node";
import { Server, Socket } from "socket.io";
import { SocketEvent, type SendMessageEventPayload } from "@repo/shared";
import { MessagesService } from "../messages/messages.service";
import { UsersService } from "../users/users.service";

@WebSocketGateway({
  cors: { origin: "*", credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(
    private readonly messagesService: MessagesService,
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
    } catch {
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

      const message = await this.messagesService.create(
        socket.data.userId,
        payload.conversationId,
        {
          content: payload.content ?? undefined,
          parentId: payload.parentId ?? undefined,
          clientId: payload.clientId,
        },
      );

      socket.emit(SocketEvent.MESSAGE_ACK, {
        clientId: payload.clientId,
        message,
      });

      socket.broadcast
        .to(payload.conversationId)
        .emit(SocketEvent.MESSAGE_NEW, message);
    } catch {
      socket.emit(SocketEvent.ERROR, { message: "Failed to send message" });
    }
  }
}
