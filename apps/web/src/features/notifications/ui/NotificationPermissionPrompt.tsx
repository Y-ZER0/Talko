"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "notification-permission-dismissed";

function getPermissionState(): NotificationPermission | null {
  if (typeof Notification === "undefined") return null;
  return Notification.permission;
}

interface NotificationPermissionPromptProps {
  onPermissionGranted?: () => void;
}

export function NotificationPermissionPrompt({ onPermissionGranted }: NotificationPermissionPromptProps) {
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const permission = getPermissionState();
    if (permission !== "granted" && permission !== "denied") {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setVisible(true);
      }
    }
  }, []);

  const handleAllow = useCallback(async () => {
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setVisible(false);
      localStorage.setItem(STORAGE_KEY, "1");
      if (result === "granted") {
        onPermissionGranted?.();
      }
    } finally {
      setRequesting(false);
    }
  }, [onPermissionGranted]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-border rounded-2xl p-4 shadow-lg max-w-sm w-full mx-4"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E8562E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text m-0">
            Stay in the loop
          </p>
          <p className="text-xs text-text-muted m-0 mt-1">
            Get notified about new messages even when the app is in the
            background.
          </p>
        </div>
      </div>
      <div className="flex gap-2 mt-3 ml-[52px]">
        <button
          type="button"
          onClick={handleAllow}
          disabled={requesting}
          className="bg-primary-500 text-text-inverse font-semibold text-xs px-4 py-2 rounded-full hover:bg-primary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {requesting ? "Enabling..." : "Enable notifications"}
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          disabled={requesting}
          className="bg-transparent text-text-muted font-medium text-xs px-4 py-2 rounded-full hover:bg-surface hover:text-text transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
