"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { requestFcmToken, onForegroundMessage } from "@/shared/lib/firebase";
import { deviceTokenService } from "../services/device-token.service";

export function useFcmToken() {
  const { getToken, isSignedIn } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const register = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const fcm = await requestFcmToken();
      if (!fcm) return;

      await deviceTokenService.register(fcm, token);
      setFcmToken(fcm);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn) return;
    register();
  }, [isSignedIn, register]);

  useEffect(() => {
    if (!fcmToken) return;

    const unsubscribe = onForegroundMessage((payload) => {
      if (payload.title && "Notification" in window && Notification.permission === "granted") {
        new Notification(payload.title, {
          body: payload.body,
        });
      }
    });

    return unsubscribe;
  }, [fcmToken]);

  return { fcmToken, isLoading, register };
}
