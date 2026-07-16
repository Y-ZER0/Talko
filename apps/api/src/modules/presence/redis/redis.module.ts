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
          console.warn("REDIS_URL not configured — Redis features disabled");
          return null;
        }
        const client = new Redis(url);
        client.on("error", () => {
          console.warn("Redis connection failed — Redis features unavailable");
        });
        return client;
      },
    },
  ],
  exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
