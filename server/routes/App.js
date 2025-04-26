// App.js (frontend)
import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Izin notifikasi diberikan.');
          } else {
            console.log('Izin notifikasi ditolak.');
          }
        });
      }
    } else {
      console.log('Browser tidak mendukung notifikasi.');
    }
  }, []);

  return (
    <div>
      <h1>Selamat datang di Aplikasi Anda</h1>
    </div>
  );
}

export default App;
