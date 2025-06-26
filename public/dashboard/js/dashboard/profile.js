// import { fetchWithAuth } from './auth.js';

export async function fetchProfile() {
  const res = await fetchWithAuth('/api/auth/profile');
  if (!res.ok) throw new Error('Gagal mengambil data profil');
  return res.json();
}

export function renderProfileHeader(profile) {
  document.getElementById('username').textContent = profile.username;
  document.getElementById('role').textContent = profile.role;
}

export function initRoleBasedUI(profile) {
    const container = document.getElementById('logbook');
    const profileRole = document.getElementById('role').textContent;

    const profileButtonMobile = `<li class="nav-item profile-mobile"><a class="nav-link" href="profile/profile.html">My profile</a></li>`;
    const logbookButtonMobile = `<li class="nav-item profile-mobile"><a class="nav-link" href="logbook.html">Logbook</a></li>`;
    const dataButtonMobile = `<li class="nav-item profile-mobile"><a class="nav-link" href="user.html">Data user</a></li>`;
    const registerButtonMobile = `<li class="nav-item profile-mobile"><a class="nav-link" href="../login-form/register.html">Register user</a></li>`;
    const resetAdminMobile = `<li class="nav-item profile-mobile"><a class="nav-link" id="btnOpenResetAdminModal" data-bs-toggle="modal" data-bs-target="#modalResetAdmin">Reset Password User</a></li>`;
    const resetButtonMobile = `<li class="nav-item profile-mobile"><a class="nav-link" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">Ganti Password</a></li>`;
    const logoutButtonMobile = `
      <li class="nav-item profile-mobile">
        <a class="nav-link" href="../login-form/index.html" id="logoutLink">Logout</a>
      </li>
    `;
    const profileButtonDesktop = `
      <button class="value" id="profile-button">
        <i class="bi bi-person" style="color: #626c77;"></i>
        My profile
      </button>
    `;
    const logbookButtonDesktop = `
      <button class="value" id="logbook-button">
        <i class="bi bi-book" style="color: #626c77;"></i>
        Logbook
      </button>
    `;
    const dataButtonDesktop = `
      <button class="value" id="user-data-button">
        <i class="bi bi-card-list" style="color: #626c77;"></i>
        Data user
      </button>
    `;
    const registerButtonDesktop = `
      <button class="value" id="register-button">
        <i class="bi bi-plus-circle" style="color: #626c77;"></i>
        Register user
      </button> 
    `;
    const resetAdminDesktop = `
      <button class="value" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetAdmin">
        <i class="bi bi-key" style="color: #626c77;"></i>
        Reset Password User
      </button> 
    `;
    const resetButtonDesktop = `
      <button class="value" id="btnOpenResetUserModal" data-bs-toggle="modal" data-bs-target="#modalResetUser">
        <i class="bi bi-key" style="color: #626c77;"></i>
        Ganti Password
      </button>
    `;
    const buttonDesktopMode = `
      <button id="profileBtn" class="btn p-0 border-0 bg-transparent">
        <img src="img/profile-icon.png" alt="profile" style="width: 180%; height:180%">
      </button>
    `;
    const logoutButtonDesktop = `
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
    `;


    if (profileRole === 'Staff') {
        container.innerHTML = `
        ${profileButtonMobile}${logbookButtonMobile}${resetButtonMobile}
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          ${buttonDesktopMode}
          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              ${profileButtonDesktop}${logbookButtonDesktop}${resetButtonDesktop}
            </div>
          </div>
        </li>
        ${logoutButtonDesktop}${logoutButtonMobile}
        `;
    } 
    else if (profileRole === 'super admin') {
        container.innerHTML = `
        ${profileButtonMobile}${dataButtonMobile}${registerButtonMobile}${resetButtonMobile}${resetAdminMobile}
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          ${buttonDesktopMode}
          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              ${profileButtonDesktop}${dataButtonDesktop}${registerButtonDesktop}${resetButtonDesktop}${resetAdminDesktop}
            </div>
          </div>
        </li>
        ${logoutButtonDesktop}${logbookButtonMobile}
        `;
    } 
    else if (profileRole === 'Kepala Ruangan') {
        container.innerHTML = `
        ${profileButtonMobile}${logbookButtonMobile}${resetButtonMobile}
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          ${buttonDesktopMode}
          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              ${profileButtonDesktop}${logbookButtonDesktop}${resetButtonDesktop}
            </div>
          </div>
        </li>
        ${logoutButtonDesktop}${logoutButtonMobile}
        `;
    } 
    else {
        container.innerHTML = `
        ${profileButtonMobile}${resetButtonMobile}
        <li class="nav-item mr-3 profile-desktop" style="position: relative; width:80px; height:80px">
          ${buttonDesktopMode}
          <div class="profile-dropdown" id="profileDropdown">
            <div class="input-profile">
              ${profileButtonDesktop}${resetButtonDesktop}
            </div>
          </div>
        </li>
        ${logoutButtonDesktop}${logoutButtonMobile}
        `;
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
        location.reload();
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
        location.reload();
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
}

export async function initTelegram(profile) {
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

export async function initSwitchButton() {
  try {
    const registerButton = document.getElementById('register');
    const profile = document.getElementById('role').textContent;
    // console.log('isi profile : ', profile);

    if(profile === 'super admin') {
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
    if (!switchButton) return;

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

export async function fetchStaffProfiles() {
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

export async function fetchKaruProfiles() {
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

export async function fetchAllProfiles() {
  try {
    const res = await fetchWithAuth('/api/auth/all');
    if (!res.ok) throw new Error('Gagal mengambil data seluruh staff');
    const profiles = await res.json();
    return profiles;
  }catch (error) {
    console.error('Error fetching all staff profiles:', error);
    return[];
  }
} 
