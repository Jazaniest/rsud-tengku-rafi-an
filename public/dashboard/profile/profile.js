document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../../login-form/index.html';
    return;
  }

  // Ambil data profil user
  try {
    const profileRes = await fetch('http://localhost:3000/api/auth/profile', {
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
      profilePhotoEl.src = 'http://localhost:3000/uploads/' + profile.foto_profile;
    } else {
      profilePhotoEl.src = ''; // atau set ke default placeholder
    }

    // Isi form dengan data profil yang ada
    document.getElementById('editUsername').value = profile.username;
    document.getElementById('editNamaLengkap').value = profile.namaLengkap;
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
      const updateRes = await fetch('http://localhost:3000/api/auth/editProfile', {
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

      // Jika ada foto yang diupload, perbarui tampilan foto profil
      // Misalnya, Anda bisa me-refresh halaman atau menggunakan URL yang dikembalikan oleh backend
      document.getElementById('settingsModal').style.display = 'none';
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan saat mengupdate profil.');
    }
  });

  // ------------------------------
  // KODE PDF VIEWER DENGAN PDF.js
  // ------------------------------
  
  // URL file PDF (asumsi: file bernama document.pdf berada di folder /uploads)
  const pdfUrl = `/uploads/document.pdf`;

  // Konfigurasi pdf.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.min.js';

  const canvas = document.getElementById('pdfCanvas');
  const ctx = canvas.getContext('2d');

  let pdfDoc = null;
  let currentPage = 1;
  let zoomLevel = 1.0; // Zoom 100%
  let totalPages = 0;

  // Fungsi untuk render halaman PDF
  const renderPage = async (num) => {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: zoomLevel });

    // Sesuaikan ukuran canvas secara responsif
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    await page.render(renderContext).promise;
    document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100) + '%';
    document.getElementById('currentPage').textContent = num;
  };

  // Fungsi untuk memuat PDF
  const loadPdf = async () => {
    try {
      pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
      totalPages = pdfDoc.numPages;
      document.getElementById('totalPages').textContent = totalPages;
      await renderPage(currentPage);
    } catch (error) {
      console.error('Error loading PDF:', error);
    }
  };

  loadPdf();

  document.getElementById('nextPage').addEventListener('click', async () => {
    if (currentPage < totalPages) {
      currentPage++;
      await renderPage(currentPage);
    }
  });

  document.getElementById('prevPage').addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      await renderPage(currentPage);
    }
  })

  // Event untuk zoom in dan zoom out
  document.getElementById('zoomInBtn').addEventListener('click', async () => {
    zoomLevel += 0.1;
    await renderPage(currentPage);
  });

  document.getElementById('zoomOutBtn').addEventListener('click', async () => {
    if (zoomLevel > 0.2) {
      zoomLevel -= 0.1;
      await renderPage(currentPage);
    }
  });

});
