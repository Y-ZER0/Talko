"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { currentUserKeys } from "./useCurrentUserProfile";
import type { UpdateProfileRequest } from "../services/auth.service";

export function useUpdateProfile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return authService.updateProfile(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currentUserKeys.profile });
    },
  });
}
