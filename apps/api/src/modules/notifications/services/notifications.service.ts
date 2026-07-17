import { Injectable } from "@nestjs/common";
import { DeviceTokensRepository } from "../repositories/device-tokens.repository";
import { FcmService } from "./fcm.service";
import { RegisterTokenRequestDto } from "../dto/register-token-request.dto";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly deviceTokensRepository: DeviceTokensRepository,
    private readonly fcmService: FcmService,
  ) {}

  async registerToken(
    userId: string,
    dto: RegisterTokenRequestDto,
  ): Promise<void> {
    await this.deviceTokensRepository.upsert(userId, dto.fcmToken, dto.platform);
  }

  async unregisterToken(userId: string, fcmToken: string): Promise<void> {
    await this.deviceTokensRepository.remove(fcmToken);
  }

  async notifyUser(
    userId: string,
    conversationId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const devices = await this.deviceTokensRepository.findByUser(userId);
    if (devices.length === 0) return;

    const tokens = devices.map((d) => d.fcmToken);
    const result = await this.fcmService.sendPush(tokens, {
      title,
      body,
      data: { conversationId, ...data },
    });

    if (result.invalidTokens.length > 0) {
      for (const token of result.invalidTokens) {
        await this.deviceTokensRepository.remove(token);
      }
    }
  }
}
