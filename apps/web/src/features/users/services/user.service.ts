import { apiClient } from "@/shared/lib/api-client";

export interface UserSearchResult {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export const userService = {
  searchByUsername: (query: string, token: string) => {
    const params = new URLSearchParams({ q: query });
    return apiClient<UserSearchResult[]>(`/users/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
