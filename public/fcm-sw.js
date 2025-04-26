// public/fcm-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyB3bkym_bjtQNx-ehY97XCaqKpTKMZYya0",
    authDomain: "rsud-tengku-rafi-an-fc8f1.firebaseapp.com",
    projectId: "rsud-tengku-rafi-an-fc8f1",
    storageBucket: "rsud-tengku-rafi-an-fc8f1.firebasestorage.app",
    messagingSenderId: "96564787793",
    appId: "1:96564787793:web:167c33de18b9f0d9f4d670"
});

const messaging = firebase.messaging();

// Opsional: Tambahkan handler untuk background message
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
    // Anda bisa menampilkan notifikasi custom di sini jika diinginkan
});
