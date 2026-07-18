import { apiClient } from "@/shared/lib/api-client";
import type { SearchResultDto } from "@repo/shared";

export const searchService = {
  searchMessages: (query: string, token: string) => {
    const params = new URLSearchParams({ q: query });
    return apiClient<SearchResultDto[]>(`/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
