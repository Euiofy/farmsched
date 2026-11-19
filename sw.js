// Teyvat Companion | service worker
// Only used to display reminder notifications. Mobile browsers (Android Chrome in particular)
// do not allow `new Notification()` from a page; they require a service worker to show it.
'use strict';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
        for (const client of list)
            if ('focus' in client)
                return client.focus();
        return self.clients.openWindow('./');
    }));
});
