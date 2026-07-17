import { Injectable } from "@nestjs/common";
import { type PresenceEventPayload } from "@repo/shared";
import { SocketRegistryService } from "./socket-registry.service";

@Injectable()
export class PresenceService {
  constructor(private readonly socketRegistry: SocketRegistryService) {}

  async setOnline(userId: string): Promise<PresenceEventPayload> {
    const now = new Date().toISOString();
    await Promise.all([
      this.socketRegistry.setStatus(userId, "online"),
      this.socketRegistry.setLastSeen(userId, now),
      this.socketRegistry.refreshHeartbeat(userId),
    ]);
    return { userId, status: "online" };
  }

  async setOffline(userId: string): Promise<PresenceEventPayload> {
    const now = new Date().toISOString();
    await Promise.all([
      this.socketRegistry.setStatus(userId, "offline"),
      this.socketRegistry.setLastSeen(userId, now),
    ]);
    return { userId, status: "offline", lastSeen: now };
  }

  async getPresence(userId: string): Promise<PresenceEventPayload> {
    const [status, lastSeen] = await Promise.all([
      this.socketRegistry.getStatus(userId),
      this.socketRegistry.getLastSeen(userId),
    ]);
    return {
      userId,
      status: status ?? "offline",
      ...(lastSeen ? { lastSeen } : {}),
    };
  }

  async handleHeartbeat(userId: string): Promise<void> {
    await this.socketRegistry.refreshHeartbeat(userId);
  }
}
