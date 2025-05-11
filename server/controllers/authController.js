// server/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const pool = require('../config/db')

const secret = 'mysecretkey'; // Pastikan untuk menggunakan environment variable untuk produksi

exports.register = async (req, res) => {
  try {
    // Ekstraksi data dari req.body termasuk field jenis_ketenagaan
    const {
      username,
      password,
      namaLengkap,
      role,
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
      nama_lengkap: namaLengkap,
      role, 
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
      foto_profile: user.foto_profile || "" ,
      tempatTanggalLahir: user.tempat_tanggal_lahir,
      alamat: user.alamat,
      nik: user.nik,
      ruang: user.ruang,
      pendidikan: user.pendidikan,
      noStr: user.no_str,
      expiredStr: user.akhir_str,
      fileStr: user.file_str,
      noSipp: user.no_sipp,
      expiredSipp: user.akhir_sipp,
      fileSipp: user.file_sipp,
      jenisKetenagaan: user.jenis_ketenagaan
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// server/controllers/authController.js
exports.editProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Ambil semua field form sebagai object
    const changesPayload = {};
    for (const [key, value] of Object.entries(req.body)) {
      changesPayload[key] = value;
    }
    if (req.file) {
      changesPayload.foto_profile = req.file.filename;
    }

    // 2. Insert ke workflow_instances
    await pool.query(
      `INSERT INTO workflow_instances
         (workflow_id, initiated_by, current_step_order, payload, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        10,                    // VERIFY_PROFILE
        userId,                // user yang submit
        1,                     // step pertama
        JSON.stringify(changesPayload),
        'in-progress'          // default
      ]
    );

    // 3. (Opsional) Kirim notifikasi via FCM ke admin
    // await sendFcmToRole('super admin', 'Ada permintaan verifikasi profil baru.');

    return res.json({
      message: 'Perubahan profil dikirim untuk verifikasi admin.'
    });
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

