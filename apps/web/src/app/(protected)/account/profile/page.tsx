"use client";

import { useCallback } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";
import { PersonalDetailsForm } from "@/features/settings/ui/PersonalDetailsForm";
import type { PersonalDetailsFormData } from "@/features/settings/ui/PersonalDetailsForm";

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useCurrentUser();
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile();
  const updateProfile = useUpdateProfile();

  const displayName =
    profile?.username || clerkUser?.fullName || clerkUser?.username || "User";
  const username = profile?.username || clerkUser?.username || "";
  const email = clerkUser?.primaryEmailAddress?.emailAddress || "";
  const avatarUrl = profile?.avatarUrl || clerkUser?.imageUrl || null;
  const userId = profile?.id || clerkUser?.id || "";

  const handleSubmit = useCallback(async (data: PersonalDetailsFormData) => {
    try {
      await updateProfile.mutateAsync({
        username: data.username,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }, [updateProfile]);

  if (!clerkLoaded || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-[3px] border-border border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PersonalDetailsForm
      displayName={displayName}
      username={username}
      email={email}
      location=""
      website=""
      about=""
      avatarUrl={avatarUrl}
      userId={userId}
      isOnline={true}
      onSubmit={handleSubmit}
    />
  );
}
