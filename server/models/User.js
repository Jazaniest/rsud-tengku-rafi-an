// server/models/User.js
const pool = require('../config/db');

class User {
  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows; // Mengembalikan semua pengguna dalam bentuk array
  }

  static async delete(id) {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result;
    } catch (err) {
        console.error('Error during delete operation:', err); // Log error SQL
        throw new Error('Database delete failed');
    }
  }

  static async saveRefreshToken(userId, token) {
    await pool.query(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [token, userId]
    );
  }

  static async findByRefreshToken(token) {
    const user = await pool.query(
      'SELECT id FROM users WHERE refresh_token = ?',
      [token]
    );
    return user[0][0];
  }

  static async removeRefreshToken(token) {
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?',
      [token]
    );
  }


  static async create(data) {
    const {
      username,
      password_hash,
      role,
      nama_lengkap,
      tempat_tanggal_lahir,
      alamat,
      nik,
      nip,
      pangkat,
      ruang,
      level_pk,
      pendidikan,
      no_str,
      no_sipp,
      jenis_ketenagaan,
      akhir_str,
      akhir_sipp,
      file_str,
      file_sipp
    } = data;
  
    // Pastikan jenis_ketenagaan tidak undefined
    const finalJenisKetenagaan = (typeof jenis_ketenagaan === 'undefined' || jenis_ketenagaan === "") ? null : jenis_ketenagaan;
  
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role, created_at, nama_lengkap, tempat_tanggal_lahir, alamat, nik, nip, pangkat, ruang, level_pk, pendidikan, no_str, no_sipp, jenis_ketenagaan, akhir_str, akhir_sipp, file_str, file_sipp) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        username,
        password_hash,
        role,
        nama_lengkap,
        tempat_tanggal_lahir,
        alamat,
        nik,
        nip,
        pangkat,
        ruang,
        level_pk,
        pendidikan,
        no_str,
        no_sipp,
        finalJenisKetenagaan, 
        akhir_str,
        akhir_sipp,
        file_str,
        file_sipp
      ]
    );
    return { id: result.insertId, username, role, nama_lengkap, tempat_tanggal_lahir, alamat, nik, nip, pangkat, ruang, level_pk, pendidikan, no_str, no_sipp, jenis_ketenagaan: finalJenisKetenagaan, akhir_str, akhir_sipp, file_str, file_sipp };
  }
  

  static async updateProfile(id, data) {
    const {
      username,
      nama_lengkap, // Sesuaikan dengan parameter yang diterima oleh model
      password_hash,
      foto_profile,
      tempat_tanggal_lahir,
      alamat,
      nik,
      nip,
      pangkat,
      ruang,
      level_pk,
      pendidikan,
      no_str,
      no_sipp,
      jenis_ketenagaan, 
      akhir_str,
      akhir_sipp,
      file_str,
      file_sipp
    } = data;
  
    let query = 'UPDATE users SET username = ?, nama_lengkap = ?';
    let params = [username, nama_lengkap];
  
    // Proses penambahan kolom lain seperti sebelumnya
    if (password_hash) {
      query += ', password_hash = ?';
      params.push(password_hash);
    }
  
    if (foto_profile) {
      query += ', foto_profile = ?';
      params.push(foto_profile);
    }
  
    if (tempat_tanggal_lahir) {
      query += ', tempat_tanggal_lahir = ?';
      params.push(tempat_tanggal_lahir);
    }
  
    if (alamat) {
      query += ', alamat = ?';
      params.push(alamat);
    }
  
    if (nik) {
      query += ', nik = ?';
      params.push(nik);
    }
  
    if (nip) {
      query += ', nip = ?';
      params.push(nip);
    }
  
    if (pangkat) {
      query += ', pangkat = ?';
      params.push(pangkat);
    }
  
    if (ruang) {
      query += ', ruang = ?';
      params.push(ruang);
    }
  
    if (level_pk) {
      query += ', level_pk = ?';
      params.push(level_pk);
    }
  
    if (pendidikan) {
      query += ', pendidikan = ?';
      params.push(pendidikan);
    }
  
    if (no_str) {
      query += ', no_str = ?';
      params.push(no_str);
    }
  
    if (no_sipp) {
      query += ', no_sipp = ?';
      params.push(no_sipp);
    }
  
    if (jenis_ketenagaan) {
      query += ', jenis_ketenagaan = ?';
      params.push(jenis_ketenagaan);
    }

    if (akhir_str) {
      query += ', akhir_str = ?';
      params.push(akhir_str);
    }

    if (akhir_sipp) {
      query += ', akhir_sipp = ?';
      params.push(akhir_sipp);
    }

    if (file_str) {
      query += ', file_str = ?';
      params.push(file_str);
    }

    if (file_sipp) {
      query += ', file_sipp = ?';
      params.push(file_sipp);
    }
  
    query += ' WHERE id = ?';
    params.push(id);
  
    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
  
    return {
      id,
      username,
      nama_lengkap, // Sesuaikan dengan nama parameter yang digunakan
      foto_profile,
      tempat_tanggal_lahir,
      alamat,
      nik,
      nip,
      pangkat,
      ruang,
      level_pk,
      pendidikan,
      no_str,
      no_sipp,
      jenis_ketenagaan,
      akhir_str,
      akhir_sipp,
      file_str,
      file_sipp
    };
  }
  
}

module.exports = User;
