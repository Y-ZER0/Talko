importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "___FIREBASE_API_KEY___",
  projectId: "___FIREBASE_PROJECT_ID___",
  messagingSenderId: "___FIREBASE_MESSAGING_SENDER_ID___",
  appId: "___FIREBASE_APP_ID___",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, ...data } = payload.data || {};
  if (!title) return;

  self.registration.showNotification(title, {
    body: body || "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data,
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
