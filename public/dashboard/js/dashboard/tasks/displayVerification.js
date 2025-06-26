export function displayVerificationUser(tasks) {
  const container = document.getElementById('verifList');
  container.innerHTML = '';

  const role = document.getElementById('role').textContent;
  if (role !== 'super admin') {
    $('#register').hide();
    $('#verifList').prev('h3').hide();
    $('#verifList').hide();
    return;
  }

  if (!tasks || tasks.length === 0) {
    container.innerHTML = `
      <h4>Tugas Admin</h4>
      <div><p>Tidak ada user yang perlu di Verifikasi</p></div>`;
    return;
  }

  const fieldLabels = {
    username: 'Username', namaLengkap: 'Nama Lengkap', nik: 'NIK',
    nip: 'NIP', pangkat: 'Pangkat', Ruang: 'Ruang',
    levelPk: 'Level PK', pendidikan: 'Pendidikan',
    tempatTanggalLahir: 'Tempat Tanggal Lahir', alamat: 'Alamat',
    noStr: 'Nomor STR', akhirStr: 'Expired STR', fileStr: 'File STR',
    noSipp: 'Nomor SIPP', akhirSipp: 'Expired SIPP', fileSipp: 'File SIPP',
    jenisKetenagaan: 'Jenis Ketenagaan'
  };

  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = 'col-md-4 task-item';
    taskEl.innerHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <h5>${task.title} (${task.code})</h5>
          <div style="max-height:150px;overflow:auto;">
            <ul>${Object.entries(task.payload).map(
              ([k,v]) => `<li><strong>${fieldLabels[k]||k}:</strong> ${v||'-'}</li>`
            ).join('')}</ul>
          </div>
          <button class="btn btn-success btn-sm" onclick="processValid(${task.id}, 'setuju')">Setuju</button>
          <button class="btn btn-danger btn-sm" onclick="processValid(${task.id}, 'tolak')">Tolak</button>
        </div>
      </div>`;
    container.appendChild(taskEl);
  });
}
