// CropYield AI — Service Worker for Push Notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: "CropYield Alert", body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || "CropYield AI", {
      body:    data.body || "",
      icon:    "/favicon.svg",
      badge:   "/favicon.svg",
      data:    { url: data.url || "/" },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
