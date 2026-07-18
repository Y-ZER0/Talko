import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import type { Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

let messagingInstance: Messaging | null = null;

export function initFirebase() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;

  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging();
    } catch {
      return null;
    }
  }

  return messagingInstance;
}

export function getMessagingInstance(): Messaging | null {
  return messagingInstance;
}

export async function requestFcmToken(): Promise<string | null> {
  const messaging = initFirebase();
  if (!messaging) return null;

  try {
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";
    const currentToken = await getToken(messaging, { vapidKey });
    return currentToken;
  } catch {
    return null;
  }
}

export function onForegroundMessage(callback: (payload: { title?: string; body?: string; conversationId?: string }) => void) {
  const messaging = initFirebase();
  if (!messaging) return () => {};

  const unsubscribe = onMessage(messaging, (payload) => {
    const { title, body, conversationId } = payload.data || {};
    callback({ title, body, conversationId });
  });

  return unsubscribe;
}
