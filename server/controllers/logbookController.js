const pool = require('../config/db');
const Logbook = require('../models/logbookModel');

exports.getLogbookEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = await Logbook.getAllByUser(userId);
    return res.json(entries);
  } catch (err) {
    console.error('Error fetching logbook by user:', err);
    return res.status(500).json({ message: 'Gagal mengambil data logbook' });
  }
};

exports.getUserLogbook = async (req, res) => {
  const userId = req.user.id;
  const [listLogbook] = await pool.query(
    `SELECT * FROM logbook_files WHERE user_id = ?`, [userId]
  );

  res.json(listLogbook);
}

exports.saveLogbookEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { log_date, entries } = req.body;
    if (!log_date || !Array.isArray(entries)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    for (let entry of entries) {
      const { kegiatan, kolom_kegiatan, isi_data, row_number } = entry;
      if (!kegiatan || !kolom_kegiatan) continue;

      const rowNum = parseInt(row_number, 10);
      if (isNaN(rowNum) || rowNum < 1) continue;

      const dataValue = String(isi_data || '').trim();

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


