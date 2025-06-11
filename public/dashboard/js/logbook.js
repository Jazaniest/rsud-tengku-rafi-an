const token = localStorage.getItem('accessToken');

document.addEventListener('DOMContentLoaded', () => {
  let kegiatanData = [];
  let entryCount = 0;
  
  // Fetch user profile
  async function fetchUser() {
    if (!token) {
      console.log('Token is missing or invalid');
      return window.location.href = '../index.html';
    }
    try {
      const res = await fetchWithAuth('/api/auth/profile');
      if (!res.ok) throw new Error('Gagal mengambil data profil');
      const profile = await res.json();
      document.getElementById('role').textContent = profile.role;

      const role = profile.role;
      console.log('isi role : ', role);
      
      if (!['Staff', 'super admin'].includes(role)) {
        alert('Anda tidak memiliki akses untuk fitur ini!');
        return window.location.href = '/dashboard/index.html';
      }
      console.log('Role : ', profile.role);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  // Load daftar kegiatan
  async function loadKegiatan() {
    try {
      const res = await fetchWithAuth('/api/kegiatan');
      if (!res.ok) throw new Error('Error loading kegiatan');
      kegiatanData = await res.json();
      // Render list
      const listHtml = kegiatanData.map(k => `<li>${k.name}</li>`).join('');
      document.getElementById('kegiatanList').innerHTML = listHtml;
      // Update semua dropdown
      document.querySelectorAll('.kegiatanDropdown').forEach(sel => {
        sel.innerHTML = `<option value="">Pilih Kegiatan</option>` +
          kegiatanData.map(k => `<option value="${k.name}">${k.name}</option>`).join('');
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Render entry baru
  function renderNewEntry() {
    entryCount++;
    const container = document.getElementById('logbookEntriesContainer');
    const div = document.createElement('div');
    div.className = 'logbook-entry';
    div.dataset.entry = entryCount;
    div.innerHTML = `
      <div class="form-group">
        <label>Kegiatan:</label>
        <select class="form-control kegiatanDropdown" name="kegiatan">
          <option value="">Pilih Kegiatan</option>
          ${kegiatanData.map(k => `<option value="${k.name}">${k.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Kolom Kegiatan:</label>
        <select class="form-control" name="kolomKegiatan">
          <option value="">Pilih Kolom</option>
          ${[...Array(16)].map((_, i) => `<option value="${i+1}">${i+1}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Isi Data:</label>
        <input type="text" class="form-control" name="isiData" placeholder="Masukkan data" />
      </div>`;
    container.appendChild(div);
  }

  // Tambah kegiatan baru
  document.getElementById('btnAddKegiatan').addEventListener('click', async () => {
    const name = document.getElementById('newKegiatan').value.trim();
    if (!name) return alert('Masukkan nama kegiatan');
    try {
      const res = await fetchWithAuth('/api/kegiatan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Error adding kegiatan');
      document.getElementById('newKegiatan').value = '';
      await loadKegiatan();
    } catch (err) {
      console.error(err);
    }
  });

  // Simpan logbook
  document.getElementById('btnSaveLogbook').addEventListener('click', async () => {
    const entries = [];
    const rows = document.querySelectorAll('.logbook-entry');
    for (const row of rows) {
      const kegiatan = row.querySelector('.kegiatanDropdown').value;
      const kolom = row.querySelector('select[name="kolomKegiatan"]').value;
      const isi = row.querySelector('input[name="isiData"]').value.trim();
      if (!kegiatan || !kolom || !isi) {
        return alert('Semua field harus terisi!');
      }
      entries.push({
        row_number: row.dataset.entry,
        kegiatan,
        kolom_kegiatan: kolom,
        isi_data: isi
      });
    }
    try {
      const log_date = new Date().toISOString().split('T')[0];
      const res = await fetchWithAuth('/api/logbook/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ log_date, entries })
      });
      if (!res.ok) throw new Error('Error saving logbook');
      alert('Logbook berhasil disimpan');
      loadLogbookSummary();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan logbook');
    }
  });

  // Hapus list kegiatan
  document.getElementById('btnDeleteKegiatan').addEventListener('click', async () => {
    const btn = document.getElementById('btnDeleteKegiatan');
    if (!confirm('Yakin ingin menghapus semua kegiatan anda ?')) {
      return;
    }
    try {
      btn.disabled = true;

      const res = await fetchWithAuth('/api/kegiatan/deleteKegiatan', {
        method: 'DELETE'
      });

      if(!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `HTTP ${res.status}`);
      }

    } catch (error) {
      console.error('Error saat menghapus kegiatan: ', error);
    } finally {
      btn.disabled = false;
    }
  });

  // Load summary tanpa tanggal
  async function loadLogbookSummary() {
    try {
      const res = await fetchWithAuth('/api/logbook/user');
      if (!res.ok) throw new Error('Error loading summary');
      const data = await res.json();
      console.log('isi data:', data);
      const grouped = {};
      data.forEach(entry => {
        const kegiatan = entry.kegiatan;
        const col = parseInt(entry.kolom_kegiatan, 10);
        if (!grouped[kegiatan]) grouped[kegiatan] = Array.from({ length: 16 }, ()=>[]);
        if (col >=1 && col <=16) grouped[kegiatan][col-1].push(entry.isi_data);
      });
      const tbody = document.getElementById('summaryBody');
      tbody.innerHTML = '';
      let idx = 1;
      for (const [keg, cols] of Object.entries(grouped)) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx++}</td><td class="col-butir">${keg}</td>` +
          cols.map(arr => `<td class="col-angka">${arr.join(', ')}</td>`).join('');
        tbody.appendChild(tr);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Export logbook
  document.getElementById('btnExport').addEventListener('click', async () => {
    try {
      const res = await fetchWithAuth('/api/export/logbook');
      if (!res.ok) throw new Error('Error exporting');

      // Baca response sebagai Blob
      const blob = await res.blob();
      window.location.reload();
      alert('Export logbook berhasil !');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengekspor logbook');
    }
  });


  async function fetchList() {
    try {
      const res = await fetchWithAuth('/api/logbook/list');
      if (!res.ok) throw new Error('Gagal mengambil data list logbook');
      const data = await res.json();
      console.log('isi data: ', data);
      displayListLogbook(data);
    } catch (error) {
      console.error('Error fetching lists: ', error)
    }
  }

  async function displayListLogbook(lists) {
    const tableBody = document.getElementById('listLogbook');
    tableBody.innerHTML = '';
    lists.forEach((list, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
      <td>${index + 1}</td>
      <td>${new Date(list.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
      <td><a href="/../uploads/${list.path}" class="btn btn-info btn-sm" download>Download file</a></td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Inisialisasi
  fetchList();
  displayListLogbook();
  fetchUser();
  loadKegiatan().then(renderNewEntry);
  loadLogbookSummary();
});
