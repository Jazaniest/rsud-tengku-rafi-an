// server/controllers/exportController.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const Logbook = require('../models/logbookModel');
const pool = require('../config/db');

exports.exportLogbook = async (req, res) => {
  try {
    const userId = req.user.id;

    // Load the Excel template
    const templatePath = path.join(__dirname, '../templates/logbook.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);

    // Get the 'logbook' sheet or fallback to first
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
    const templateRowCount = 2; // template rows at 13 & 14

    // Duplicate row templates if needed
    if (totalGroups > templateRowCount) {
      const extraRows = totalGroups - templateRowCount;
      worksheet.duplicateRow(14, extraRows, true);
    }

    // Write data for each unique kegiatan starting at row 13
    uniqueKegiatan.forEach((kegiatan, idx) => {
      const rowIndex = 13 + idx;
      const row = worksheet.getRow(rowIndex);

      // Column A: sequential numbering
      row.getCell(1).value = idx + 1; // A

      // Column B: butir kegiatan
      row.getCell(2).value = kegiatan; // B

      // For each record in this group, set the isi_data in the correct column
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

    // Write workbook to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Determine and store filename
    const hasilExport = `logbook_${userId}.xlsx`;

    await pool.query('INSERT INTO logbook_files (user_id, path) value (?, ?)', [userId, `${hasilExport}`]);

    // Send workbook as download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${hasilExport}`);
    res.send(buffer);
    await pool.query('DELETE FROM logbook_entries WHERE user_id = ?', [userId])
  } catch (error) {
    console.error('Error exporting logbook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
