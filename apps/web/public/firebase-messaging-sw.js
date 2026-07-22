importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyApfR4ZvwMvx3Qg4DM2D4YMiuG_5eVRnOo",
  projectId: "talko-7b25a",
  messagingSenderId: "1011841946484",
  appId: "1:1011841946484:web:5fc84b2a172b82ec385221",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title;
  const body = payload.notification?.body;
  const { conversationId, ...rest } = payload.data || {};
  if (!title) return;

  self.registration.showNotification(title, {
    body: body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { conversationId, ...rest },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const conversationId = event.notification.data?.conversationId;
  const url = new URL(self.location.origin);
  if (conversationId) {
    url.pathname = `/conversations/${conversationId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          client.focus();
          if (conversationId) {
            client.navigate(url.toString());
          }
          return;
        }
        return clients.openWindow(url.toString());
      }
    }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
