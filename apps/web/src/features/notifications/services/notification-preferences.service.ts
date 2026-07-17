import { apiClient } from "@/shared/lib/api-client";
import type {
  NotificationPreferencesDto,
  UpdateNotificationPreferencesRequest,
} from "@repo/shared";

export const notificationPreferencesService = {
  getPreferences: (token: string) =>
    apiClient<NotificationPreferencesDto>("/users/me/notification-preferences", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updatePreferences: (
    data: UpdateNotificationPreferencesRequest,
    token: string,
  ) =>
    apiClient<NotificationPreferencesDto>("/users/me/notification-preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),
};
