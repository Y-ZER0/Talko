"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { notificationPreferencesService } from "../services/notification-preferences.service";

export const notificationPreferencesKeys = {
  all: ["notification-preferences"] as const,
};

export function useNotificationPreferences() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: notificationPreferencesKeys.all,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return notificationPreferencesService.getPreferences(token);
    },
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
}
