import { apiClient } from "@/shared/lib/api-client";
import type { PresenceEventPayload } from "@repo/shared";

export const presenceService = {
  getPresence: (userId: string, token: string) =>
    apiClient<PresenceEventPayload>(`/presence/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
