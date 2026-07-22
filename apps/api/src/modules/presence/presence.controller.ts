import { Controller, Get, Param } from "@nestjs/common";
import { PresenceService } from "./services/presence.service";

@Controller("presence")
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get(":userId")
  async getPresence(@Param("userId") userId: string) {
    return this.presenceService.getPresence(userId);
  }
}
