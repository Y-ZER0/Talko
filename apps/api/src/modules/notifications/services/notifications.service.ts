import { Injectable, Logger } from "@nestjs/common";
import { DeviceTokensRepository } from "../repositories/device-tokens.repository";
import { FcmService } from "./fcm.service";
import { RegisterTokenRequestDto } from "../dto/register-token-request.dto";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly deviceTokensRepository: DeviceTokensRepository,
    private readonly fcmService: FcmService,
  ) {}

  async registerToken(
    userId: string,
    dto: RegisterTokenRequestDto,
  ): Promise<void> {
    this.logger.log(`registerToken: userId=${userId}, platform=${dto.platform}, token=${dto.fcmToken.substring(0, 20)}...`);
    await this.deviceTokensRepository.upsert(userId, dto.fcmToken, dto.platform);
    this.logger.log(`registerToken: success for userId=${userId}`);
  }

  async unregisterToken(userId: string, fcmToken: string): Promise<void> {
    this.logger.log(`unregisterToken: userId=${userId}, token=${fcmToken.substring(0, 20)}...`);
    await this.deviceTokensRepository.remove(fcmToken);
    this.logger.log(`unregisterToken: success`);
  }

  async notifyUser(
    userId: string,
    conversationId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    this.logger.log(`notifyUser: userId=${userId}, conversationId=${conversationId}`);

    const devices = await this.deviceTokensRepository.findByUser(userId);
    this.logger.log(`notifyUser: found ${devices.length} device(s) for userId=${userId}`);

    if (devices.length === 0) {
      this.logger.warn(`notifyUser: NO devices registered for userId=${userId} — push notification will NOT be sent`);
      return;
    }

    const tokens = devices.map((d) => d.fcmToken);
    this.logger.log(`notifyUser: sending push to ${tokens.length} token(s) for userId=${userId}`);

    const result = await this.fcmService.sendPush(tokens, {
      title,
      body,
      data: { conversationId, ...data },
    });

    this.logger.log(`notifyUser: push result — success=${result.successCount}, failure=${result.failureCount}, invalidTokens=${result.invalidTokens.length}`);

    if (result.invalidTokens.length > 0) {
      this.logger.warn(`notifyUser: removing ${result.invalidTokens.length} invalid token(s)`);
      for (const token of result.invalidTokens) {
        await this.deviceTokensRepository.remove(token);
      }
    }
  }
}
