import { Module } from "@nestjs/common";
import { SocketRegistryService } from "./services/socket-registry.service";
import { PresenceService } from "./services/presence.service";
import { TypingService } from "./services/typing.service";
import { PresenceGateway } from "./presence.gateway";
import { PresenceController } from "./presence.controller";

@Module({
  imports: [],
  controllers: [PresenceController],
  providers: [SocketRegistryService, PresenceService, TypingService, PresenceGateway],
  exports: [PresenceService, TypingService],
})
export class PresenceModule {}
