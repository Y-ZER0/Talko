import { apiClient } from "@/shared/lib/api-client";
import type { UserDto } from "@repo/shared";

export type UpdateProfileRequest = {
  username?: string;
  avatarUrl?: string;
  readReceiptsEnabled?: boolean;
};

export const authService = {
  getCurrentUser: (token: string) =>
    apiClient<UserDto>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (data: UpdateProfileRequest, token: string) =>
    apiClient<UserDto>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),
};
