import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DeviceToken } from "../entities/device-token.entity";

@Injectable()
export class DeviceTokensRepository {
  constructor(
    @InjectRepository(DeviceToken)
    private readonly repo: Repository<DeviceToken>,
  ) {}

  async upsert(
    userId: string,
    fcmToken: string,
    platform: string,
  ): Promise<DeviceToken> {
    const existing = await this.repo.findOne({ where: { fcmToken } });
    if (existing) {
      if (existing.userId !== userId) {
        existing.userId = userId;
      }
      existing.platform = platform;
      existing.lastActiveAt = new Date();
      return this.repo.save(existing);
    }
    return this.repo.save({ userId, fcmToken, platform });
  }

  async findByUser(userId: string): Promise<DeviceToken[]> {
    return this.repo.find({ where: { userId } });
  }

  async remove(fcmToken: string): Promise<void> {
    await this.repo.delete({ fcmToken });
  }

  async removeByUser(userId: string): Promise<void> {
    await this.repo.delete({ userId });
  }
}
