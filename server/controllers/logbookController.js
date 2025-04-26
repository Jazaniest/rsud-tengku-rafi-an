const pool = require('../config/db');

exports.getLogbookEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const log_date = req.query.log_date || new Date().toISOString().split('T')[0];
    // Ambil entri terurut berdasarkan row_number
    const [rows] = await pool.query(
      `SELECT kegiatan, row_number, isi_data, kolom_kegiatan
       FROM logbook_entries
       WHERE user_id = ? AND log_date = ?
       ORDER BY row_number`,
      [userId, log_date]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching logbook entries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.saveLogbookEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { log_date, entries } = req.body;
    if (!log_date || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    // Looping setiap entry untuk INSERT atau UPDATE
    for (let entry of entries) {
      const { kegiatan, kolom_kegiatan, isi_data, row_number } = entry;
      if (!kegiatan || !kolom_kegiatan) continue; // wajib ada kegiatan dan kolom

      const rowNum = parseInt(row_number, 10);
      if (isNaN(rowNum) || rowNum < 1) continue;

      const dataValue = String(isi_data || '').trim();

      // Masukkan atau update data. Gunakan kolom row_number sebagai acuan unik
      await pool.query(
        `INSERT INTO logbook_entries
         (user_id, log_date, kegiatan, row_number, isi_data, kolom_kegiatan)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           isi_data = CASE
             WHEN isi_data IS NULL OR isi_data = '' THEN VALUES(isi_data)
             ELSE CONCAT(isi_data, ', ', VALUES(isi_data))
           END`,
        [userId, log_date, kegiatan, rowNum, dataValue, kolom_kegiatan]
      );
    }

    res.json({ message: 'Logbook entries saved successfully' });
  } catch (error) {
    console.error('Error saving logbook entries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
