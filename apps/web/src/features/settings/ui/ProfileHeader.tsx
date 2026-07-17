"use client";

import { ProfileCoverBanner } from "./ProfileCoverBanner";
import { ProfileIdentityBlock } from "./ProfileIdentityBlock";

interface ProfileHeaderProps {
  displayName: string;
  username: string;
  userId: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  isOnline?: boolean;
}

export function ProfileHeader({
  displayName,
  username,
  userId,
  avatarUrl,
  coverUrl,
  isOnline = false,
}: ProfileHeaderProps) {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden">
      <ProfileCoverBanner coverUrl={coverUrl} />

      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-6 mb-4">
          <div className="relative w-24 h-24">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute bottom-1 left-1 w-4 h-4 rounded-full border-2 border-surface ${
                isOnline ? "bg-online" : "bg-text-muted"
              }`}
            />
          </div>

          <div className="flex-1 pb-2">
            <ProfileIdentityBlock
              displayName={displayName}
              username={username}
              isOnline={isOnline}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
