import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DeviceToken } from "../entities/device-token.entity";

@Injectable()
export class DeviceTokensRepository {
  private readonly logger = new Logger(DeviceTokensRepository.name);

  constructor(
    @InjectRepository(DeviceToken)
    private readonly repo: Repository<DeviceToken>,
  ) {}

  async upsert(
    userId: string,
    fcmToken: string,
    platform: string,
  ): Promise<DeviceToken> {
    this.logger.log(`upsert: userId=${userId}, platform=${platform}, token=${fcmToken.substring(0, 20)}...`);
    const existing = await this.repo.findOne({ where: { fcmToken } });
    if (existing) {
      this.logger.log(`upsert: existing token found (id=${existing.id}), updating`);
      if (existing.userId !== userId) {
        existing.userId = userId;
      }
      existing.platform = platform;
      existing.lastActiveAt = new Date();
      const saved = await this.repo.save(existing);
      this.logger.log(`upsert: updated token id=${saved.id}`);
      return saved;
    }
    const saved = await this.repo.save({ userId, fcmToken, platform });
    this.logger.log(`upsert: created new token id=${saved.id} for userId=${userId}`);
    return saved;
  }

  async findByUser(userId: string): Promise<DeviceToken[]> {
    const tokens = await this.repo.find({ where: { userId } });
    this.logger.log(`findByUser: userId=${userId} → ${tokens.length} token(s)`);
    return tokens;
  }

  async remove(fcmToken: string): Promise<void> {
    this.logger.log(`remove: token=${fcmToken.substring(0, 20)}...`);
    await this.repo.delete({ fcmToken });
    this.logger.log(`remove: done`);
  }

  async removeByUser(userId: string): Promise<void> {
    this.logger.log(`removeByUser: userId=${userId}`);
    await this.repo.delete({ userId });
    this.logger.log(`removeByUser: done`);
  }
}
