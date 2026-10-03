/* =====================================================================
   sw.js
   Minimal service worker: its only job is to show a notification when
   a push message arrives, and to focus/open the app when it's tapped.
   Must be served from the same folder as index.html (the root of the
   site), over HTTPS — GitHub Pages already serves HTTPS.
   ===================================================================== */

self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (err) { /* non-JSON payload, ignore */ }

  const title = data.title || "Classe mates";
  const options = {
    body: data.body || "",
    icon: "logo.png",
    badge: "logo.png",
    data: { url: data.url || "./" }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
