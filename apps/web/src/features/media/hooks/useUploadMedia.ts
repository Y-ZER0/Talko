"use client";

import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { mediaService, type UploadResult } from "../services/media.service";

export function useUploadMedia() {
  const { getToken } = useAuth();

  return useMutation<UploadResult, Error, File>({
    mutationFn: async (file) => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return mediaService.upload(file, token);
    },
  });
}
