import { apiClient } from "@/shared/lib/api-client";

export const deviceTokenService = {
  register: (fcmToken: string, token: string) =>
    apiClient<void>("/notifications/register-token", {
      method: "POST",
      body: JSON.stringify({ fcmToken, platform: "web" }),
      headers: { Authorization: `Bearer ${token}` },
    }),

  unregister: (fcmToken: string, token: string) =>
    apiClient<void>(`/notifications/tokens/${encodeURIComponent(fcmToken)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
