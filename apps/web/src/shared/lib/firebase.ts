import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, deleteToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

const TAG = "[Firebase]";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let messagingInstance: Messaging | null = null;
let appInitialized = false;

export function isBraveBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.brave !== undefined;
}

export function initFirebase() {
  console.log(TAG, "initFirebase called");

  if (isBraveBrowser()) {
    console.warn(TAG, "Brave browser detected - FCM push notifications are not supported. Notifications will be disabled.");
    return null;
  }

  if (messagingInstance) {
    console.log(TAG, "Returning existing messaging instance");
    return messagingInstance;
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error(TAG, "Missing firebase config", {
      hasApiKey: !!firebaseConfig.apiKey,
      hasProjectId: !!firebaseConfig.projectId,
    });
    return null;
  }

  if (!appInitialized) {
    if (getApps().length === 0) {
      console.log(TAG, "No Firebase app found, initializing...");
      initializeApp(firebaseConfig);
      console.log(TAG, "Firebase app initialized");
    } else {
      console.log(TAG, "Firebase app already initialized");
    }
    appInitialized = true;
  }

  try {
    console.log(TAG, "Getting messaging instance...");
    messagingInstance = getMessaging();
    console.log(TAG, "Messaging instance obtained");
  } catch (err) {
    console.error(TAG, "Failed to get messaging instance:", err);
    return null;
  }

  return messagingInstance;
}

export function getMessagingInstance(): Messaging | null {
  return messagingInstance;
}

export async function requestFcmToken(): Promise<string | null> {
  console.log(TAG, "requestFcmToken called");
  const messaging = initFirebase();
  if (!messaging) {
    console.error(TAG, "requestFcmToken: messaging is null, aborting");
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";
  if (!vapidKey) {
    console.error(TAG, "VAPID key is missing!");
    return null;
  }

  const swRegistration = await navigator.serviceWorker.ready;
  console.log(TAG, "SW ready, scope:", swRegistration.scope);

  // Step 1: Try to delete any existing FCM token (clears Firebase internal cache)
  try {
    console.log(TAG, "Deleting any existing FCM token...");
    await deleteToken(messaging);
    console.log(TAG, "Existing FCM token deleted");
  } catch (delErr) {
    console.log(TAG, "No existing token to delete (expected on first run):", delErr);
  }

  // Step 2: Clean up any stale push subscription at browser level
  try {
    const existingSub = await swRegistration.pushManager.getSubscription();
    if (existingSub) {
      console.log(TAG, "Found stale push subscription, unsubscribing...");
      await existingSub.unsubscribe();
      console.log(TAG, "Stale subscription removed");
    } else {
      console.log(TAG, "No existing push subscription found");
    }
  } catch (subErr) {
    console.warn(TAG, "Could not check/clean existing subscription:", subErr);
  }

  // Step 3: Request fresh token — try WITHOUT explicit SW registration first
  try {
    console.log(TAG, "Requesting FCM token (without explicit SW reg)...");
    const currentToken = await getToken(messaging, { vapidKey });
    console.log(TAG, "FCM token obtained:", currentToken ? `${currentToken.substring(0, 20)}...` : "null");
    return currentToken;
  } catch (err) {
    console.warn(TAG, "First attempt failed, retrying with explicit SW reg...", err);
  }

  // Step 4: Fallback — try WITH explicit SW registration
  try {
    console.log(TAG, "Requesting FCM token (with explicit SW reg)...");
    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });
    console.log(TAG, "FCM token obtained:", currentToken ? `${currentToken.substring(0, 20)}...` : "null");
    return currentToken;
  } catch (err) {
    console.error(TAG, "All FCM token attempts failed:", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: { title?: string; body?: string; conversationId?: string }) => void) {
  console.log(TAG, "onForegroundMessage: registering listener");
  const messaging = initFirebase();
  if (!messaging) {
    console.error(TAG, "onForegroundMessage: messaging is null, cannot register");
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log(TAG, "Foreground message received:", payload);
    const title = payload.notification?.title;
    const body = payload.notification?.body;
    const conversationId = payload.data?.conversationId;
    callback({ title, body, conversationId });
  });

  return unsubscribe;
}
