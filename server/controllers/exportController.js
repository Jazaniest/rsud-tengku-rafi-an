const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const Logbook = require('../models/logbookModel');
const pool = require('../config/db');

exports.exportLogbook = async (req, res) => {
  try {
    const userId = req.user.id;

    // ambil template
    const templatePath = path.join(__dirname, '../templates/logbook.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // cari sheet logbook
    let worksheet = workbook.getWorksheet('logbook');
    if (!worksheet) {
      worksheet = workbook.worksheets[0];
      console.warn("Sheet 'logbook' not found. Using first worksheet instead.");
    }

    // Fetch logbook data for the user
    const records = await Logbook.getAllByUser(userId);

    // Group records by kegiatan
    const grouped = records.reduce((acc, rec) => {
      const key = rec.kegiatan;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rec);
      return acc;
    }, {});

    const uniqueKegiatan = Object.keys(grouped);
    const totalGroups = uniqueKegiatan.length;
    const templateRowCount = 2;

    // Duplikat row jika lebih dari 2
    if (totalGroups > templateRowCount) {
      const extraRows = totalGroups - templateRowCount;
      worksheet.duplicateRow(14, extraRows, true);
    }

    uniqueKegiatan.forEach((kegiatan, idx) => {
      const rowIndex = 13 + idx;
      const row = worksheet.getRow(rowIndex);

      row.getCell(1).value = idx + 1;

      row.getCell(2).value = kegiatan;

      grouped[kegiatan].forEach(rec => {
        const colIdx = 2 + (parseInt(rec.kolom_kegiatan, 10) || 1);
        const cell = row.getCell(colIdx);
        const existing = cell.value;
        const valueToAdd = Array.isArray(rec.isi_data)
          ? rec.isi_data.join(', ')
          : rec.isi_data;
        cell.value = existing ? `${existing}, ${valueToAdd}` : valueToAdd;
      });

      row.commit();
    });

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const hasilExport = `logbook_${userId}_${formattedDate}.xlsx`;

    const outputPath = path.join(__dirname, '../exports', hasilExport);

    // Tulis ke file di disk
    await workbook.xlsx.writeFile(outputPath);

    // Simpan path ke database
    await pool.query('INSERT INTO logbook_files (user_id, path) value (?, ?)', [userId, hasilExport]);

    // Kirim file ke user
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${hasilExport}"`);
    res.download(outputPath, hasilExport, async (err) => {
      if (err) {
        console.error('Gagal kirim file:', err);
        return res.status(500).send('Gagal mengirim file.');
      }

      // Hapus entri logbook setelah file berhasil dikirim
      try {
        await pool.query('DELETE FROM logbook_entries WHERE user_id = ?', [userId]);
      } catch (e) {
        console.error('Gagal menghapus entri logbook:', e);
      }
    });



  } catch (error) {
    console.error('Error exporting logbook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
