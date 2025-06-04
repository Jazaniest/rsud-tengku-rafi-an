document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  console.log('berikut token yang tersimpan di dashboard.js : ', token);
  if (!token) {
    alert('anda tidak dapat melakukan aksi ini !');
    window.location.href = '../../login-form/index.html';
    return;
  }

  try {
    const profileRes = await fetch('/api/auth/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!profileRes.ok) throw new Error('Gagal mengambil data profil');
    const profile = await profileRes.json();

    document.getElementById('username').textContent = profile.username;
    document.getElementById('role').textContent = profile.role;
    
    const logbookContainer = document.getElementById('logbook');
    if (profile.role === 'Staff') {
      logbookContainer.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="profile/profile.html">Profil</a></li>
        <li class="nav-item"><a class="nav-link" href="logbook.html">Logbook</a></li>
        <li class="nav-item"><a class="nav-link" href="../index.html" id="logoutLink">Logout</a></li>
      `;
    }else if (profile.role === 'super admin') {
      logbookContainer.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="profile/profile.html">Profil</a></li>
        <li class="nav-item"><a class="nav-link" href="user.html">Data pengguna</a></li>
        <li class="nav-item"><a class="nav-link" href="../login-form/register.html">Register User</a></li>
        <li class="nav-item"><a class="nav-link" href="../index.html" id="logoutLink">Logout</a></li>
      `;
    } else {
      logbookContainer.innerHTML = `
        <li class="nav-item"><a class="nav-link" href="profile/profile.html">Profil</a></li>
        <li class="nav-item"><a class="nav-link" href="../index.html" id="logoutLink">Logout</a></li>
      `;
    }

    if (profile.role === 'super admin') {
      await initSwitchButton();
    }

    async function buttonTelegram() {
      const telegramButton = document.getElementById('telegramButton');
      try {
        const res = await fetch('/api/notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ username: profile.username })
        });

        const username = profile.username;
  
        if (!res.ok) throw new Error('Gagal memeriksa data Telegram');
  
        const data = await res.json();
  
        // Ubah isi tombol sesuai status
        if (data.linked === true) {
          telegramButton.innerHTML = '';
        } else {
          telegramButton.innerHTML = `
            <h4>Sistem notifikasi telegram</h4>
            <a id="telegram-link" href="https://t.me/rsudtr_bot?start=link:${username}" target="_blank" class="file-btn mb-3">
                Hubungkan Ke Telegram
            </a>
          `;
        }
      } catch (error) {
        console.error('Gagal memuat status Telegram:', error);
      }
    }
  
    async function initSwitchButton() {
      try {
        const registerButton = document.getElementById('register');

        if(profile.role === 'super admin') {
          registerButton.innerHTML = `
          <h4>Formulir Register</h4>
          <div class="checkbox-wrapper-8">
            <input type="checkbox" id="cb3-8" class="tgl tgl-skewed">
            <label for="cb3-8" data-tg-on="AKTIF" data-tg-off="MATI" class="tgl-btn"></label>
          </div>
        `;
        } else {
          registerButton.innerHTML = '';
        }
    
        const switchButton = document.getElementById('cb3-8');
        if (!switchButton) {
          console.error('Switch button tidak ditemukan.');
          return;
        }
    
        const response = await fetch('/api/switch/status');
        if (!response.ok) throw new Error('Gagal mengambil status switch dari server');
        
        const data = await response.json();
        console.log('Status awal dari server:', data.status);
  
        switchButton.checked = data.status;
  
        switchButton.addEventListener('change', async function () {
          const isChecked = switchButton.checked;
          // console.log('Status switch berubah:', isChecked);
    
          try {
            const saveResponse = await fetch('/api/switch/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: isChecked })
            });
    
            if (!saveResponse.ok) throw new Error('Gagal menyimpan status switch');
            const result = await saveResponse.json();
            console.log('Berhasil menyimpan status:', result);
          } catch (saveError) {
            console.error('Error saat menyimpan status:', saveError);
          }
        });
    
      } catch (error) {
        console.error('Error saat inisialisasi switch:', error);
      }
    }

    buttonTelegram();
    initSwitchButton();
    
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
  

  
  document.getElementById('logoutLink').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '../login-form/index.html';
  });

  async function fetchTasks() {
    try {
      const res = await fetch('/api/workflow/instances', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Gagal mengambil tugas');
      const data = await res.json();
      displayInitiatedTasks(data.initiatedTasks);
      displayAssignedTasks(data.assignedTasks);
      displayRecentTasks(data.recentTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }

  async function verifUser() {
    try {
      const res = await fetch('/api/workflow/verification', {
        headers : { 'Authorization': 'Bearer ' + token}
      });
      if (!res.ok) throw new Error('Gagal memuat data verifikasi');
      const data = await res.json();
      displayVerificationUser(data.assignedRows);
    } catch (error) {
      console.error('Error fetching verif tasks: ', error);
    }
  }

  async function displayVerificationUser(tasks) {
    const container = document.getElementById('verifList')
    container.innerHTML = '';
    if (tasks.length === 0) {
      container.innerHTML = '<p>Tidak ada user yang perlu di Verifikasi</p>'
    }

    tasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'col-md-4 task-item';

      const fieldLabels = {
        username: 'Username',
        namaLengkap: 'Nama Lengkap',
        tempatTanggalLahir: 'Tempat Tanggal Lahir',
        alamat: 'Alamat',
        nik: 'NIK',
        nip: 'NIP',
        pangkat: 'Pangkat',
        Ruang: 'Ruang',
        levelPk: 'Level PK',
        pendidikan: 'Pendidikan',
        noStr: 'Nomor STR',
        akhirStr: 'Expired STR',
        fileStr: 'File STR',
        noSipp: 'Nomor SIPP',
        akhirSipp: 'Expired SIPP',
        fileSipp: 'File SIPP',
        jenisKetenagaan: 'Jenis Ketenagaan'
      };
      
      
      taskEl.innerHTML = `
        <div class="card mb-3" style="color: #767676">
          <div class="card-body">
            <h5 class="card-title">${task.title} (${task.code})</h5>
            <p class="card-text">${task.description}</p>
            <p class="card-text" style="margin-bottom: 0;">
              <small>Data User:</small>
              <div style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; padding: 8px; border-radius: 4px; background-color: #f8f9fa;">
                <ul style="padding-left: 1.2em; margin-bottom: 0;">
                  ${Object.entries(task.payload).map(([key, value]) => `
                    <li><strong>${fieldLabels[key] || key}</strong>: ${value || '-'}</li>
                  `).join('')}
                </ul>
              </div>
            </p>
            <button class="btn btn-success btn-sm" onclick="processValid(${task.id}, 'setuju')">Setuju</button>
            <button class="btn btn-danger btn-sm" onclick="processValid(${task.id}, 'tolak')">Tolak</button>
          </div>
        </div>
      `;
      container.appendChild(taskEl);
    });
  }

  function displayInitiatedTasks(tasks) {
    const tableBody = document.querySelector('#initiatedTasksTable tbody');
    tableBody.innerHTML = '';
    tasks.forEach((task, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${task.code}</td>
        <td>${task.title}</td>
        <td>${task.description}</td>
        <td>${task.status}</td>
      `;
      tableBody.appendChild(row);
    });
  } 
  

  // Fungsi untuk mengambil seluruh data staff dari endpoint baru
  async function fetchStaffProfiles() {
    try {
      const res = await fetch('/api/auth/staff', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Gagal mengambil data staff');
      const profiles = await res.json();
      console.log('Data staff:', profiles);
      return profiles;
    } catch (error) {
      console.error('Error fetching staff profiles:', error);
      return [];
    }
  }

  // Fungsi untuk mengambil seluruh data karu dari endpoint baru
  async function fetchKaruProfiles() {
    try {
      const res = await fetch('/api/auth/karu', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Gagal mengambil data kepala ruangan');
      const profiles = await res.json();
      console.log('Data kepala ruangan:', profiles);
      return profiles;
    } catch (error) {
      console.error('Error fetching kepala ruangan profiles:', error);
      return [];
    }
  }



  async function displayAssignedTasks(tasks) {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';
    if (tasks.length === 0) {
      container.innerHTML = '<p>Tidak ada tugas yang ditugaskan kepada Anda.</p>';
    } else {


      // Ambil data staff untuk dropdown dari endpoint baru
      const staffProfiles = await fetchStaffProfiles();
      // console.log(staffProfiles);

      const karuProfiles = await fetchKaruProfiles();
      // console.log(karuProfiles);
    
      tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'col-md-4 task-item';
        
        // Tentukan tombol aksi yang akan ditampilkan berdasarkan kondisi
        let buttonsHTML = '';
        if (task.next_step_if_approved === null && task.next_step_if_rejected === null) {
          buttonsHTML += `<button class="btn btn-warning btn-sm" onclick="processTask(${task.id}, 'stop')">Selesaikan</button>`;
        } else {
          if (task.next_step_if_rejected === null) {
            buttonsHTML += `<button class="btn btn-success btn-sm" onclick="processTask(${task.id}, 'approve')">Setuju</button>`;
          } else {
            buttonsHTML += `<button class="btn btn-success btn-sm" onclick="processTask(${task.id}, 'approve')">Setuju</button>
                            <button class="btn btn-danger btn-sm" onclick="processTask(${task.id}, 'reject')">Tolak</button>`;
          }
          if (task.no_need_next_step) {
            buttonsHTML += `<button class="btn btn-warning btn-sm ml-1" onclick="processTask(${task.id}, 'stop')">Selesaikan</button>`;
          }
        }
    
        // Tambahkan link download jika file ada
        let fileDownloadHTML = '';
        if (task.file_path && task.last_step_id) {
          fileDownloadHTML = `<a href="/api/workflow/instance-steps/${task.last_step_id}/file" target="_blank" class="btn btn-info btn-sm">Download File</a>`;
        }
        
        // Buat input pencarian dengan datalist untuk staff
        // Menggunakan id unik per task agar datalist-nya terpisah
        // Tampilkan dropdown hanya jika task.to_role adalah "staff"
        // Ambil step_order saat ini
        const currentStepOrder = task.step_order;
        console.log('Step order saat ini:', currentStepOrder);
        const nextStepOrder = currentStepOrder + 1; // Hitung step_order berikutnya

        // Lakukan fetch untuk mendapatkan data step berikutnya
        fetch(`/api/workflow/steps/${task.workflow_id}/${nextStepOrder}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Step berikutnya tidak ditemukan');
            }
          })
          .then(nextStep => {
            // Ambil nilai to_role dari step berikutnya
            const toRole = nextStep.to_role;
            console.log('Ini role selanjutnya:', toRole);

            // Bangun dropdownHTML berdasarkan toRole
            let dropdownHTML = '';
            if (toRole === 'Staff') {
              dropdownHTML = `
                <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
                <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari staff..." list="staffList-${task.id}">
                <datalist id="staffList-${task.id}">
                  ${staffProfiles.map(staff => `<option value="${staff.nama_lengkap}">`).join('')}
                </datalist>
              `;
            }
            else if(toRole === 'Kepala Ruangan') {
              dropdownHTML = `
                <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
                <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari kepala ruangan..." list="staffList-${task.id}">
                <datalist id="staffList-${task.id}">
                  ${karuProfiles.map(karu => `<option value="${karu.nama_lengkap}">`).join('')}
                </datalist>
              `;
            }

            // Setelah dropdownHTML siap, sisipkan ke dalam innerHTML elemen taskEl
            taskEl.innerHTML = `
              <div class="card mb-3" style="color: #767676">
                <div class="card-body">
                  <h5 class="card-title">${task.title} (${task.code})</h5>
                  <p class="card-text">${task.description}</p>
                  <p class="card-text" style="margin-bottom: 0;"><small>Status: ${task.status}</small></p>
                  <p class="card-text" style="margin-bottom: 0;"><small>Langkah: ${task.current_step_order}</small></p>
                  <p class="card-text"><small>Aksis: ${task.action_description || '-'}</small></p>
                  <form class="mb-2" id="task-form-${task.id}" enctype="multipart/form-data">
                    <input type="hidden" name="instanceId" value="${task.id}">
                    ${dropdownHTML}
                    <label for="fileInput-${task.id}">Upload file (jika diperlukan):</label>
                    <input type="file" name="file" class="form-control" id="fileInput-${task.id}" accept=".pdf,.doc,.docx,.xls,.xlsx">
                  </form>
                  ${buttonsHTML}
                  ${fileDownloadHTML}
                </div>
              </div>
            `;
          })
          .catch(error => {
            console.log('Tidak ada langkah berikutnya untuk step_order:', currentStepOrder);
            // Jika fetch gagal, kamu bisa memilih untuk tetap merender elemen tanpa dropdown
            taskEl.innerHTML = `
              <div class="card mb-3" style="color: #767676">
                <div class="card-body">
                  <h5 class="card-title">${task.title} (${task.code})</h5>
                  <p class="card-text">${task.description}</p>
                  <p class="card-text" style="margin-bottom: 0;"><small>Status: ${task.status}</small></p>
                  <p class="card-text" style="margin-bottom: 0;"><small>Langkah: ${task.current_step_order}</small></p>
                  <p class="card-text"><small>Aksi: ${task.action_description || '-'}</small></p>
                  <form class="mb-2" id="task-form-${task.id}" enctype="multipart/form-data">
                    <input type="hidden" name="instanceId" value="${task.id}">
                    <label for="fileInput-${task.id}">Upload file (jika diperlukan):</label>
                    <input type="file" name="file" class="form-control" id="fileInput-${task.id}" accept=".pdf,.doc,.docx,.xls,.xlsx">
                  </form>
                  ${buttonsHTML}
                  ${fileDownloadHTML}
                </div>
              </div>
            `;
          });

        container.appendChild(taskEl);
      });
    }
  }
  


  // Render recent tasks (tugas yang telah dikerjakan user atau rekan dengan role yang sama)
  async function displayRecentTasks(tasks) {
    try {
        const profileRes = await fetch('/api/auth/profile', {
            headers: { 'Authorization': 'Bearer ' + token } // Pastikan `token` dideklarasikan sebelumnya
        });

        if (!profileRes.ok) throw new Error('Gagal mengambil data profil');

        const profile = await profileRes.json();
        const currentUser = profile.username;

        const tableBody = document.querySelector('#recentTasksTable tbody');
        tableBody.innerHTML = ''; // Hapus data lama

        if (role === 'Staff' && 'Kepala Ruangan') {
            tasks.forEach((task, index) => {
                const row = document.createElement('tr');

                // Cek apakah file ada sebelum menampilkan tombol Download
                let fileDownloadHTML = task.file_path
                    ? `<a href="/api/workflow/instance-steps/${task.step_id}/file" target="_blank" class="btn btn-info btn-sm">Download</a>`
                    : `<a>No File</a>`;

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${task.code}</td>
                    <td>${task.title}</td>
                    <td>${task.description}</td>
                    <td>${task.action_taken}</td>
                    <td>${new Date(task.acted_at).toLocaleString()}</td>
                    <td>${fileDownloadHTML}</td>
                `;

                tableBody.appendChild(row);
            });
        } 
        
        else if (role === 'super admin') {
          tasks.forEach((task, index) => {
              const row = document.createElement('tr');

              // Cek apakah file ada sebelum menampilkan tombol Download
              let fileDownloadHTML = task.file_path
                  ? `<a href="/api/workflow/instance-steps/${task.step_id}/file" target="_blank" class="btn btn-info btn-sm">Download</a>`
                  : `<a>No File</a>`;

              row.innerHTML = `
                  <td>${index + 1}</td>
                  <td>${task.code}</td>
                  <td>${task.title}</td>
                  <td>${task.description}</td>
                  <td>${task.action_taken}</td>
                  <td>${new Date(task.acted_at).toLocaleString()}</td>
                  <td>${fileDownloadHTML}</td>
              `;

              tableBody.appendChild(row);
          });
        }else {
            // Filter hanya untuk user tertentu
            const filteredTasks = tasks.filter(task => task.username === currentUser);

            filteredTasks.forEach((task, index) => {
                const row = document.createElement('tr');

                let fileDownloadHTML = task.file_path
                    ? `<a href="/api/workflow/instance-steps/${task.step_id}/file" target="_blank" class="btn btn-info btn-sm">Download</a>`
                    : `<a>No File</a>`;

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${task.code}</td>
                    <td>${task.title}</td>
                    <td>${task.description}</td>
                    <td>${task.action_taken}</td>
                    <td>${task.nama_lengkap}</td>
                    <td>${new Date(task.acted_at).toLocaleString()}</td>
                    <td>${fileDownloadHTML}</td>
                `;

                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
    }
}

  // Fungsi untuk memproses aksi tugas (approve, reject, atau stop) dengan file upload
  window.processTask = async (instanceId, action) => {
    try {
      const formElement = document.getElementById(`task-form-${instanceId}`);
      const formData = new FormData(formElement);
      formData.append('action', action);
      
      const res = await fetch(`/api/workflow/instances/${instanceId}/step`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token
        },
        body: formData
      });
      const result = await res.json();
      alert(result.message);
      fetchTasks();
    } catch (error) {
      console.error('Error processing task:', error);
      alert('Terjadi kesalahan saat memproses tugas.');
    }
  };

  window.processValid = async function(taskId, action) {
    try {
      const res = await fetch(`/api/workflow/tasks/${taskId}/step`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: action })
      });

      if (!res.ok) throw new Error('Gagal memproses tugas');
      const result = await res.json();
      console.log('Tugas berhasil diproses:', result);
      await verifUser();
    } catch (error) {
      console.error('Error processing task:', error);
    }
  };


    // Render template workflow untuk inisiasi tugas
    async function displayAvailableTemplates(templates) {
      const container = document.getElementById('availableTasksList');
      container.innerHTML = '';

      const staffProfiles = await fetchStaffProfiles();
      const karuProfiles = await fetchKaruProfiles();

      if (!templates || templates.length === 0) {
        container.innerHTML = '<p>Tidak ada tugas yang dapat diinisiasi untuk peran Anda.</p>';
        return;
      }

      templates.forEach(template => {

        fetch(`/api/workflow/steps/${template.workflow_id}/1`, {
          headers: { 'Authorization': 'Bearer ' + token}
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Step berikutnya tidak ditemukan');
            }
          })
          .then(nextStep => {
            const toRole = nextStep.to_role;
            console.log('role selanjutnya dari inisiasi: ', toRole);

            let dropdownInitiate = '';
            if (toRole === 'Staff') {
              dropdownInitiate = `
              <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
                  <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari staff..." list="staffList-${template.workflow_id}">
                  <datalist id="staffList-${template.workflow_id}">
                    ${staffProfiles.map(staff => `<option value="${staff.nama_lengkap}">`).join('')}
                  </datalist>
              `
            }
            else if (toRole === 'Kepala Ruangan') {
              dropdownInitiate = `
              <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
                  <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari kepala ruangan..." list="staffList-${template.workflow_id}">
                  <datalist id="staffList-${template.workflow_id}">
                    ${karuProfiles.map(karu => `<option value="${karu.nama_lengkap}">`).join('')}
                  </datalist>
              `
            }

            const templateEl = document.createElement('div');
            templateEl.className = 'col-md-4 task-item';
            templateEl.innerHTML = `
              <div class="card mb-3" style="color: #767676">
                <div class="card-body">
                  <h5 class="card-title">${template.title} (${template.code})</h5>
                  <p class="card-text">${template.description}</p>
                  <p class="card-text"><small>Aksi: ${template.action_description}</small></p>
                  <form class="mb-2" id="template-form-${template.workflow_id}" enctype="multipart/form-data">
                    <input type="hidden" name="instanceId" value="${template.workflow_id}">
                    ${dropdownInitiate}
                    <input type="hidden" name="workflow_id" value="${template.workflow_id}">
                    <label for="templateFileInput-${template.workflow_id}">Upload file (jika diperlukan):</label>
                    <input type="file" name="file" class="form-control" id="templateFileInput-${template.workflow_id}" accept=".pdf,.doc,.docx,.xls,.xlsx">
                  </form>
                  <button class="btn btn-primary btn-sm" id="start-btn-${template.workflow_id}" type="button">Mulai Tugas</button>
                </div>
              </div>
            `;
            container.appendChild(templateEl);


            // Attach click handler
            const btn = document.getElementById(`start-btn-${template.workflow_id}`);
            btn.addEventListener('click', async () => {
              try {
                const formElement = document.getElementById(`template-form-${template.workflow_id}`);
                const formData = new FormData(formElement);

                const assignedInput = formElement.querySelector('input[name="assigned_user_name"]');
                formData.set('assigned_user_name', assignedInput?.value || '');
                const res = await fetch('/api/workflow/instances', {
                  method: 'POST',
                  headers: {
                    'Authorization': 'Bearer ' + token
                  },
                  body: formData
                });
                const result = await res.json();

                if (res.ok) {
                  alert(result.message);
                  // untuk refresh tasklist
                  fetchTasks();
                } else {
                  alert(result.message);
                }
              } catch (error) {
                console.error('Error initiating task:', error);
                alert('Terjadi kesalahan saat menginisiasi tugas.');
              }

              
          });
        })
      });
    }
      
// sudah menambahkan fungsi untuk memberikan value user tertentu jika langkah selanjutnya adalah staff atau karu
// untuk backend nya belum di setting untuk penerimaannya
// uji untuk memastikan tampil dropdown apabila next role adalah karu atau staff sudah di lakukan

  
  // Fungsi untuk mengambil template workflow
  async function fetchAvailableTemplates() {
    try {
      const res = await fetch('/api/workflow/templates', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Gagal mengambil template workflow');
      const templates = await res.json();
      displayAvailableTemplates(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }

  // Panggil fungsi untuk mengambil data tugas dan template
  fetchTasks();
  verifUser();
  fetchAvailableTemplates();
});
