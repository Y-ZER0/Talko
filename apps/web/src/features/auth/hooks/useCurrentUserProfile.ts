"use client";

import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { UserDto } from "@repo/shared";

export const currentUserKeys = {
  profile: ["current-user", "profile"] as const,
};

export function useCurrentUserProfile() {
  const { getToken, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: currentUserKeys.profile,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      const res = await authService.getCurrentUser(token);
      return res;
    },
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!clerkUser?.username || !isSignedIn) return;

    const syncUsername = async () => {
      const token = await getToken();
      if (!token) return;

      const currentProfile = queryClient.getQueryData<UserDto>(currentUserKeys.profile);
      if (currentProfile && currentProfile.username !== clerkUser.username) {
        try {
          await authService.updateProfile({ username: clerkUser.username ?? undefined }, token);
          queryClient.invalidateQueries({ queryKey: currentUserKeys.profile });
        } catch {
          // Username sync failed, will retry on next render
        }
      }
    };

    syncUsername();
  }, [clerkUser?.username, isSignedIn, getToken, queryClient]);

  return query;
}
