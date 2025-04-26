if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/public/fcm-sw.js')
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

      // Panggil fungsi updateToken saat inisialisasi
      (updateToken, 1000);

      // Anda bisa memanggil updateToken secara periodik atau ketika user melakukan aksi tertentu
      // Contoh: setInterval(updateToken, 1000 * 60 * 60); // setiap 1 jam
    })
    .catch((err) => {
      console.error('Registrasi Service Worker gagal:', err);
    });
}

const token = localStorage.getItem('token');

// Fungsi untuk mengirim token ke server
function updateTokenOnServer(fcmToken) {
  fetch('http://localhost:3000/api/users/update-fcm-token', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
      // Sertakan header Authorization jika endpoint Anda memerlukannya, misalnya:
    },
    body: JSON.stringify({ fcmToken })
  })
  .then(response => response.json())
  .then(data => console.log('Token update response:', data))
  .catch(error => console.error('Error updating token:', error));
}
