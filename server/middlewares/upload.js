const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file di folder uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '../uploads/'); 
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file: (opsional, jika validasi tidak diperlukan, bisa dilewati)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak diizinkan, hanya Word, Excel, dan PDF yang diperbolehkan.'), false);
  }
  
  const maxSize = 5 * 1024 * 1024;
  if(file.size > maxSize) {
    cb(new Error('Ukuran file melebihi batas maksimal, pilih file dengan ukuran di bawah 5MB'))
  }
};


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload;
