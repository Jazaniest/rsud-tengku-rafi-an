const pool = require('../config/db');

exports.notification = async (req, res) => {
  try {
    const { username } = req.body;

    // // Cari user berdasarkan username
    // const [userRows] = await pool.query(
    //   'SELECT id FROM users WHERE username = ? LIMIT 1',
    //   [username]
    // );

    // if (userRows.length === 0) {
    //   return res.status(404).json({ success: false, linked: false, message: 'User tidak ditemukan' });
    // }

    // const userId = userRows[0].id;

    // Cek apakah user_id ada di tabel user_telegram
    const [linkRows] = await pool.query(
      'SELECT 1 FROM user_telegram WHERE user_id = ? LIMIT 1',
      [username]
    );

    const isLinked = linkRows.length > 0;

    res.status(200).json({ success: true, linked: isLinked });
  } catch (error) {
    console.error('Error in /api/notification/data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


