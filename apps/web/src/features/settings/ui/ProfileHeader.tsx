"use client";

import { ProfileCoverBanner } from "./ProfileCoverBanner";
import { ProfileAvatarUpload } from "./ProfileAvatarUpload";
import { ProfileIdentityBlock } from "./ProfileIdentityBlock";
import { ProfileStatusField } from "./ProfileStatusField";

interface ProfileHeaderProps {
  displayName: string;
  username: string;
  userId: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  isOnline?: boolean;
  onAvatarUpload?: () => void;
  onCoverUpload?: () => void;
}

export function ProfileHeader({
  displayName,
  username,
  userId,
  avatarUrl,
  coverUrl,
  isOnline = false,
  onAvatarUpload,
  onCoverUpload,
}: ProfileHeaderProps) {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden">
      <ProfileCoverBanner coverUrl={coverUrl} onUpload={onCoverUpload} />

      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-12 mb-4">
          <ProfileAvatarUpload
            name={displayName}
            userId={userId}
            avatarUrl={avatarUrl}
            isOnline={isOnline}
            onUpload={onAvatarUpload}
          />

          <div className="flex-1 pb-2">
            <ProfileIdentityBlock
              displayName={displayName}
              username={username}
              isOnline={isOnline}
            />
          </div>
        </div>

        <ProfileStatusField />
      </div>
    </div>
  );
}
