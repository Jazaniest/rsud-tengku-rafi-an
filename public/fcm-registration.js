(async function() {
  // Cek dukungan Service Worker dan Notifikasi
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.warn('Browser tidak mendukung Service Worker atau Notification API.');
    return;
  }

  // penampil token di ui
  let tokenContainer = document.getElementById('fcm-token-display');
  if (!tokenContainer) {
    tokenContainer = document.createElement('textarea');
    tokenContainer.id = 'fcm-token-display';
    tokenContainer.readOnly = true;
    tokenContainer.style = 'position:fixed; bottom:10px; right:10px; width:300px; height:100px; z-index:9999; font-size:12px; padding:8px;';
    tokenContainer.placeholder = 'FCM token akan muncul di sini...';
    document.body.appendChild(tokenContainer);
  }

  // Deteksi iOS Safari (hanya mendukung Push di PWA)
  const isIOS = /iP(hone|od|ad)/.test(navigator.platform);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  if (isIOS && isSafari && !isPWA) {
    console.warn('Push notifications hanya didukung di Safari PWA pada iOS 16.4+. Silakan install web app ke Home Screen.');
    return;
  }

  try {
    // Daftarkan Service Worker
    const registration = await navigator.serviceWorker.register('../fcm-sw.js');
    console.log('Service Worker terdaftar:', registration);

    // Inisialisasi Firebase
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Meminta izin notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Izin notifikasi tidak diberikan:', permission);
      return;
    }

    // Ambil dan kirim token FCM setiap 1 detik
    async function fetchAndSendToken() {
      try {
        const fcmToken = await messaging.getToken({ serviceWorkerRegistration: registration });
        if (!fcmToken) {
          console.warn('Token FCM tidak tersedia. Pastikan notifikasi diizinkan.');
          return;
        }
        // Tampilkan token di textarea
        tokenContainer.value = fcmToken;
        // Kirim token ke server
        updateTokenOnServer(fcmToken);
        // console.log('FCM Token refreshed and sent:', fcmToken);
      } catch (err) {
        console.error('Error mendapatkan token FCM:', err);
      }
    }

    // Jalankan sekali, kemudian terus tiap detik
    await fetchAndSendToken();
    setInterval(fetchAndSendToken, 600000);

    // Listener untuk pesan masuk saat web aktif
    messaging.onMessage(payload => {
      console.log('Pesan FCM diterima saat foreground:', payload);
      registration.showNotification(payload.notification.title, payload.notification);
    });

  } catch (err) {
    console.error('Gagal inisialisasi Firebase Messaging atau registrasi SW:', err);
  }

  // Fungsi kirim token ke server
  const apiToken = localStorage.getItem('token');
  function updateTokenOnServer(fcmToken) {
    fetch('/api/users/update-fcm-token', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fcmToken })
    })
    .then(res => res.json())
    .then(data => console.log('Token update response:', data))
    .catch(err => console.error('Error updating token:', err));
  }
})();
