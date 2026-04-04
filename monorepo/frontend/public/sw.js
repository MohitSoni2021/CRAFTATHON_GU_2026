// MedTrack Service Worker — Handles push events and notification clicks

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
  }

  const title   = data.title || '💊 MedTrack Reminder';
  const options = {
    body:    data.body  || 'Time to take your medication!',
    icon:    data.icon  || '/icons/medtrack-icon.png',
    badge:   '/icons/medtrack-badge.png',
    tag:     data.tag   || 'medtrack-reminder',
    data:    { url: data.url || '/today' },
    requireInteraction: true,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open',   title: '✅ Mark Taken' },
      { action: 'snooze', title: '⏰ Snooze 10 min' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/today';

  if (event.action === 'snooze') {
    // Snooze: re-show after 10 minutes
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(async () => {
          await self.registration.showNotification(event.notification.title, {
            body:    event.notification.body,
            icon:    event.notification.icon,
            tag:     'medtrack-snoozed',
            data:    event.notification.data,
            requireInteraction: true,
          });
          resolve();
        }, 10 * 60 * 1000);
      })
    );
    return;
  }

  // Default or 'open' action — focus or open MedTrack
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Basic install/activate lifecycle
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
