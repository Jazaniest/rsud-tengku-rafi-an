// server/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const secret = 'mysecretkey'; // Pastikan untuk menggunakan environment variable untuk produksi

exports.register = async (req, res) => {
  try {
    // Ekstraksi data dari req.body termasuk field jenis_ketenagaan
    const {
      username,
      password,
      role,
      namaLengkap,
      tempat_tanggal_lahir,
      alamat,
      nik,
      nip,
      pangkat,
      ruang,
      level_pk,
      unit_kerja,
      pendidikan,
      no_str,
      no_sipp,
      kredensial,
      jenis_ketenagaan
    } = req.body;

    // Cek apakah username sudah ada
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah ada' });
    }
    
    // Hash password sebelum disimpan
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Jika jenis_ketenagaan tidak diberikan, tetapkan default null
    const finalJenisKetenagaan = jenis_ketenagaan || null;

    // Simpan user baru ke database, perhatikan mapping namaLengkap ke nama_lengkap
    const newUser = await User.create({ 
      username, 
      password_hash, 
      role, 
      nama_lengkap: namaLengkap,
      tempat_tanggal_lahir,
      alamat,
      nik,
      nip,
      pangkat,
      ruang,
      level_pk,
      unit_kerja,
      pendidikan,
      no_str,
      no_sipp,
      kredensial,
      jenis_ketenagaan: finalJenisKetenagaan
    });

    res.status(201).json({ message: 'Registrasi berhasil', user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);
    const user = await User.findByUsername(username);
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // Bandingkan password dengan hash yang tersimpan
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, namaLengkap: user.nama_lengkap }, secret, { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json({ 
      username: user.username, 
      role: user.role, 
      nip: user.nip,
      namaLengkap: user.nama_lengkap,
      pangkat: user.pangkat,
      levelPk: user.level_pk,
      unitKerja: user.unit_kerja,
      foto_profile: user.foto_profile || "" 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// server/controllers/authController.js
exports.editProfile = async (req, res) => {
  try {
    const { username, namaLengkap, password } = req.body;
    const userId = req.user.id;

    // Cek apakah username baru sudah ada
    const existingUser = await User.findByUsername(username);
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: 'Username sudah digunakan oleh pengguna lain' });
    }

    // Jika password baru ada, hash password tersebut
    let password_hash = null;
    if (password) {
      const saltRounds = 10;
      password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Jika ada file upload, ambil nama file nya
    let foto_profile = null;
    if (req.file) {
      foto_profile = req.file.filename;
    }

    // Gabungkan data pembaruan
    const updateData = { username, namaLengkap, password_hash };
    if (foto_profile) {
      updateData.foto_profile = foto_profile;
    }

    // Update data user
    const updatedUser = await User.updateProfile(userId, updateData);

    res.json({ message: 'Profil berhasil diperbarui', user: updatedUser });
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

