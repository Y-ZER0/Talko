import { Inject, Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";

const STATUS_TTL = 60;
const STATUS_PREFIX = "user:{id}:status";
const LAST_SEEN_PREFIX = "user:{id}:lastSeen";

@Injectable()
export class SocketRegistryService {
  private readonly logger = new Logger(SocketRegistryService.name);

  constructor(@Inject("REDIS_CLIENT") private readonly redis: Redis | null) {}

  async setStatus(userId: string, status: "online" | "offline"): Promise<void> {
    if (!this.redis) return;
    const key = STATUS_PREFIX.replace("{id}", userId);
    if (status === "online") {
      await this.redis.set(key, status, "EX", STATUS_TTL);
    } else {
      await this.redis.set(key, status);
    }
  }

  async getStatus(userId: string): Promise<"online" | "offline" | null> {
    if (!this.redis) return null;
    const key = STATUS_PREFIX.replace("{id}", userId);
    const val = await this.redis.get(key);
    return (val as "online" | "offline" | null) ?? null;
  }

  async setLastSeen(userId: string, timestamp: string): Promise<void> {
    if (!this.redis) return;
    const key = LAST_SEEN_PREFIX.replace("{id}", userId);
    await this.redis.set(key, timestamp);
  }

  async getLastSeen(userId: string): Promise<string | null> {
    if (!this.redis) return null;
    const key = LAST_SEEN_PREFIX.replace("{id}", userId);
    return this.redis.get(key);
  }

  async refreshHeartbeat(userId: string): Promise<void> {
    if (!this.redis) return;
    const key = STATUS_PREFIX.replace("{id}", userId);
    await this.redis.expire(key, STATUS_TTL);
  }

  async setTyping(conversationId: string, userId: string, ttl = 5): Promise<void> {
    if (!this.redis) return;
    const key = `conv:${conversationId}:typing:${userId}`;
    await this.redis.set(key, "1", "EX", ttl);
  }

  async clearTyping(conversationId: string, userId: string): Promise<void> {
    if (!this.redis) return;
    const key = `conv:${conversationId}:typing:${userId}`;
    await this.redis.del(key);
  }
}
