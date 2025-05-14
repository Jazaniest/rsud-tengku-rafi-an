const { messaging } = require('firebase-admin');
const pool = require('../config/db');

exports.getKegiatan = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query('SELECT * FROM kegiatan_list WHERE user_id = ?', [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching kegiatan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addKegiatan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ message: 'Nama kegiatan wajib diisi' });
    const [result] = await pool.query('INSERT INTO kegiatan_list (user_id, name) VALUES (?, ?)', [userId, name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    console.error('Error adding kegiatan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteKegiatan = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM kegiatan_list WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      message: `Berhasil menghapus ${result.affectedRows} kegiatan`,
      deleted: result.affectedRows
    })
  } catch (error) {
    console.error('Error saat menghapus kegiatan: ', error);
    res.status(500).json({ message: 'Internal server error'});
  }
}
