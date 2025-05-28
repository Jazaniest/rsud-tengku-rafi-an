// fcm-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Inisialisasi Firebase
firebase.initializeApp({
  apiKey: "AIzaSyB3bkym_bjtQNx-ehY97XCaqKpTKMZYya0",
  authDomain: "rsud-tengku-rafi-an-fc8f1.firebaseapp.com",
  projectId: "rsud-tengku-rafi-an-fc8f1",
  storageBucket: "rsud-tengku-rafi-an-fc8f1.firebasestorage.app",
  messagingSenderId: "96564787793",
  appId: "1:96564787793:web:167c33de18b9f0d9f4d670"
});

const messaging = firebase.messaging();

// Tangani background message dan langsung tampilkan notifikasi
messaging.onBackgroundMessage(payload => {
//   console.log('[fcm-sw.js] Received background message', payload);
  
  // Ambil data title/body/icon
  const title = payload.notification?.title || 'Notifikasi Baru';
  const options = {
    body:  payload.notification?.body  || '',
    icon:  payload.notification?.icon  || '/default-icon.png',
    data:  payload.data               || {}
  };
  
  // Ini wajib untuk memunculkan notif background
  self.registration.showNotification(title, options);
});

// (Opsional) Tangani klik pada notifikasi
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Fokus tab yang sudah terbuka, atau buka baru
      for (const client of list) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});
