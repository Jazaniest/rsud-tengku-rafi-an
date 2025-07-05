const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../models/sequelize');
const { auth } = require('firebase-admin');

// Konfigurasi storage untuk Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

router.get('/staff', async (req, res) => {
  try {
      const staffUsers = await sequelize.query(
        "SELECT nama_lengkap FROM users WHERE LOWER(role) = 'staff'",
        { type: QueryTypes.SELECT }
      );
      res.json(staffUsers);
  } catch (error) {
      console.error('Error fetching staff users:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data staff' });
  }
});

router.get('/karu', async (req, res) => {
  try {
      const staffUsers = await sequelize.query(
        "SELECT nama_lengkap FROM users WHERE LOWER(role) = 'kepala ruangan'",
        { type: QueryTypes.SELECT }
      );
      res.json(staffUsers);
  } catch (error) {
      console.error('Error fetching staff users:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data staff' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const allUsers = await sequelize.query(
      "SELECT nama_lengkap FROM users",
      { type: QueryTypes.SELECT }
    );
    res.json(allUsers);
  } catch (error) {
    console.error
  }
})

// Gunakan middleware upload.single('fotoProfile') di route editProfile
router.put('/editProfile', authMiddleware, upload.single('fotoProfile'), authController.editProfile);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/token', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/reset-pass-user', authMiddleware, authController.resetPass);
router.post('/reset-pass-admin', authMiddleware, authController.resetForce);

module.exports = router;
