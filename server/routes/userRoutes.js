// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authmiddleware');

// Route untuk mendapatkan daftar semua pengguna
router.get('/', authMiddleware, userController.getAllUsers); // Menambahkan route untuk mengambil semua pengguna

// Route untuk menampilkan data user berdasarkan id
router.get('/:id', authMiddleware, userController.getUserById);

// Route untuk mengupdate data pengguna berdasarkan id
router.put('/:id', authMiddleware, userController.updateUser);

// Route untuk menghapus pengguna
router.delete('/:id', authMiddleware, userController.deleteUser);

// Endpoint untuk mengupdate FCM token
router.post('/update-fcm-token', authMiddleware, userController.updateFcmToken);

module.exports = router;
