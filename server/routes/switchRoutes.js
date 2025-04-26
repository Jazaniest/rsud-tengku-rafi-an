const express = require('express');
const router = express.Router();

// Import database connection
const db = require('../config/db'); // contoh, sesuaikan dengan project kamu

// GET status switch
router.get('/status', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT status FROM switches WHERE id = 1');
    if (rows.length > 0) {
      res.json({ status: rows[0].status === 1 });
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.error('Error fetching switch status:', error);
    res.status(500).json({ message: 'Gagal mengambil status' });
  }
});

// POST update status switch
router.post('/status', async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE switches SET status = ? WHERE id = 1', [status ? 1 : 0]);
    res.json({ message: 'Status switch diperbarui' });
  } catch (error) {
    console.error('Error updating switch status:', error);
    res.status(500).json({ message: 'Gagal memperbarui status' });
  }
});

module.exports = router;
