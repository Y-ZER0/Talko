import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  initializeApp,
  getApps,
  cert,
} from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import type { App } from "firebase-admin";

export interface FcmSendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private app: App | null = null;

  constructor(private readonly configService: ConfigService) {
    if (getApps().length === 0) {
      const projectId = this.configService.get<string>("app.fcm.projectId");
      const clientEmail = this.configService.get<string>("app.fcm.clientEmail");
      const privateKey = this.configService.get<string>("app.fcm.privateKey");

      if (projectId && clientEmail && privateKey) {
        this.app = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, "\n"),
          }),
        });
        this.logger.log("Firebase Admin initialized successfully");
      } else {
        this.logger.warn("FCM credentials missing — push notifications disabled");
      }
    } else {
      this.app = getApps()[0];
    }
  }

  async sendPush(
    tokens: string[],
    payload: { title: string; body: string; data?: Record<string, string> },
  ): Promise<FcmSendResult> {
    const result: FcmSendResult = { successCount: 0, failureCount: 0, invalidTokens: [] };
    if (tokens.length === 0) return result;
    if (!this.app) {
      this.logger.warn("FCM not initialized — skipping push");
      return result;
    }

    try {
      const messaging = getMessaging(this.app);
      const message = {
        tokens,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
      };

      const response = await messaging.sendEachForMulticast(message);
      result.successCount = response.successCount;
      result.failureCount = response.failureCount;

      for (let i = 0; i < response.responses.length; i++) {
        const resp = response.responses[i];
        if (
          !resp.success &&
          resp.error
        ) {
          if (
            resp.error.code === "messaging/invalid-registration-token" ||
            resp.error.code === "messaging/registration-token-not-registered"
          ) {
            result.invalidTokens.push(tokens[i]);
          }
        }
      }

      if (result.failureCount > 0) {
        this.logger.warn(
          `FCM: ${result.successCount} sent, ${result.failureCount} failed`,
        );
      }
    } catch (err) {
      this.logger.error("FCM send failed", err);
    }

    return result;
  }
}
