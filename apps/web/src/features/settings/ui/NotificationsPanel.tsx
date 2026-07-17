"use client";

import { useState, useEffect } from "react";
import { ToggleSwitch } from "@/shared/ui/components/ToggleSwitch";
import { useNotificationPreferences } from "@/features/notifications/hooks/useNotificationPreferences";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-text m-0">{label}</p>
        <p className="text-xs text-text-muted m-0 mt-0.5">{description}</p>
      </div>
      <ToggleSwitch
        checked={checked}
        onChange={onChange}
        aria-label={`Toggle ${label}`}
      />
    </div>
  );
}

export function NotificationsPanel() {
  const { data: preferences, isLoading } = useNotificationPreferences();

  const [localPrefs, setLocalPrefs] = useState({
    directMessages: true,
    sound: true,
    mentionsOnly: false,
    doNotDisturb: false,
  });

  useEffect(() => {
    if (preferences) {
      setLocalPrefs({
        directMessages: preferences.directMessages,
        sound: preferences.sound,
        mentionsOnly: preferences.mentionsOnly,
        doNotDisturb: preferences.doNotDisturb,
      });
    }
  }, [preferences]);

  const handleChange = (
    key: keyof typeof localPrefs,
    value: boolean,
  ) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: value }));
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
      <h2 className="text-lg font-semibold text-text m-0 mb-1">
        Notifications
      </h2>
      <p className="text-xs text-text-muted m-0 mb-6">
        Configure how you receive notifications.
      </p>

      <div className="flex flex-col">
        <ToggleRow
          label="Direct messages"
          description="Receive push notifications for new direct messages."
          checked={localPrefs.directMessages}
          onChange={(v) => handleChange("directMessages", v)}
        />

        <ToggleRow
          label="Sound"
          description="Play a sound when a new notification arrives."
          checked={localPrefs.sound}
          onChange={(v) => handleChange("sound", v)}
        />

        <ToggleRow
          label="Mentions only"
          description="Only receive notifications when you are mentioned."
          checked={localPrefs.mentionsOnly}
          onChange={(v) => handleChange("mentionsOnly", v)}
        />

        <ToggleRow
          label="Do not disturb"
          description="Pause all notifications until turned off."
          checked={localPrefs.doNotDisturb}
          onChange={(v) => handleChange("doNotDisturb", v)}
        />
      </div>
    </div>
  );
}
