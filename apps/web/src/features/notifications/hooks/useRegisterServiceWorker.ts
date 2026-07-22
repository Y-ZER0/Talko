"use client";

import { useState, useEffect } from "react";

const TAG = "[useRegisterServiceWorker]";

export function useRegisterServiceWorker() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      console.warn(TAG, "Window is undefined (SSR), skipping registration");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      console.error(TAG, "Service Workers not supported in this browser");
      return;
    }

    async function initSW() {
      // Unregister ALL old service workers first to clear stale state
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(TAG, `Found ${registrations.length} existing SW registration(s)`);
      for (const reg of registrations) {
        if (reg.scope === `${window.location.origin}/`) {
          console.log(TAG, `Unregistering old SW at scope: ${reg.scope}`);
          await reg.unregister();
        }
      }

      // Register fresh SW with cache-busting
      const swUrl = `/firebase-messaging-sw.js?v=${Date.now()}`;
      console.log(TAG, `Registering fresh SW: ${swUrl}`);
      const registration = await navigator.serviceWorker.register(swUrl, { scope: "/" });
      console.log(TAG, "Service worker registered:", registration.scope);

      if (registration.active) {
        console.log(TAG, "Service worker active, waiting 500ms for push service to be ready...");
        // Give the push service time to fully initialize after fresh SW activation
        await new Promise((resolve) => setTimeout(resolve, 500));
        setReady(true);
      } else if (registration.installing) {
        console.log(TAG, "Service worker installing, waiting for activation...");
        registration.installing.addEventListener("statechange", (e) => {
          if (e.target.state === "activated") {
            console.log(TAG, "Service worker activated, waiting 500ms...");
            setTimeout(() => setReady(true), 500);
          }
        });
      } else if (registration.waiting) {
        console.log(TAG, "Service worker waiting, skipping...");
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        setTimeout(() => setReady(true), 500);
      }
    }

    initSW().catch((err) => {
      console.error(TAG, "SW init failed:", err);
    });
  }, []);

  return ready;
}
