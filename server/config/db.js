// server/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost', // sesuaikan host
  user: 'root',
  password: 'jazani07',
  database: 'rsud_siak',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
