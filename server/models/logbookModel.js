const db = require('../config/db');

module.exports = {
  getAllByUser: async (userId) => {
    const [rows] = await db.execute(
      `SELECT * 
        FROM logbook_entries 
        WHERE user_id = ? 
    ORDER BY kolom_kegiatan ASC, id ASC`,
    [userId]
    );

    return rows;
  },
  
  getAll: async () => {
    const [rows] = await db.execute('SELECT * FROM logbook');
    return rows;
  }
};
