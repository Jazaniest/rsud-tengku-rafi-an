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
    document.getElementById('editTempatTanggalLahir').textContent = profile.tempatTanggalLahir;
    document.getElementById('editAlamat').textContent = profile.alamat;
    document.getElementById('editNik').textContent = profile.nik;
    document.getElementById('editRuang').textContent = profile.ruang;
    document.getElementById('editPendidikan').textContent = profile.pendidikan;
    document.getElementById('editNoStr').textContent = profile.noStr;
    document.getElementById('editExpiredStr').textContent = profile.expiredStr;
    document.getElementById('editFileStr').textContent = profile.fileStr;
    document.getElementById('editNoSipp').textContent = profile.noSipp;
    document.getElementById('editExpiredSipp').textContent = profile.expiredSipp;
    document.getElementById('editFileSipp').textContent = profile.fileSipp;
    document.getElementById('editKredensial').textContent = profile.kredensial;
    document.getElementById('editJenisKetenagaan').textContent = profile.jenisKetenagaan;

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


  //fungsi untuk menyembunyikan modal ketika klik di luar jendela modal
  const modal = document.querySelector('.settings-content');
  const modalContent = document.querySelector('.settings-modal');

  document.addEventListener('click', (e) => {
    if (e.target === modal / modalContent) {
      modal.classList.remove('show');
    }
  });

  document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
  
    try {
      const res = await fetch('/api/auth/editProfile', {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
        body: formData
      });
      const result = await res.json();
      alert(result.message);
      document.getElementById('settingsModal').style.display = 'none';
      // Tampilkan badge “Menunggu Verifikasi” di UI profil, misal:
      // document.querySelector('.profile-header').insertAdjacentHTML('beforeend', '<span class="badge badge-warning">Pending</span>');
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim perubahan.');
    }
  });

});
