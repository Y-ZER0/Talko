import { apiClient } from "@/shared/lib/api-client";

const TAG = "[deviceTokenService]";

export const deviceTokenService = {
  register: async (fcmToken: string, token: string) => {
    console.log(TAG, "register() called", { fcmToken: `${fcmToken.substring(0, 20)}...`, platform: "web" });
    try {
      const result = await apiClient<void>("/notifications/register-token", {
        method: "POST",
        body: JSON.stringify({ fcmToken, platform: "web" }),
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(TAG, "register() success:", result);
      return result;
    } catch (err) {
      console.error(TAG, "register() failed:", err);
      throw err;
    }
  },

  unregister: async (fcmToken: string, token: string) => {
    console.log(TAG, "unregister() called", { fcmToken: `${fcmToken.substring(0, 20)}...` });
    try {
      const result = await apiClient<void>(`/notifications/tokens/${encodeURIComponent(fcmToken)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(TAG, "unregister() success:", result);
      return result;
    } catch (err) {
      console.error(TAG, "unregister() failed:", err);
      throw err;
    }
  },
};
