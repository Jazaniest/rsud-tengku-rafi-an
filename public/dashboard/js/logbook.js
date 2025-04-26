const token = localStorage.getItem('token')

const fetchUser = async () => {
  if (!token) {
    console.log('Token is missing or invalid');
    window.location.href = '/login';
    return;
  }

  try {
    const profileRes = await fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!profileRes.ok) throw new Error('Gagal mengambil data profil');
    const profile = await profileRes.json();

    document.getElementById('role').textContent = profile.role;
    if (profile.role !== 'staff') {
      console.log('User tidak sesuai!');
      alert('Anda tidak memiliki akses untuk fitur ini!');
      window.location.href = '/public/dashboard/index.html';
    } else {
      console.log('Role sesuai!');
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

$(document).ready(function(){
  let kegiatanData = [];
  let entryCount = 0;

  function loadKegiatan() {
    $.ajax({
      url: 'http://localhost:3000/api/kegiatan',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
      success: function(data) {
        kegiatanData = data;
        let listHtml = '';
        data.forEach(k => { listHtml += '<li>' + k.name + '</li>'; });
        $('#kegiatanList').html(listHtml);
        // Update semua dropdown kegiatan pada entri
        $('.kegiatanDropdown').each(function() {
          const sel = $(this);
          sel.empty().append('<option value="">Pilih Kegiatan</option>');
          kegiatanData.forEach(k => sel.append('<option value="'+ k.name +'">'+ k.name +'</option>'));
        });
      },
      error: function(err) { console.error('Error loading kegiatan', err); }
    });
  }

  function renderNewEntry() {
    entryCount++;
    const entryHtml = `<div class="logbook-entry" data-entry="${entryCount}">
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
      </div>
    </div>`;
    $('#logbookEntriesContainer').append(entryHtml);
    // Pastikan dropdown terbaru diisi
    loadKegiatan();
  }

  // Inisialisasi
  loadKegiatan();
  fetchUser();
  renderNewEntry();

  // Tambah Kegiatan baru
  $('#btnAddKegiatan').click(function() {
    const name = $('#newKegiatan').val().trim();
    if (!name) {
      alert('Masukkan nama kegiatan');
      return;
    }
    $.ajax({
      url: 'http://localhost:3000/api/kegiatan',
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      contentType: 'application/json',
      data: JSON.stringify({ name }),
      success: function() {
        $('#newKegiatan').val('');
        loadKegiatan();
      },
      error: function(err) { console.error('Error adding kegiatan', err); }
    });
  });

  // Simpan Logbook
  $('#btnSaveLogbook').click(function() {
    const entries = [];
    let valid = true;
    $('#logbookEntriesContainer .logbook-entry').each(function() {
      const row = $(this);
      const row_number = row.data('entry');
      const kegiatan = row.find('.kegiatanDropdown').val();
      const kolomKegiatan = row.find('select[name="kolomKegiatan"]').val();
      const isiData = row.find('input[name="isiData"]').val().trim();
      if (!kegiatan) { alert('Kegiatan harus dipilih!'); valid = false; return false; }
      if (!kolomKegiatan) { alert('Kolom harus dipilih!'); valid = false; return false; }
      if (!isiData) { alert('Data harus terisi!'); valid = false; return false; }
      entries.push({ row_number, kegiatan, kolom_kegiatan: kolomKegiatan, isi_data: isiData });
    });
    if (!valid) return;
    const log_date = new Date().toISOString().split('T')[0];
    $.ajax({
      url: 'http://localhost:3000/api/logbook',
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      contentType: 'application/json',
      data: JSON.stringify({ log_date, entries }),
      success: function() { alert('Logbook berhasil disimpan'); loadLogbookSummary(); },
      error: function(err) { console.error('Error saving logbook', err); alert('Terjadi kesalahan saat menyimpan logbook'); }
    });
  });

  function loadLogbookSummary() {
    const log_date = new Date().toISOString().split('T')[0];
    $.ajax({
      url: `http://localhost:3000/api/logbook?log_date=${log_date}`,
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
      success: function(data) {
        const grouped = {};
        data.forEach(entry => {
          const kegiatan = entry.kegiatan;
          const rawCol = entry.kolom_kegiatan ?? entry.kolomKegiatan;
          if (!rawCol) return;
          const col = parseInt(rawCol, 10);
          if (isNaN(col) || col < 1 || col > 16) return;
          if (!grouped[kegiatan]) {
            grouped[kegiatan] = {};
            for (let i = 1; i <= 16; i++) grouped[kegiatan][i] = [];
          }
          grouped[kegiatan][col].push(entry.isi_data);
        });

        let summaryHtml = '';
        let rowNumber = 1;
        Object.keys(grouped).forEach(kegiatan => {
          summaryHtml += '<tr>' +
            `<td>${rowNumber++}</td>` +
            `<td class=\"col-butir\">${kegiatan}</td>` +
            [...Array(16).keys()].map(i => {
              const cellData = grouped[kegiatan][i+1] || [];
              return `<td class=\"col-angka\">${cellData.length ? cellData.join(', ') : ''}</td>`;
            }).join('') +
            '</tr>';
        });
        $('#summaryBody').html(summaryHtml);
      },
      error: function(err) { console.error('Error loading logbook summary', err); }
    });
  }

  loadLogbookSummary();

  // Export Logbook
  if (localStorage.getItem('downloadButtonAdded') === 'true') {
    const downloadButtonHtml = `<a id=\"linkDownload\" href=\"${localStorage.getItem('filePath')}\" class=\"btn btn-info\" target=\"_blank\">Download File</a>`;
    $('.export-buttons').append(downloadButtonHtml);
  }

  $('#btnExport').click(function() {
    $.ajax({
      url: 'http://localhost:3000/api/export/logbook',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
      success: function(data) {
        alert(data.message);
        const downloadButtonHtml = `<a id=\"linkDownload\" href=\"${data.filePath}\" class=\"btn btn-info\" target=\"_blank\">Download File</a>`;
        localStorage.setItem('downloadButtonAdded', 'true');
        localStorage.setItem('filePath', data.filePath);
        if ($('#linkDownload').length === 0) $('.export-buttons').append(downloadButtonHtml);
      },
      error: function(err) { console.error('Error exporting logbook', err); alert('Terjadi kesalahan saat mengekspor logbook'); }
    });
  });
});
