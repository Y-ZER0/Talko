import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Global()
@Module({
  providers: [
    {
      provide: "REDIS_CLIENT",
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>("app.redisUrl");
        if (!url) {
          throw new Error("REDIS_URL is not configured");
        }
        return new Redis(url);
      },
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
