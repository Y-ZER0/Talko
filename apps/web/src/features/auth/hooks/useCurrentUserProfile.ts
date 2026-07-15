"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { UserDto } from "@repo/shared";

export const currentUserKeys = {
  profile: ["current-user", "profile"] as const,
};

export function useCurrentUserProfile() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
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
}
