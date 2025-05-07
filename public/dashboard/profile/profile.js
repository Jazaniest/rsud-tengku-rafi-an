document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../login-form/index.html';
    return;
  }

  // Ambil data profil user
  try {
    const profileRes = await fetch('/api/auth/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!profileRes.ok) throw new Error('Gagal mengambil data profil');
    const profile = await profileRes.json();

    document.getElementById('username').textContent = profile.username;
    document.getElementById('role').textContent = profile.role;
    document.getElementById('nip').textContent = profile.nip;
    document.getElementById('namaLengkap').textContent = profile.namaLengkap;
    document.getElementById('pangkat').textContent = profile.pangkat;
    document.getElementById('levelPk').textContent = profile.levelPk;
    document.getElementById('unitKerja').textContent = profile.unitKerja;

    // Perbarui foto profil jika ada, jika tidak kosong
    const profilePhotoEl = document.querySelector('.profile-photo');
    if (profile.foto_profile) {
      profilePhotoEl.src = '/uploads/' + profile.foto_profile;
    } else {
      profilePhotoEl.src = ''; // atau set ke default placeholder
    }

    // Isi form dengan data profil yang ada
    document.getElementById('editUsername').value = profile.username;
    document.getElementById('editNamaLengkap').value = profile.namaLengkap;
    document.getElementById('editTempatTanggalLahir').value = profile.tempatTanggalLahir;
    document.getElementById('editAlamat').value = profile.alamat;
    document.getElementById('editNik').value = profile.nik;
    document.getElementById('editNip').value = profile.nip;
    document.getElementById('editPangkat').value = profile.pangkat;
    document.getElementById('editRuang').value = profile.ruang;
    document.getElementById('editLevelPk').value = profile.levelPk;
    document.getElementById('editUnitKerja').value = profile.unitKerja;
    document.getElementById('editPendidikan').value = profile.pendidikan;
    document.getElementById('editNoStr').value = profile.noStr;
    document.getElementById('editExpiredStr').value = profile.expiredStr;
    document.getElementById('editNoSipp').value = profile.noSipp;
    document.getElementById('editExpiredSipp').value = profile.expiredSipp;
    document.getElementById('editKredensial').value = profile.kredensial;
    document.getElementById('editJenisKetenagaan').value = profile.jenisKetenagaan;
    document.getElementById('editFileStr').value = profile.fileStr;
    document.getElementById('editFileSipp').value = profile.fileSipp;


  } catch (error) {
    console.error('Error fetching profile:', error);
  }

  // Tampilkan modal ketika tombol Edit Profil diklik
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'flex';
  });

  // Sembunyikan modal ketika tombol Batal diklik
  document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'none';
  });

  // Tangani form submit untuk mengedit profil, gunakan FormData agar mendukung file upload
  document.getElementById('editProfileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = document.getElementById('editProfileForm');
    const formData = new FormData(form);

    try {
      const updateRes = await fetch('/api/auth/editProfile', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
        body: formData,
      });

      if (!updateRes.ok) throw new Error('Gagal mengupdate profil');
      const result = await updateRes.json();
      alert(result.message);

      // Update tampilan profil dengan data baru
      document.getElementById('username').textContent = formData.get('username');
      document.getElementById('namaLengkap').textContent = formData.get('namaLengkap');

      // Jika ada foto yang diupload, perbarui tampilan foto profil dengan cara refresh halaman
      document.getElementById('settingsModal').style.display = 'none';
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat mengupdate profil.');
    }
  });


  //fungsi untuk menyembunyikan modal ketika klik di luar jendela modal
  const modal = document.querySelector('.settings-content');
  const modalContent = document.querySelector('.settings-modal');

  document.addEventListener('click', (e) => {
    if (e.target === modal / modalContent) {
      modal.classList.remove('show');
    }
  });

  // ------------------------------
  // KODE PDF VIEWER DENGAN PDF.js
  // ------------------------------
  
//   let pdfDoc = null,
//       pageNum = 1,
//       pageRendering = false,
//       pageNumPending = null,
//       scale = 1.5,
//       canvas = null,
//       ctx = null;

//   document.addEventListener('DOMContentLoaded', () => {
//     canvas = document.getElementById('pdf-canvas');
//     ctx = canvas.getContext('2d');

//     document.getElementById('prev-page').addEventListener('click', onPrevPage);
//     document.getElementById('next-page').addEventListener('click', onNextPage);
//   });

//   function convertGoogleDriveLink(link) {
//     const regex = /\/d\/([a-zA-Z0-9_-]+)\//;
//     const match = link.match(regex);
    
//     if (match && match[1]) {
//       const fileId = match[1];
//       const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
//       return directLink;
//     } else {
//       console.error('Link tidak valid');
//       return null;
//     }
//   }

//   function loadPdf() {
//     const originalLink = 'https://drive.google.com/file/d/1GbHNgvFNwNEl3LI2_7yp7VR-JnEaepE1/view?usp=sharing';
//     const directLink = convertGoogleDriveLink(originalLink);

//     if (!directLink) {
//       alert('Link tidak valid. Pastikan format link benar.');
//       return;
//     }

//     pdfjsLib.getDocument(directLink).promise.then(function(pdfDoc_) {
//       pdfDoc = pdfDoc_;
//       document.getElementById('controls').style.display = 'block';
//       document.getElementById('page-count').textContent = pdfDoc.numPages;

//       // Mulai dari halaman pertama
//       pageNum = 1;
//       renderPage(pageNum);
//     }).catch(function(error) {
//       console.error('Error saat memuat PDF: ', error);
//       alert('Gagal memuat PDF. Pastikan file bisa diakses publik.');
//     });
//   }

//   function renderPage(num) {
//     pageRendering = true;

//     pdfDoc.getPage(num).then(function(page) {
//       const viewport = page.getViewport({ scale: scale });
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       const renderContext = {
//         canvasContext: ctx,
//         viewport: viewport
//       };
//       const renderTask = page.render(renderContext);

//       renderTask.promise.then(function() {
//         pageRendering = false;

//         if (pageNumPending !== null) {
//           renderPage(pageNumPending);
//           pageNumPending = null;
//         }
//       });
//     });

//     document.getElementById('page-num').textContent = num;
//   }

//   function queueRenderPage(num) {
//     if (pageRendering) {
//       pageNumPending = num;
//     } else {
//       renderPage(num);
//     }
//   }

//   function onPrevPage() {
//     if (pageNum <= 1) {
//       return;
//     }
//     pageNum--;
//     queueRenderPage(pageNum);
//   }

//   function onNextPage() {
//     if (pageNum >= pdfDoc.numPages) {
//       return;
//     }
//     pageNum++;
//     queueRenderPage(pageNum);
//   }

//   loadPdf();

});
