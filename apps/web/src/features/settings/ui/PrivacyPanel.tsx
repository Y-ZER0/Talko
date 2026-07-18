"use client";

import { useState, useEffect } from "react";
import { ToggleSwitch } from "@/shared/ui/components/ToggleSwitch";
import { useCurrentUserProfile } from "@/features/auth/hooks/useCurrentUserProfile";
import { useUpdateProfile } from "@/features/auth/hooks/useUpdateProfile";

export function PrivacyPanel() {
  const { data: profile, isLoading } = useCurrentUserProfile();
  const updateProfile = useUpdateProfile();

  const [readReceipts, setReadReceipts] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setReadReceipts(profile.readReceiptsEnabled);
    }
  }, [profile]);

  const handleChange = (value: boolean) => {
    setReadReceipts(value);
    setIsDirty(value !== profile?.readReceiptsEnabled);
  };

  const handleSave = () => {
    updateProfile.mutate(
      { readReceiptsEnabled: readReceipts },
      { onSuccess: () => setIsDirty(false) },
    );
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-2xl p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 border-[3px] border-border border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-text m-0 mb-1">Privacy</h2>
      <p className="text-xs text-text-muted m-0 mb-6">
        Manage your privacy settings.
      </p>

      <div className="flex flex-col">
        <div className="flex items-center justify-between py-4 border-b border-border">
          <div className="flex-1 mr-4">
            <p className="text-sm font-medium text-text m-0">Read receipts</p>
            <p className="text-xs text-text-muted m-0 mt-0.5">
              Let others know when you have read their messages.
            </p>
          </div>
          <ToggleSwitch
            checked={readReceipts}
            onChange={handleChange}
            aria-label="Toggle read receipts"
          />
        </div>
      </div>

      {isDirty && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="bg-primary-500 text-text-inverse font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-primary-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
          >
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}

      {updateProfile.isError && (
        <p className="text-xs text-danger mt-2 text-right">
          Failed to update settings. Please try again.
        </p>
      )}
    </div>
  );
}
