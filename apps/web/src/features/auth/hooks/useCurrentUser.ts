"use client";

import { useUser } from "@clerk/nextjs";

export function useCurrentUser() {
  return useUser();
}
