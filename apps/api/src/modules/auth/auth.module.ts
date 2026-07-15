import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ClerkAuthGuard } from "./guards/clerk-auth.guard";
import { WebhooksController } from "./controllers/webhooks.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [WebhooksController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AuthModule {}
