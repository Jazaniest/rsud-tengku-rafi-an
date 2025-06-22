document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('accessToken');
  // console.log('berikut token yang tersimpan di dashboard.js : ', token);
  if (!token) {
    alert('anda belum login, silahkan login terlebih dahulu !');
    window.location.href = '../../login-form/index.html';
    return;
  }

  try {
    const profileRes = await fetchWithAuth('/api/auth/profile');
    if (!profileRes.ok) throw new Error('Gagal mengambil data profil');
    const profile = await profileRes.json();

    document.getElementById('username').textContent = profile.username;
    document.getElementById('role').textContent = profile.role;
    

    //optimasi bagian ini kedepannya, terlalu banyak pemakaian kode berulang
    const logbookContainer = document.getElementById('logbook');
    if (profile.role === 'Staff') {
      logbookContainer.innerHTML = `
        <li class="nav-item profile-mobile"><a class="nav-link" href="profile/profile.html">My profile</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" href="logbook.html">Logbook</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">Ganti Password</a></li>
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          <button id="profileBtn" class="btn p-0 border-0 bg-transparent">
            <img src="img/profile-icon.png" alt="profile" style="width: 180%; height:180%">
          </button>

          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              <button class="value" id="profile-button">
                <i class="bi bi-person" style="color: #626c77;"></i>
                My profile
              </button>
              <button class="value" id="logbook-button">
                <i class="bi bi-book" style="color: #626c77;"></i>
                Logbook
              </button>
              <button class="value" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">
                <i class="bi bi-key" style="color: #626c77;"></i>
                Ganti Password
              </button>
            </div>
          </div>
        </li>
        <li class="nav-item profile-desktop">
          <button class="Btn-logout mt-3" id="logoutLink">
            <div class="sign">
              <svg viewBox="0 0 512 512">
                <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                ></path>
              </svg>
            </div>
            <div class="text">Logout</div>
          </button>
        </li>

        <li class="nav-item profile-mobile">
          <a class="nav-link" href="../login-form/index.html" id="logoutLink">Logout</a>
        </li>
      `;
    } else if (profile.role === 'super admin') {
      logbookContainer.innerHTML = `
        <li class="nav-item profile-mobile"><a class="nav-link" href="profile/profile.html">My profile</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" href="user.html">Data user</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" href="../login-form/register.html">Register user</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">Ganti Password</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" id="btnOpenResetAdminModal" data-bs-toggle="modal" data-bs-target="#modalResetAdmin">Reset Password User</a></li>
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          <button id="profileBtn" class="btn p-0 border-0 bg-transparent">
            <img src="img/profile-icon.png" alt="profile" style="width: 180%; height:180%">
          </button>

          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              <button class="value" id="profile-button">
                <i class="bi bi-person" style="color: #626c77;"></i>
                My profile
              </button>
              <button class="value" id="user-data-button">
                <i class="bi bi-card-list" style="color: #626c77;"></i>
                Data user
              </button>
              <button class="value" id="register-button">
                <i class="bi bi-plus-circle" style="color: #626c77;"></i>
                Register user
              </button> 
              <button class="value" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">
                <i class="bi bi-key" style="color: #626c77;"></i>
                Ganti Password
              </button>
              <button class="value" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetAdmin">
                <i class="bi bi-key" style="color: #626c77;"></i>
                Reset Password User
              </button> 
            </div>
          </div>
        </li>
        <li class="nav-item profile-desktop">
          <button class="Btn-logout mt-3" id="logoutLink">
            <div class="sign">
              <svg viewBox="0 0 512 512">
                <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                ></path>
              </svg>
            </div>
            <div class="text">Logout</div>
          </button>
        </li>

        <li class="nav-item profile-mobile">
          <a class="nav-link" href="../login-form/index.html" id="logoutLink">Logout</a>
        </li>
      `;
    } else if (profile.role === 'Kepala Ruangan') {
      logbookContainer.innerHTML = `
        <li class="nav-item profile-mobile"><a class="nav-link" href="profile/profile.html">My profile</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" href="logbook.html">Logbook</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">Ganti Password</a></li>
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          <button id="profileBtn" class="btn p-0 border-0 bg-transparent">
            <img src="img/profile-icon.png" alt="profile" style="width: 180%; height:180%">
          </button>

          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              <button class="value" id="profile-button">
                <i class="bi bi-person" style="color: #626c77;"></i>
                My profile
              </button>
              <button class="value" id="logbook-button">
                <i class="bi bi-book" style="color: #626c77;"></i>
                Logbook
              </button>
              <button class="value" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">
                <i class="bi bi-key" style="color: #626c77;"></i>
                Ganti Password
              </button>
            </div>
          </div>
        </li>
        <li class="nav-item profile-desktop">
          <button class="Btn-logout mt-3" id="logoutLink">
            <div class="sign">
              <svg viewBox="0 0 512 512">
                <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                ></path>
              </svg>
            </div>
            <div class="text">Logout</div>
          </button>
        </li>

        <li class="nav-item profile-mobile">
          <a class="nav-link" href="../login-form/index.html" id="logoutLink">Logout</a>
        </li>
      `;
    } else {
      logbookContainer.innerHTML = `
        <li class="nav-item profile-mobile"><a class="nav-link" href="profile/profile.html">My profile</a></li>
        <li class="nav-item profile-mobile"><a class="nav-link" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">Ganti Password</a></li>
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          <button id="profileBtn" class="btn p-0 border-0 bg-transparent">
            <img src="img/profile-icon.png" alt="profile" style="width: 180%; height:180%">
          </button>

          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              <button class="value" id="profile-button">
                <i class="bi bi-person" style="color: #626c77;"></i>
                My profile
              </button>
              <button class="value" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">
                <i class="bi bi-key" style="color: #626c77;"></i>
                Ganti Password
              </button>
            </div>
          </div>
        </li>
        <li class="nav-item profile-desktop">
          <button class="Btn-logout mt-3" id="logoutLink">
            <div class="sign">
              <svg viewBox="0 0 512 512">
                <path
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                ></path>
              </svg>
            </div>
            <div class="text">Logout</div>
          </button>
        </li>

        <li class="nav-item profile-mobile">
          <a class="nav-link" href="../login-form/index.html" id="logoutLink">Logout</a>
        </li>
      `;
    }

    if (profile.role === 'super admin') {
      await initSwitchButton();
    }

    async function buttonTelegram() {
      const telegramButton = document.getElementById('telegramButton');
      try {
        const res = await fetchWithAuth('/api/notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
    
        const response = await fetch('/api/switch/status-get');
        if (!response.ok) throw new Error('Gagal mengambil status switch dari server');
        
        const data = await response.json();
        // console.log('Status awal dari server:', data.status);
  
        switchButton.checked = data.status;
  
        switchButton.addEventListener('change', async function () {
          const isChecked = switchButton.checked;
          // console.log('Status switch berubah:', isChecked);
    
          try {
            const saveResponse = await fetchWithAuth('/api/switch/status-post', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: isChecked })
            });
    
            if (!saveResponse.ok) throw new Error('Gagal menyimpan status switch');
            const result = await saveResponse.json();
            // console.log('Berhasil menyimpan status:', result);
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


  const profileBtn     = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  // toggle dropdown
  if(profileBtn) {
    profileBtn.addEventListener('click', function(e) {
      e.preventDefault();
      profileDropdown.style.display = 
        profileDropdown.style.display === 'block' ? 'none' : 'block';
    });
  }

  // tutup kalau klik di luar dropdown
  document.addEventListener('click', function(e) {
    const isClickInside = profileBtn.contains(e.target)
                        || profileDropdown.contains(e.target);
    if (!isClickInside) {
      profileDropdown.style.display = 'none';
    }
  });

  
  function addNavListener (id, url) {
    const el = document.getElementById(id);
    if(el) {
      el.addEventListener('click', function () {
        window.location.href = url;
      })
    }
  }

  addNavListener('profile-button', 'profile/profile.html');
  addNavListener('logbook-button', 'logbook.html');
  addNavListener('user-data-button', 'user.html');
  addNavListener('register-button', '../login-form/register.html');

  const modalUserElement = document.getElementById('modalResetUser');
  const modalUserInstance = new bootstrap.Modal(modalUserElement);

  document.getElementById('btnOpenResetUserModal').addEventListener('click', () => {
    modalUserInstance.show();
  });

  document.getElementById('cancelResetUserBtn').addEventListener('click', () => {
    modalUserInstance.hide();
  })

  const userRole = document.getElementById('role');
  if(userRole === 'super admin') {
    const modalAdminElement = document.getElementById('modalResetAdmin');
    const modalAdminInstance = new bootstrap.Modal(modalAdminElement);

    document.getElementById('btnOpenResetAdminModal').addEventListener('click', () => {
      modalAdminInstance.show();
    })

    document.getElementById('cancelResetAdminBtn').addEventListener('click', () => {
      modalAdminInstance.hide();
    })
  }

  
  

  document.getElementById('submitResetUserBtn').addEventListener('click', async () => {
    const oldPassword = document.getElementById('oldPasswordInput').value;
    const newPassword = document.getElementById('newPasswordInput').value;

    try {
      const response = await fetchWithAuth('/api/auth/reset-pass-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert('Password berhasil diubah!');
      bootstrap.Modal.getInstance(document.getElementById('modalResetUser')).hide();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  });

  document.getElementById('submitResetAdminBtn').addEventListener('click', async () => {
    const role = document.getElementById('role').textContent;
    console.log('isi role : ', role);
    if (role != 'super admin') {
      alert('Hanya super admin yang dapat mereset password pengguna lain.');
      return;
    } else {}

    const username = document.getElementById('targetUsernameInput').value;
    const newPassword = document.getElementById('adminNewPasswordInput').value;

    try {
      const response = await fetchWithAuth('/api/auth/reset-pass-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert(`Password untuk ${username} berhasil direset.`);
      bootstrap.Modal.getInstance(document.getElementById('modalResetAdmin')).hide();
    } catch (error) {
      alert('Gagal: ' + error.message);
    }
  });

    const modalResetAdminEl = document.getElementById('modalResetAdmin');
    if (modalResetAdminEl) {
      modalResetAdminEl.addEventListener('hidden.bs.modal', () => {
        // Reset input
        document.getElementById('targetUsernameInput').value = '';
        document.getElementById('adminNewPasswordInput').value = '';
      });
    }

    const modalResetUserEl = document.getElementById('modalResetUser');
    if (modalResetUserEl) {
      modalResetUserEl.addEventListener('hidden.bs.modal', () => {
        // Reset input
        document.getElementById('oldPasswordInput').value = '';
        document.getElementById('newPasswordInput').value = '';
      });
    }

  document.getElementById('logoutLink').addEventListener('click', async () => {
    await fetch ('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    localStorage.removeItem('accessToken');
    window.location.href = '../login-form/index.html';
  });


  async function fetchTasks() {
    try {
      const res = await fetchWithAuth('/api/workflow/instances');
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
      const res = await fetchWithAuth('/api/workflow/verification');
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

    const user = document.getElementById('role').textContent;

    if (user != 'super admin') {
      $('#register').hide();
      $('#verifList').prev('h3').hide();
      $('#verifList').hide();
    }

    if (tasks.length === 0) {
      container.innerHTML = `
      <h4>Tugas Admin</h4>
      <div>
        <p>Tidak ada user yang perlu di Verifikasi</p>
      </div>
      `
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
      const res = await fetchWithAuth('/api/auth/staff');
      if (!res.ok) throw new Error('Gagal mengambil data staff');
      const profiles = await res.json();
      // console.log('Data staff:', profiles);
      return profiles;
    } catch (error) {
      console.error('Error fetching staff profiles:', error);
      return [];
    }
  }

  // Fungsi untuk mengambil seluruh data karu dari endpoint baru
  async function fetchKaruProfiles() {
    try {
      const res = await fetchWithAuth('/api/auth/karu');
      if (!res.ok) throw new Error('Gagal mengambil data kepala ruangan');
      const profiles = await res.json();
      // console.log('Data kepala ruangan:', profiles);
      return profiles;
    } catch (error) {
      console.error('Error fetching kepala ruangan profiles:', error);
      return [];
    }
  }

  let staffProfiles = [];
  let karuProfiles = [];

  async function initProfiles() {
    staffProfiles = await fetchStaffProfiles();
    karuProfiles  = await fetchKaruProfiles();
  }
  initProfiles();




  async function displayAssignedTasks(tasks) {
    const container = document.getElementById('tasksList');
    container.innerHTML = '';

    if (!tasks || tasks.length === 0) {
      container.innerHTML = '<p>Tidak ada tugas yang ditugaskan kepada Anda.</p>';
      return;
    }

    // Ambil data staff dan karu untuk autocomplete
    const staffProfiles = await fetchStaffProfiles();
    const karuProfiles = await fetchKaruProfiles();

    tasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'col-md-4 task-item';

      // Tentukan tombol aksi
      let buttonsHTML = '';
      if (task.next_step_if_approved === null && task.next_step_if_rejected === null) {
        buttonsHTML = `<button class="btn btn-warning btn-sm" onclick="processTask(${task.id}, 'stop', ${task.acted_by}, ${task.initiated_by})">Selesaikan</button>`;
      } else {
        buttonsHTML = `<button class="btn btn-success btn-sm" onclick="processTask(${task.id}, 'approve', ${task.acted_by}, ${task.initiated_by})">Setuju</button>`;
        if (task.next_step_if_rejected !== null) {
          buttonsHTML += `<button class="btn btn-danger btn-sm ml-1" onclick="processTask(${task.id}, 'reject', ${task.acted_by}, ${task.initiated_by})">Tolak</button>`;
        }
        if (task.no_need_next_step) {
          buttonsHTML += `<button class="btn btn-warning btn-sm ml-1" onclick="processTask(${task.id}, 'stop', ${task.acted_by}, ${task.initiated_by})">Selesaikan</button>`;
        }
      }

      // Link download file jika ada
      const fileDownloadHTML = task.file_path && task.last_step_id
        ? `<a href="/api/workflow/instance-steps/${task.last_step_id}/file" target="_blank" class="btn btn-info btn-sm">Download File</a>`
        : '';

      // Tentukan step_order berikutnya
      const nextStepOrder = task.step_order + 1;

      // Fetch step berikutnya untuk mengetahui role
      fetchWithAuth(`/api/workflow/steps/${task.workflow_id}/${nextStepOrder}`)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(nextStep => {
          const toRole = nextStep.to_role;
          let dropdownHTML = '';

          if (toRole === 'Staff') {
            dropdownHTML = `
              <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
              <div class="autocomplete-container" style="position: relative;">
                <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari staff..." data-role="staff" data-task-id="${task.id}" autocomplete="off">
                <div class="autocomplete-results" id="results-${task.id}" style="position: absolute; z-index: 1000; background: white; width: 100%; border: 1px solid #ccc;"></div>
              </div>
            `;
          } else if (toRole === 'Kepala Ruangan') {
            dropdownHTML = `
              <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
              <div class="autocomplete-container" style="position: relative;">
                <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari kepala ruangan..." data-role="karu" data-task-id="${task.id}" autocomplete="off">
                <div class="autocomplete-results" id="results-${task.id}" style="position: absolute; z-index: 1000; background: white; width: 100%; border: 1px solid #ccc;"></div>
              </div>
            `;
          }

          // Render elemen card
          taskEl.innerHTML = `
            <div class="card mb-3" style="color: #767676">
              <div class="card-body">
                <h5 class="card-title">${task.title} (${task.code})</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small>Status: ${task.status}</small></p>
                <p class="card-text"><small>Langkah: ${task.current_step_order}</small></p>
                <p class="card-text"><small>Aksi: ${task.action_description || '-'} </small></p>
                <form id="task-form-${task.id}" class="mb-2" enctype="multipart/form-data">
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

          container.appendChild(taskEl);

          const fileInput = taskEl.querySelector(`#fileInput-${task.id}`);
          fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // daftar MIME type yang diizinkan
            const allowedTypes = [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (!allowedTypes.includes(file.type)) {
              alert('Tipe file tidak diizinkan. Hanya PDF, DOC, DOCX, XLS, XLSX yang diperbolehkan.');
              e.target.value = '';  // reset input
              return;
            }

            // batas maksimal 5MB
            const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
            if (file.size > maxSize) {
              alert('Ukuran file terlalu besar. Maksimum 5 MB.');
              e.target.value = '';  // reset input
              return;
            }
          });

          // Inisialisasi autocomplete setelah rendering
          const inputEl = taskEl.querySelector('.staff-search');
          const resultsBox = taskEl.querySelector('.autocomplete-results');

          inputEl.addEventListener('input', () => {
            const query = inputEl.value.toLowerCase();
            const role = inputEl.dataset.role;
            const list = role === 'staff' ? staffProfiles : karuProfiles;
            const filtered = list.filter(u => u.nama_lengkap.toLowerCase().includes(query)).slice(0, 5);

            resultsBox.innerHTML = '';
            if (!query || filtered.length === 0) return;

            filtered.forEach(u => {
              const div = document.createElement('div');
              div.className = 'autocomplete-item';
              div.style.padding = '6px 12px';
              div.style.cursor = 'pointer';
              div.textContent = u.nama_lengkap;
              div.addEventListener('click', () => {
                inputEl.value = u.nama_lengkap;
                resultsBox.innerHTML = '';
              });
              resultsBox.appendChild(div);
            });
          });

          document.addEventListener('click', e => {
            if (!inputEl.contains(e.target) && !resultsBox.contains(e.target)) {
              resultsBox.innerHTML = '';
            }
          });

        })
        .catch(() => {
          // Jika tidak ada next step, render tanpa dropdown
          taskEl.innerHTML = `<div class="card mb-3" style="color: #767676"><div class="card-body">` +
            `<h5 class="card-title">${task.title} (${task.code})</h5>` +
            `<p class="card-text">${task.description}</p>` +
            `<p class="card-text"><small>Status: ${task.status}</small></p>` +
            `<p class="card-text"><small>Langkah: ${task.current_step_order}</small></p>` +
            `<p class="card-text"><small>Aksi: ${task.action_description || '-'} </small></p>` +
            `<form id="task-form-${task.id}" class="mb-2" enctype="multipart/form-data">` +
            `<input type="hidden" name="instanceId" value="${task.id}">` +
            `<label for="fileInput-${task.id}">Upload file (jika diperlukan):</label>` +
            `<input type="file" name="file" class="form-control" id="fileInput-${task.id}" accept=".pdf,.doc,.docx,.xls,.xlsx">` +
            `</form>` +
            buttonsHTML + fileDownloadHTML +
            `</div></div>`;
          container.appendChild(taskEl);
        });

    });
  }

  


  // Render recent tasks (tugas yang telah dikerjakan user atau rekan dengan role yang sama)
  async function displayRecentTasks(tasks) {
    try {
        const profileRes = await fetchWithAuth('/api/auth/profile');

        if (!profileRes.ok) throw new Error('Gagal mengambil data profil');

        const profile = await profileRes.json();
        const currentUser = profile.username;
        const currentRole = profile.role;

        const tableHead = document.querySelector('#recentTasksTable thead')

        if (['Staff', 'Kepala Ruangan'].includes(currentRole)) {
          tableHead.innerHTML = `
            <tr>
            <th>No</th>
            <th>Kode</th>
            <th>Judul</th>
            <th>Deskripsi</th>
            <th>Action</th>
            <th>Waktu</th>
            <th>File</th>
            </tr>
          `
          } else {
          tableHead.innerHTML = `
            <tr>
            <th>No</th>
            <th>Kode</th>
            <th>Judul</th>
            <th>Deskripsi</th>
            <th>Action</th>
            <th>User</th>
            <th>Waktu</th>
            <th>File</th>
            </tr>
          `
          }

        const tableBody = document.querySelector('#recentTasksTable tbody');
        tableBody.innerHTML = ''; // Hapus data lama

        if (['Staff', 'Kepala Ruangan'].includes(currentRole)) {
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
        
        else {
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
                  <td>${task.nama_lengkap}</td>
                  <td>${new Date(task.acted_at).toLocaleString()}</td>
                  <td>${fileDownloadHTML}</td>
              `;

              tableBody.appendChild(row);
          });
        }
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        location.reload();
    }
}

  // Fungsi untuk memproses aksi tugas (approve, reject, atau stop) dengan file upload
  window.processTask = async (instanceId, action, userSenderTask, userSenderInitiate) => {
    try {
      const formElement = document.getElementById(`task-form-${instanceId}`);
      const formData = new FormData(formElement);
      const form = document.getElementById(`task-form-${instanceId}`);
      if (!form) {
        console.error(`Form untuk task ${instanceId} tidak ditemukan.`);
        return;
      }


      let assignedName = null;
      const assignedNameInput = form.querySelector('input[name="assigned_user_name"]');
      if(assignedNameInput) {
        assignedName = assignedNameInput?.value?.trim();
      }
      formData.append('action', action);
      formData.append('senderTask', userSenderTask || '');
      formData.append('senderInitiate', userSenderInitiate || '');



      if (assignedNameInput) {
        const arr = (action === 'approve' && form.querySelector('.staff-search'))
          ? staffProfiles.map(u => u.nama_lengkap)
          : karuProfiles.map(u => u.nama_lengkap);

        console.log('isi assigned name : ', assignedName);

        if(!assignedName || assignedName.trim() === '') {}
        else if(!arr.includes(assignedName)) {
          return alert(`"${assignedName}" tidak terdaftar. Mohon pilih user yang tersedia dari daftar.`);
        }
      }
      console.log('usersendertask : ', userSenderTask);
      console.log('usersenderinitiate : ', userSenderInitiate);
      const res = await fetchWithAuth(`/api/workflow/instances/${instanceId}/step`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      alert(result.message);
      fetchTasks();
    } catch (error) {
      console.error('Error processing task:', error);
      alert('Terjadi kesalahan saat memproses tugas.', error);
      location.reload();
    }
  };

  window.processValid = async function(taskId, action) {
    try {
      const res = await fetchWithAuth(`/api/workflow/tasks/${taskId}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: action })
      });

      if (!res.ok) throw new Error('Gagal memproses tugas');
      const result = await res.json();
      // console.log('Tugas berhasil diproses:', result);
      await verifUser();
    } catch (error) {
      console.error('Error processing task:', error);
      location.reload();
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

        fetchWithAuth(`/api/workflow/steps/${template.workflow_id}/1`)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Step berikutnya tidak ditemukan');
            }
          })
          .then(nextStep => {
            const toRole = nextStep.to_role;
            // console.log('role selanjutnya dari inisiasi: ', toRole);

            let dropdownInitiate = '';
            if (toRole === 'Staff') {
              dropdownInitiate = `
                <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
                <div class="autocomplete-container" style="position: relative;">
                  <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari staff..." data-role="staff" data-workflow-id="${template.workflow_id}" autocomplete="off">
                  <div class="autocomplete-results" id="results-${template.workflow_id}" style="position: absolute; z-index: 1000; background: white; width: 100%; border: 1px solid #ccc;"></div>
                </div>
              `;
            }
            else if (toRole === 'Kepala Ruangan') {
            dropdownInitiate = `
              <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
              <div class="autocomplete-container" style="position: relative;">
                <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari kepala ruangan..." data-role="karu" data-workflow-id="${template.workflow_id}" autocomplete="off">
                <div class="autocomplete-results" id="results-${template.workflow_id}" style="position: absolute; z-index: 1000; background: white; width: 100%; border: 1px solid #ccc;"></div>
              </div>
            `;
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

            const fileInput = templateEl.querySelector(`#templateFileInput-${template.workflow_id}`);
            fileInput.addEventListener('change', (e) => {
              const file = e.target.files[0];
              if (!file) return;

              // daftar MIME type yang diizinkan
              const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              ];

              if (!allowedTypes.includes(file.type)) {
                alert('Tipe file tidak diizinkan. Hanya PDF, DOC, DOCX, XLS, XLSX yang diperbolehkan.');
                e.target.value = '';  // reset input
                return;
              }

              // batas maksimal 5MB
              const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
              if (file.size > maxSize) {
                alert('Ukuran file terlalu besar. Maksimum 5 MB.');
                e.target.value = '';  // reset input
                return;
              }
            });

            const input = templateEl.querySelector('.staff-search');
            const resultsBox = templateEl.querySelector('.autocomplete-results');

            input.addEventListener('input', () => {
              const query = input.value.toLowerCase();
              const role = input.dataset.role;
              const sourceList = role === 'staff' ? staffProfiles : karuProfiles;

              const filtered = sourceList
                .filter(item => item.nama_lengkap.toLowerCase().includes(query))
                .slice(0, 5); 

              resultsBox.innerHTML = '';
              if (query.length === 0 || filtered.length === 0) return;

              filtered.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('autocomplete-item');
                div.style.padding = '6px 12px';
                div.style.cursor = 'pointer';
                div.textContent = item.nama_lengkap;

                div.addEventListener('click', () => {
                  input.value = item.nama_lengkap;
                  resultsBox.innerHTML = '';
                });

                resultsBox.appendChild(div);
              });
            });

            document.addEventListener('click', (e) => {
              if (!input.contains(e.target) && !resultsBox.contains(e.target)) {
                resultsBox.innerHTML = '';
              }
            });



            // Attach click handler
            const btn = document.getElementById(`start-btn-${template.workflow_id}`);
            btn.addEventListener('click', async () => {
              try {
                const formElement = document.getElementById(`template-form-${template.workflow_id}`);
                const formData = new FormData(formElement);

                const assignedInput = formElement.querySelector('input[name="assigned_user_name"]');
                formData.set('assigned_user_name', assignedInput?.value || '');
                const res = await fetchWithAuth('/api/workflow/instances', {
                  method: 'POST',
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
                location.reload();
              }

              
          });
        })
      });
    }
  
  // Fungsi untuk mengambil template workflow
  async function fetchAvailableTemplates() {
    try {
      const res = await fetchWithAuth('/api/workflow/templates');
      if (!res.ok) throw new Error('Gagal mengambil template workflow');
      const templates = await res.json();
      displayAvailableTemplates(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      location.reload();
    }
  }

  // Panggil fungsi untuk mengambil data tugas dan template
  fetchTasks();
  verifUser();
  fetchAvailableTemplates();
});
