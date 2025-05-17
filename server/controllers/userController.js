const User = require('../models/User');
const pool = require('../config/db');

const userController = {
  // Fungsi untuk mendapatkan semua pengguna
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll(); // Mengambil semua pengguna
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Menampilkan data pengguna berdasarkan id
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Mengupdate data pengguna berdasarkan id
  updateUser: async (req, res) => {
    try {
      const updatedUser = await User.updateProfile(req.params.id, req.body);
      res.status(200).json({ message: 'Data Berhasil Diperbaharui', updatedUser });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Menghapus pengguna berdasarkan id
  deleteUser: async (req, res) => {
    try {
      const result = await User.delete(req.params.id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`User with ID ${req.params.id} deleted`);
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
      console.error('Error in delete operation:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  // Fungsi untuk mengupdate FCM Token
  updateFcmToken: async (req, res) => {
    try {
      // console.log('ini isi req.body : ', req.body);
      const userId = req.user.id; // Pastikan middleware autentikasi sudah berjalan
      const { fcmToken } = req.body;
      if (!fcmToken) {
        return res.status(400).json({ message: 'FCM Token tidak ada' });
      }
      // Update token di database menggunakan pool yang diimpor
      await pool.query("UPDATE users SET fcm_token = ? WHERE id = ?", [fcmToken, userId]);
      return res.status(200).json({ message: 'FCM Token berhasil diupdate' });
    } catch (error) {
      console.error("Error update FCM Token:", error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = userController;
