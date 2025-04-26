// server/controllers/exportController.js
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const Logbook = require('../models/logbookModel');

exports.exportLogbook = async (req, res) => {
    try {
        // Ambil data logbook berdasarkan user
        const logbookData = await Logbook.getAllByUser(req.user.id);

        // Path template dan output file
        const templatePath = path.join(__dirname, '../templates/logbook.xlsx');
        const exportFileName = `logbook_export_${req.user.id}_${Date.now()}.xlsx`;
        const exportPath = path.join(__dirname, `../exports/${exportFileName}`);

        if (!fs.existsSync(templatePath)) {
            return res.status(500).json({ message: 'Template file not found' });
        }

        // Load workbook dari template
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(templatePath);
        console.log("Jumlah worksheet:", workbook.worksheets.length);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
            return res.status(500).json({ message: 'Worksheet tidak ditemukan dalam template' });
        }

        // Pengelompokan data
        // Struktur groupedData: key = activity (jika ada), lalu terdapat properti:
        //   - main: array record dengan sub_kegiatan kosong
        //   - subs: objek dengan key = sub_kegiatan, value = array record
        // Untuk record yang tidak memiliki activity, gunakan sub_kegiatan sebagai key dan tandai standalone
        const groupedData = {};

        logbookData.forEach(record => {
            const act = record.activity ? record.activity.trim() : "";
            const sub = record.sub_kegiatan ? record.sub_kegiatan.trim() : "";
            if (act !== "") {
                // Ada activity
                if (!groupedData[act]) {
                    groupedData[act] = { main: [], subs: {} };
                }
                if (sub === "") {
                    groupedData[act].main.push(record);
                } else {
                    if (!groupedData[act].subs[sub]) {
                        groupedData[act].subs[sub] = [];
                    }
                    groupedData[act].subs[sub].push(record);
                }
            } else {
                // Tidak ada activity, gunakan sub sebagai kunci
                if (!sub) return; // Lewati jika kedua kosong
                if (!groupedData[sub]) {
                    groupedData[sub] = { standalone: true, main: [], subs: {} };
                }
                // Kita simpan record ini dalam 'main' agar nantinya ditampilkan sebagai baris sub (tanpa nomor)
                groupedData[sub].main.push(record);
            }
        });

        // Tulis ke worksheet mulai dari baris 13 (misalnya)
        let currentRow = 13;
        let nomorUrut = 1; // nomor urut untuk baris utama

        // Loop untuk setiap grup berdasarkan kunci (activity atau sub_kegiatan standalone)
        Object.keys(groupedData).forEach(key => {
            const group = groupedData[key];
            // Jika grup memiliki properti standalone, maka tidak ada baris utama (activity kosong),
            // sehingga tampilkan satu baris dengan kolom B = key (sub_kegiatan)
            if (group.standalone) {
                let row = (currentRow <= worksheet.rowCount)
                    ? worksheet.getRow(currentRow)
                    : worksheet.addRow();
                // Kolom A kosong, kolom B isi sub_kegiatan
                row.getCell(1).value = '';
                row.getCell(2).value = key; 
                // Gabungkan data isi_data berdasarkan kolom_kegiatan dari semua record dalam group.main
                for (let i = 1; i <= 16; i++) {
                    const cellValues = group.main
                        .filter(r => r.kolom_kegiatan == i)
                        .map(r => r.isi_data);
                    row.getCell(i + 2).value = cellValues.length > 0 ? cellValues.join(', ') : '';
                }
                row.commit();
                currentRow++;
            } else {
                // Grup dengan activity: tampilkan baris utama terlebih dahulu
                // Baris utama: gunakan data dari group.main (jika ada) atau setidaknya group key sebagai activity
                let row = (currentRow <= worksheet.rowCount)
                    ? worksheet.getRow(currentRow)
                    : worksheet.addRow();
                row.getCell(1).value = nomorUrut;  // nomor urut untuk baris utama
                row.getCell(2).value = key;          // activity
                // Isi kolom untuk baris utama, gabungkan semua record di group.main
                for (let i = 1; i <= 16; i++) {
                    const cellValues = group.main
                        .filter(r => r.kolom_kegiatan == i)
                        .map(r => r.isi_data);
                    row.getCell(i + 2).value = cellValues.length > 0 ? cellValues.join(', ') : '';
                }
                row.commit();
                nomorUrut++;
                currentRow++;

                // Kemudian, untuk setiap sub_kegiatan di grup tersebut, tampilkan baris sub
                Object.keys(group.subs).forEach(subKey => {
                    let subRow = (currentRow <= worksheet.rowCount)
                        ? worksheet.getRow(currentRow)
                        : worksheet.addRow();
                    subRow.getCell(1).value = ''; // tidak diberi nomor
                    // Di kolom B, tampilkan sub_kegiatan (dengan indentasi jika diinginkan)
                    subRow.getCell(2).value = "   " + subKey;
                    // Isi kolom untuk baris sub
                    group.subs[subKey].forEach(record => {
                        const colIndex = record.kolom_kegiatan + 2;
                        // Jika sudah ada nilai di sel tersebut, gabungkan dengan koma
                        let existing = subRow.getCell(colIndex).value || "";
                        if(existing) {
                            existing += ", " + record.isi_data;
                        } else {
                            existing = record.isi_data;
                        }
                        subRow.getCell(colIndex).value = existing;
                    });
                    subRow.commit();
                    currentRow++;
                });
            }
        });

        // Simpan file hasil ekspor
        await workbook.xlsx.writeFile(exportPath);

        res.status(200).json({ 
          message: 'Logbook exported successfully', 
          filePath: `/server/exports/${exportFileName}` 
        });
    } catch (error) {
        console.error('Error exporting logbook:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
