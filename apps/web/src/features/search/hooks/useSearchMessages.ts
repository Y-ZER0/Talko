"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { searchService } from "../services/search.service";
import { searchKeys } from "./searchKeys";
import type { SearchResultDto } from "@repo/shared";

export function useSearchMessages(query: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<SearchResultDto[]>({
    queryKey: searchKeys.list(query),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return searchService.searchMessages(query, token);
    },
    enabled: isSignedIn && query.length >= 2,
    staleTime: 30_000,
  });
}
