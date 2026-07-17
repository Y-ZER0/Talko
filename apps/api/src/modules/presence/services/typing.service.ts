import { Injectable } from "@nestjs/common";
import { type TypingEventPayload } from "@repo/shared";
import { SocketRegistryService } from "./socket-registry.service";

const TYPING_TTL_SECONDS = 5;

@Injectable()
export class TypingService {
  constructor(private readonly socketRegistry: SocketRegistryService) {}

  async handleTypingStart(conversationId: string, userId: string): Promise<TypingEventPayload> {
    await this.socketRegistry.setTyping(conversationId, userId, TYPING_TTL_SECONDS);
    return { conversationId, userId };
  }

  async handleTypingStop(conversationId: string, userId: string): Promise<TypingEventPayload> {
    await this.socketRegistry.clearTyping(conversationId, userId);
    return { conversationId, userId };
  }
}
