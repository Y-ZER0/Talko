"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { requestFcmToken, onForegroundMessage } from "@/shared/lib/firebase";
import { deviceTokenService } from "../services/device-token.service";

const TAG = "[useFcmToken]";

export function useFcmToken(swReady: boolean) {
  const { getToken, isSignedIn } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const registeredRef = useRef(false);

  const register = useCallback(async () => {
    console.log(TAG, "register() called", { isSignedIn, swReady, alreadyRegistered: registeredRef.current });

    if (registeredRef.current) {
      console.log(TAG, "Already registered, skipping");
      return;
    }

    if (typeof Notification === "undefined") {
      console.error(TAG, "Notification API not available");
      return;
    }
    if (Notification.permission !== "granted") {
      console.warn(TAG, "Notification permission not granted, current:", Notification.permission);
      return;
    }

    setIsLoading(true);
    try {
      console.log(TAG, "Getting Clerk auth token...");
      const token = await getToken();
      if (!token) {
        console.error(TAG, "Failed to get Clerk auth token");
        return;
      }
      console.log(TAG, "Clerk token obtained:", `${token.substring(0, 20)}...`);

      console.log(TAG, "Requesting FCM token...");
      const fcm = await requestFcmToken();
      if (!fcm) {
        console.error(TAG, "Failed to get FCM token");
        return;
      }
      console.log(TAG, "FCM token obtained:", `${fcm.substring(0, 20)}...`);

      console.log(TAG, "Registering device token with backend...");
      await deviceTokenService.register(fcm, token);
      console.log(TAG, "Device token registered successfully");
      registeredRef.current = true;
      setFcmToken(fcm);
    } catch (err) {
      console.error(TAG, "register() failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    console.log(TAG, "isSignedIn effect", { isSignedIn, swReady });
    if (!isSignedIn || !swReady) {
      if (!isSignedIn) registeredRef.current = false;
      return;
    }
    register();
  }, [isSignedIn, swReady, register]);

  useEffect(() => {
    if (!fcmToken) return;

    console.log(TAG, "Setting up foreground message listener");
    const unsubscribe = onForegroundMessage((payload) => {
      console.log(TAG, "Foreground message callback:", payload);
      if (payload.title && "Notification" in window && Notification.permission === "granted") {
        console.log(TAG, "Displaying notification:", payload.title);
        new Notification(payload.title, {
          body: payload.body,
        });
      } else {
        console.warn(TAG, "Cannot display notification", {
          hasTitle: !!payload.title,
          permission: typeof Notification !== "undefined" ? Notification.permission : "N/A",
        });
      }
    });

    return unsubscribe;
  }, [fcmToken]);

  return { fcmToken, isLoading, register };
}
