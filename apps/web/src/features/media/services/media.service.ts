import { apiClient, apiUrl } from "@/shared/lib/api-client";
import type { MessageMediaType } from "@repo/shared";

export interface UploadResult {
  url: string;
  fileId: string;
  mediaType: MessageMediaType;
}

export const mediaService = {
  async upload(file: File, token: string): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${apiUrl("/media/upload")}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || "Upload failed");
    }

    const json = await res.json();
    return json.data as UploadResult;
  },
};
