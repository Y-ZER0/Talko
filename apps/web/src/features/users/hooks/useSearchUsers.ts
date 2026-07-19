"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { userService, type UserSearchResult } from "../services/user.service";

const userSearchKeys = {
  all: ["users"] as const,
  search: (query: string) => [...userSearchKeys.all, "search", query] as const,
};

export function useSearchUsers(query: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<UserSearchResult[]>({
    queryKey: userSearchKeys.search(query),
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return userService.searchByUsername(query, token);
    },
    enabled: isSignedIn && query.trim().length >= 2,
    staleTime: 30_000,
  });
}
