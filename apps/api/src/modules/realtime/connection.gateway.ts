import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { verifyToken, clerkClient } from "@clerk/clerk-sdk-node";
import { Server, Socket } from "socket.io";
import { UsersService } from "../users/users.service";
import { PresenceService } from "../presence/services/presence.service";

@WebSocketGateway({
  namespace: "/",
  cors: { origin: "*", credentials: true },
})
export class ConnectionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ConnectionGateway.name);
  @WebSocketServer() server!: Server;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly presenceService: PresenceService,
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

      const payload = await this.presenceService.setOnline(user.id);
      this.server.emit("presence:update", payload);
    } catch (err) {
      this.logger.error("connection rejected: token verification failed", err);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.userId as string | undefined;
    if (!userId) return;

    const payload = await this.presenceService.setOffline(userId);
    this.server.emit("presence:update", payload);
  }
}
