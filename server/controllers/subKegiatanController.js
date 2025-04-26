const pool = require('../config/db');

exports.getSubKegiatan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kegiatan_id } = req.query; // optional filter
    let query = 'SELECT * FROM sub_kegiatan_list WHERE user_id = ?';
    let params = [userId];
    if (kegiatan_id) {
      query += ' AND kegiatan_id = ?';
      params.push(kegiatan_id);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sub kegiatan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addSubKegiatan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { kegiatan_id, name } = req.body;
    if (!kegiatan_id) return res.status(400).json({ message: 'Pilih kegiatan terlebih dahulu' });
    if (!name || name.trim() === '') return res.status(400).json({ message: 'Nama sub kegiatan wajib diisi' });
    const [result] = await pool.query('INSERT INTO sub_kegiatan_list (user_id, kegiatan_id, name) VALUES (?, ?, ?)', [userId, kegiatan_id, name]);
    res.status(201).json({ id: result.insertId, kegiatan_id, name });
  } catch (error) {
    console.error('Error adding sub kegiatan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
