document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    window.location.href = '../../login-form/index.html';
    return;
  }

  // Ambil data profil user
  try {
    const profileRes = await fetchWithAuth('/api/auth/profile');
    if (!profileRes.ok) throw new Error('Gagal mengambil data profil');
    const profile = await profileRes.json();
    
    function safeText(value) {
      return (value === undefined || value === 'undefined' || value === null) ? '' : value;
    }

    document.getElementById('username').textContent = safeText(profile.username);
    document.getElementById('role').textContent = safeText(profile.role);
    document.getElementById('namaLengkap').textContent = safeText(profile.namaLengkap);
    document.getElementById('tempatTanggalLahir').textContent = safeText(profile.tempatTanggalLahir);
    document.getElementById('nip').textContent = safeText(profile.nip);
    document.getElementById('pangkat').textContent = safeText(profile.pangkat);
    document.getElementById('levelPk').textContent = safeText(profile.levelPk);
    document.getElementById('alamat').textContent = safeText(profile.alamat);
    document.getElementById('nik').textContent = safeText(profile.nik);
    // document.getElementById('ruang').textContent = safeText(profile.ruang);
    document.getElementById('pendidikan').textContent = safeText(profile.pendidikan);
    document.getElementById('noStr').textContent = safeText(profile.noStr);
    document.getElementById('expiredStr').textContent = safeText(profile.expiredStr);
    // document.getElementById('fileStr').textContent = safeText(profile.fileStr);
    const fileStr = document.getElementById('fileStr');
    const urlStr = profile.fileStr;
    if(urlStr) {
      fileStr.innerHTML = `
      <a href="${urlStr}" target="_blank" class="edit-btn">Lihat File</a>
      `;
    } else {
      fileStr.innerHTML = `<span>Tidak ada file</span>`;
    }

    document.getElementById('noSipp').textContent = safeText(profile.noSipp);
    document.getElementById('expiredSipp').textContent = safeText(profile.expiredSipp);
    // document.getElementById('fileSipp').textContent = safeText(profile.fileSipp);
    const fileSipp = document.getElementById('fileSipp');
    const urlSipp = profile.fileSipp;
    if(urlSipp) {
      fileSipp.innerHTML = `
      <a href="${urlSipp}" target="_blank" class="edit-btn">Lihat File</a>
      `;
    } else {
      fileSipp.innerHTML = `<span>Tidak ada file</span>`;
    }
    document.getElementById('jenisKetenagaan').textContent = safeText(profile.jenisKetenagaan);

    // Perbarui foto profil jika ada, jika tidak kosong
    const profilePhotoEl = document.querySelector('.profile-photo');
    if (profile.foto_profile) {
      profilePhotoEl.src = '/../uploads/' + profile.foto_profile;
    } else {
      profilePhotoEl.src = ''; // atau set ke default placeholder
    }

    // Isi form dengan data profil yang ada
    document.getElementById('editUsername').value = safeText(profile.username);
    document.getElementById('editNamaLengkap').value = safeText(profile.namaLengkap);
    document.getElementById('editTempatTanggalLahir').value = safeText(profile.tempatTanggalLahir);
    document.getElementById('editAlamat').value = safeText(profile.alamat);
    document.getElementById('editNik').value = safeText(profile.nik);
    document.getElementById('editNip').value = safeText(profile.nip);
    document.getElementById('editPangkat').value = safeText(profile.pangkat);
    // document.getElementById('editRuang').value = safeText(profile.ruang);
    document.getElementById('editLevelPk').value = safeText(profile.levelPk);
    document.getElementById('editPendidikan').value = safeText(profile.pendidikan);
    document.getElementById('editNoStr').value = safeText(profile.noStr);
    document.getElementById('editExpiredStr').value = safeText(profile.expiredStr);
    document.getElementById('editNoSipp').value = safeText(profile.noSipp);
    document.getElementById('editExpiredSipp').value = safeText(profile.expiredSipp);
    document.getElementById('editJenisKetenagaan').value = safeText(profile.jenisKetenagaan);
    document.getElementById('editFileStr').value = safeText(profile.fileStr);
    document.getElementById('editFileSipp').value = safeText(profile.fileSipp);

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
    if (e.target === modal || e.target === modalContent) {
      modalContent.style.display = 'none';
    }
  });

  const username = localStorage.getItem('username');
  console.log('isi username di localstorage: ', username)

  document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    
    try {
      const res = await fetchWithAuth('/api/auth/editProfile', {
        method: 'PUT',
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
