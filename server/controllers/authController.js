const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const pool = require('../config/db')
const eventEmitter = require('../notification-handler/eventEmitter')

require('dotenv').config();
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env;

exports.register = async (req, res) => {
  try {
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

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah ada' });
    }
    
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const finalJenisKetenagaan = jenis_ketenagaan || null;

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
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, namaLengkap: user.nama_lengkap },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '10s' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    await User.saveRefreshToken(user.id, refreshToken);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' && req.secure,
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // console.log('isi username: ', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json({ 
      username: user.username, 
      role: user.role, 
      namaLengkap: user.nama_lengkap,
      foto_profile: user.foto_profile || "" ,
      tempatTanggalLahir: user.tempat_tanggal_lahir,
      nip: user.nip,
      pangkat: user.pangkat,
      levelPk: user.level_pk,
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

exports.editProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const changesPayload = {};
    for (const [key, value] of Object.entries(req.body)) {
      changesPayload[key] = value;
    }
    if (req.file) {
      changesPayload.foto_profile = req.file.filename;
    }

    await pool.query(
      `INSERT INTO workflow_instances
         (workflow_id, initiated_by, current_step_order, payload, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        10,
        userId,
        1,
        JSON.stringify(changesPayload),
        'in-progress'
      ]
    );

    const notificationData = {
      verificatorRole: 'super admin'
    };
    eventEmitter.emit('startVerif', {...notificationData});
    return res.json({
      message: 'Perubahan profil dikirim untuk verifikasi admin.'
    });
  } catch (error) {
    console.error('Edit profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(401);

    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);

    const user = await User.findByRefreshToken(token);
    if (!user || user.id !== payload.id) {
      return res.sendStatus(403);
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role, namaLengkap: user.nama_lengkap },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '10s' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.sendStatus(403);
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    await User.removeRefreshToken(token);
  }
  res.clearCookie('refreshToken').sendStatus(204);
};

exports.resetPass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'Password baru tidak boleh sama dengan password lama' });
    }
    else if (!isMatch) {
      return res.status(400).json({ message: 'Password lama tidak cocok' });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, userId]);

    return res.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.resetForce = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, user.id])

    return res.json({ message: 'Password berhasil direset secara paksa' });
  } catch (error) {
    console.error('Reset force error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.karuDatauser = async (req, res) => {
  try {
    const [karuUsers] = await pool.query(
      "SELECT nama_lengkap FROM users WHERE LOWER(role) = 'kepala ruangan'"
    );
    res.json(karuUsers);
  } catch (error) {
    console.error('Error fetching karu users:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data karu' });
  }
}

exports.staffDatauser = async (req, res) => {
  try {
    const [staffUsers] = await pool.query(
      "SELECT nama_lengkap FROM users WHERE LOWER(role) = 'staff'"
    );
    res.json(staffUsers);
  } catch (error) {
    console.error('Error fetching staff users:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data staff' });
  }
}

exports.allDatauser = async (req, res) => {
  try {
    const [allUsers] = await pool.query("SELECT nama_lengkap FROM users");
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data semua pengguna' });
  }
}


