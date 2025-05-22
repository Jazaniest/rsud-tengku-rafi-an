if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../fcm-sw.js')
    .then((registration) => {
      console.log('Service Worker terdaftar:', registration);
      firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();

      // Meminta izin notifikasi
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // Mendapatkan token FCM untuk pertama kali
          messaging.getToken({ serviceWorkerRegistration: registration })
            .then((fcmToken) => {
              console.log('FCM Token:', fcmToken);
              localStorage.setItem('fcmToken', fcmToken);
              // Kirim token ke server untuk disimpan
              updateTokenOnServer(fcmToken);
            })
            .catch((err) => {
              console.error('Error mendapatkan token FCM:', err);
            });
        } else {
          console.error('Izin notifikasi tidak diberikan:', permission);
        }
      });

      // Fungsi untuk mendapatkan dan memperbarui token
      const updateToken = () => {
        messaging.getToken({ serviceWorkerRegistration: registration })
          .then((fcmToken) => {
            if (fcmToken) {
              console.log('FCM Token:', fcmToken);
              const storedToken = localStorage.getItem('fcmToken');
              // Jika token baru berbeda dengan token yang tersimpan, perbarui
              if (storedToken !== fcmToken) {
                localStorage.setItem('fcmToken', fcmToken);
                updateTokenOnServer(fcmToken);
              }
            } else {
              console.warn('Token FCM tidak tersedia, pastikan notifikasi diizinkan.');
            }
          })
          .catch((err) => {
            console.error('Error mendapatkan token FCM:', err);
          });
      };

      (updateToken, 10000);

    })
    .catch((err) => {
      console.error('Registrasi Service Worker gagal:', err);
    });
}

const token = localStorage.getItem('token');

// Fungsi untuk mengirim token ke server
function updateTokenOnServer(fcmToken) {
  fetch('/api/users/update-fcm-token', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fcmToken })
  })
  .then(response => response.json())
  .then(data => console.log('Token update response:', data))
  .catch(error => console.error('Error updating token:', error));
}
