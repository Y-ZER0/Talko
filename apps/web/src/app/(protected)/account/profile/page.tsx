"use client";

import { UserProfile } from "@clerk/nextjs";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { ProfileHeader } from "@/features/settings/ui/ProfileHeader";

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile();

  const clerkUsername = clerkUser?.username;
  const profileUsername = profile?.username;
  const username = clerkUsername || profileUsername || "";
  const displayName = clerkUsername || profile?.username || clerkUser?.fullName || "User";
  const avatarUrl = profile?.avatarUrl || clerkUser?.imageUrl || null;
  const userId = profile?.id || clerkUser?.id || "";

  if (!clerkLoaded || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-[3px] border-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeader
        displayName={displayName}
        username={username}
        userId={userId}
        avatarUrl={avatarUrl}
        isOnline={true}
      />

      <div className="bg-surface rounded-2xl overflow-hidden">
        <UserProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-none bg-surface",
              navbar: "hidden",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              profileSection__password: { display: "none" },
            },
          }}
        />
      </div>
    </div>
  );
}