const { Sequelize } = require('sequelize');

// Sesuaikan konfigurasi database Anda
const sequelize = new Sequelize('rsud_siak', 'root', 'jazani07', {
  host: 'localhost',
  dialect: 'mysql', // ganti sesuai dengan database yang Anda gunakan (misalnya: mysql, postgres, sqlite, mssql)
  logging: false,   // nonaktifkan logging jika tidak diperlukan
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import model User (sesuaikan dengan struktur model Anda)
// Misalnya, jika file User.js mengekspor fungsi model, panggil fungsi tersebut:
db.User = require('./User');

module.exports = db;
