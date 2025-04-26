// server/models/logbook.js
const db = require('../config/db'); // Pastikan Anda memiliki file konfigurasi database

module.exports = {
  // Fungsi untuk mengambil logbook berdasarkan user id
  // Pastikan tabel logbook Anda memiliki kolom misalnya: id, user_id, activity, date, status, dll.
  getAllByUser: async (userId) => {
    const [rows] = await db.execute('SELECT * FROM logbook_entries WHERE user_id = ?', [userId]);
    return rows;
  },
  
  // Fungsi untuk mengambil semua data logbook (hanya jika diperlukan, tapi untuk keamanan sebaiknya filter berdasarkan user)
  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM logbook');
    return rows;
  }
};
