// Web Push Service Worker for Campus Lost & Found

self.addEventListener('push', function (event) {
  if (!event.data) {
    console.log('Push event received with no payload data');
    return;
  }

  let data = {
    title: 'Campus Lost & Found Alert',
    body: 'A item matching your query has been posted!',
    icon: '/favicon.ico',
    url: '/',
  };

  try {
    data = event.data.json();
  } catch (err) {
    data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'View Item' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
