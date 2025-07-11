// Mengambil token dari localStorage
const token = localStorage.getItem('accessToken'); // 'token' adalah nama key tempat Anda menyimpan JWT
let currentUserId = null; // Menyimpan ID pengguna yang sedang diedit

// Fungsi untuk mengambil data pengguna dari API
const fetchUsers = async () => {
    if (!token) {
        console.log('Token is missing or invalid');
        // Redirect ke halaman login jika token tidak ada
        window.location.href = '/login'; // Ganti dengan URL login sesuai aplikasi Anda
        return; // Keluar dari fungsi jika token tidak ada
    }

    try {
        const profileRes = await fetchWithAuth('/api/auth/profile');
        if (!profileRes.ok) throw new Error('Gagal mengambil data profil');
        const profile = await profileRes.json();

        const role = profile.role;
        
        // Tambahkan logika navigasi berdasarkan role
        const logbookContainer = document.getElementById('logbook');
        if (role != 'super admin') {
            console.log('user tidak sesuai !');
            window.location.href = '/dashboard/808.html';
        } else {
            console.log('role sesuai !')
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
    }

    try {
        const response = await fetchWithAuth('/api/users', {
            method: 'GET'
        });
        const data = await response.json();

        const tableBody = document.getElementById('userTableBody');
        tableBody.innerHTML = ''; // Reset tabel sebelum menambah data baru

        data.forEach((user, index) => {
            const row = document.createElement('tr');

            const getSafeValue = (value) => value === null || value === '' ? '-' : value;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${getSafeValue(user.username)}</td>
                <td>${getSafeValue(user.nama_lengkap)}</td>
                <td>${getSafeValue(user.role)}</td>
                <td>${getSafeValue(user.tempat_tanggal_lahir)}
                <td>${getSafeValue(user.alamat)}</td>
                <td>${getSafeValue(user.nik)}</td>
                <td>${getSafeValue(user.nip)}</td>
                <td>${getSafeValue(user.pangkat)}</td>
                <td>${getSafeValue(user.ruang)}</td>
                <td>${getSafeValue(user.level_pk)}</td>
                <td>${getSafeValue(user.pendidikan)}</td>
                <td>${getSafeValue(user.no_str)}</td>
                <td>${getSafeValue(user.akhir_str)}</td>
                <td>${
                    user.file_str && user.file_str.trim() !== ''
                        ? `<a href="${user.file_str}" target="_blank" class="file-btn">Lihat File</a>`
                        : '-'
                }</td>
                <td>${getSafeValue(user.no_sipp)}</td>
                <td>${getSafeValue(user.akhir_sipp)}</td>
                <td>${
                    user.file_sipp && user.file_sipp.trim() !== ''
                        ? `<a href="${user.file_sipp}" target="_blank" class="file-btn">Lihat File</a>`
                        : '-'
                }</td>
                <td>${getSafeValue(user.jenis_ketenagaan)}</td>
                <td>
                    <button class="edit-btn" onclick="editUser(${user.id})">Edit</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Fungsi pencarian
        document.getElementById('searchInput').addEventListener('input', () => {
            const searchQuery = document.getElementById('searchInput').value.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');
            
            // Looping untuk menyembunyikan atau menampilkan baris
            Array.from(rows).forEach(row => {
                const cells = row.getElementsByTagName('td');
                const username = cells[1]?.textContent.toLowerCase(); // Username
                const nama = cells[2]?.textContent.toLowerCase(); // Nama Lengkap
                
                if (username.includes(searchQuery) || nama.includes(searchQuery)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

// Fungsi untuk membuka modal dan mengisi form dengan data pengguna
const editUser = (id) => {
    currentUserId = id;
    fetchWithAuth(`/api/users/${id}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(user => {
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editNamaLengkap').value = user.nama_lengkap;
        document.getElementById('editTtl').value = user.tempat_tanggal_lahir;
        document.getElementById('editAlamat').value = user.alamat;
        document.getElementById('editNik').value = user.nik;
        document.getElementById('editNip').value = user.nip;
        document.getElementById('editPangkat').value = user.pangkat;
        document.getElementById('editRuang').value = user.ruang;
        document.getElementById('editLevelPk').value = user.level_pk;
        document.getElementById('editPendidikan').value = user.pendidikan;
        document.getElementById('editNoStr').value = user.no_str;
        document.getElementById('editNoSipp').value = user.no_sipp;
        document.getElementById('editJenisKetenagaan').value = user.jenis_ketenagaan;

        document.getElementById('editModal').style.display = "block"; // Menampilkan modal
    })
    .catch(error => console.error('Error fetching user data:', error));
};

// Fungsi untuk menutup modal
const closeModal = () => {
    document.getElementById('editModal').style.display = "none";
};

// Fungsi untuk menyimpan perubahan
document.getElementById('editForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log("Form Submitted");

    const updatedData = {
        username: document.getElementById('editUsername').value,
        nama_lengkap: document.getElementById('editNamaLengkap').value,
        tempat_tanggal_lahir: document.getElementById('editTtl').value,
        alamat: document.getElementById('editAlamat').value,
        nik: document.getElementById('editNik').value,
        nip: document.getElementById('editNip').value,
        pangkat: document.getElementById('editPangkat').value,
        ruang: document.getElementById('editRuang').value,
        level_pk: document.getElementById('editLevelPk').value,
        pendidikan: document.getElementById('editPendidikan').value,
        no_str: document.getElementById('editNoStr').value,
        no_sipp: document.getElementById('editNoSipp').value,
        jenis_ketenagaan: document.getElementById('editJenisKetenagaan').value,
    };

    try {
        const response = await fetchWithAuth(`/api/users/${currentUserId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData),
        });

        const result = await response.json();
        alert(result.message); // Menampilkan pesan dari server
        fetchUsers(); // Muat ulang data setelah penghapusan
        closeModal(); // Menutup modal
    } catch (error) {
        console.error('Error updating user:', error);
    }
});

// Memanggil fungsi untuk mengambil data pengguna saat halaman dimuat
window.onload = fetchUsers;

// Menutup modal jika area di luar modal diklik
window.onclick = (event) => {
  if (event.target === document.getElementById('editModal')) {
        closeModal();
  }
}
