import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  port: parseInt(process.env.PORT || "3001", 10),
  databaseUrl: process.env.DATABASE_URL || "",
  redisUrl: process.env.REDIS_URL || "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY || "",
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET || "",
  fcm: {
    projectId: process.env.FCM_PROJECT_ID || "",
    clientEmail: process.env.FCM_CLIENT_EMAIL || "",
    privateKey: process.env.FCM_PRIVATE_KEY || "",
  },
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
  },
}));
