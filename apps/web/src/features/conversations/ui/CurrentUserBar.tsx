"use client";

import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Avatar } from "@/shared/ui/components/Avatar";

export function CurrentUserBar() {
  const { data: profile } = useCurrentUserProfile();
  const { user: clerkUser } = useCurrentUser();
  const avatarUrl = profile?.avatarUrl || clerkUser?.imageUrl || null;

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-t border-border bg-surface">
      <Avatar
        name={profile?.username ?? "You"}
        userId={profile?.id ?? ""}
        imageUrl={avatarUrl}
        size="sm"
        showPresenceDot
        isOnline
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">
          {profile?.username ?? "You"}
        </p>
        <p className="text-[10px] font-mono text-text-muted tracking-label uppercase mt-0.5">
          Manage Profile
        </p>
      </div>
      <a
        href="/account/profile"
        className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-muted hover:text-text active:scale-95 transition-all duration-150"
        aria-label="Manage profile"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </a>
    </div>
  );
}