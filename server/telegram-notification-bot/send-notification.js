// send-notification.js (letakkan di folder telegram-notification-bot atau root proyek)
const axios = require('axios');
require('dotenv').config();  // Jika token tersimpan di .env

// Pastikan TELEGRAM_TOKEN sudah di‐set di .env atau ganti langsung di sini:
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '7500737693:AAGd7iEjGcP3lF4t7CPi9YspRB7h1s8PH6Q';

// Fungsi sederhana untuk mengirim pesan
async function kirimNotifikasi(chatId, pesan) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    const res = await axios.post(url, {
      chat_id: chatId,
      text: pesan,
      parse_mode: 'HTML' // bisa 'Markdown' atau dihapus kalau tidak perlu
    });
    console.log('✅ Pesan terkirim:', res.data);
  } catch (err) {
    console.error('❌ Gagal mengirim notifikasi:', err.response?.data || err.message);
  }
}

// Contoh pemanggilan
// Ganti dengan chat_id yang valid (misal: 987654321) dan isi pesan yang diinginkan
const chatIdToTest = '7931027586';
const pesanTest = '🔔 Ini adalah notifikasi uji coba dari sistem.';
kirimNotifikasi(chatIdToTest, pesanTest);
