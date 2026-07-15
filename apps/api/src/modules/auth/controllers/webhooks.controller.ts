import {
  Controller,
  Post,
  Headers,
  Req,
  UnauthorizedException,
  RawBodyRequest,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Webhook } from "svix";
import { Public } from "../decorators/public.decorator";
import { UsersService } from "../../users/users.service";
import type { Request } from "express";

@Controller("webhooks")
export class WebhooksController {
  private readonly webhook: Webhook;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = this.configService.get<string>("app.clerkWebhookSecret");
    if (!secret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not configured");
    }
    this.webhook = new Webhook(secret);
  }

  @Post("clerk")
  @Public()
  async handleClerkWebhook(
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new UnauthorizedException("Missing Svix headers");
    }

    const rawBody = req.rawBody?.toString();
    if (!rawBody) {
      throw new UnauthorizedException("Missing request body");
    }

    let evt: { type: string; data: Record<string, any> };
    try {
      evt = this.webhook.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as any;
    } catch {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    const { type, data } = evt;

    switch (type) {
      case "user.created":
      case "user.updated":
        await this.usersService.upsert({
          id: data.id,
          username:
            data.username ??
            data.email_addresses?.[0]?.email_address?.split("@")[0] ??
            `user_${data.id.slice(-8)}`,
          imageUrl: data.image_url ?? undefined,
        });
        break;

      case "user.deleted":
        if (data.id) {
          await this.usersService.removeByClerkId(data.id);
        }
        break;
    }

    return { success: true };
  }
}
