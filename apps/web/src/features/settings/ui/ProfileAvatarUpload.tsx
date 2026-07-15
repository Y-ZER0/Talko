"use client";

import { Avatar } from "@/shared/ui/components/Avatar";

interface ProfileAvatarUploadProps {
  name: string;
  userId: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  onUpload?: () => void;
}

export function ProfileAvatarUpload({
  name,
  userId,
  avatarUrl,
  isOnline = false,
  onUpload,
}: ProfileAvatarUploadProps) {
  return (
    <div className="relative w-24 h-24">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-24 h-24 rounded-full object-cover"
        />
      ) : (
        <Avatar name={name} userId={userId} size="lg" />
      )}

      <button
        onClick={onUpload}
        aria-label="Change avatar"
        className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center border-2 border-surface cursor-pointer hover:bg-black/80 transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>

      <span
        className={`absolute bottom-1 left-1 w-4 h-4 rounded-full border-2 border-surface ${
          isOnline ? "bg-online" : "bg-text-muted"
        }`}
      />
    </div>
  );
}
