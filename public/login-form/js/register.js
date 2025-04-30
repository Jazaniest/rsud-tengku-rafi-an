    document.addEventListener('DOMContentLoaded', async () => {
        // Periksa token; jika tidak ada, arahkan ke halaman login.
        // const token = localStorage.getItem('token');
        // if (!token) {
        //     alert('Anda harus login terlebih dahulu.');
        //     window.location.href = '/public/login-form/login.html';
        //     return;
        // }
        
        // try {
        //     const profileRes = await fetch('http://localhost:3000/api/auth/profile', {
        //         headers: { 'Authorization': 'Bearer ' + token }
        //     });

        //     if (!profileRes.ok) throw new Error('Gagal mengambil data profil');
        //     const profile = await profileRes.json();

        //     const roleUser = profile.role;

        //     // Hanya super admin yang diizinkan mengakses halaman register ini
        //     if (roleUser !== 'super admin') {
        //         alert('Anda tidak memiliki akses untuk fitur ini!');
        //         window.location.href = '/public/dashboard/index.html';
        //         return;
        //     }
        // } catch (error) {
        //     console.error('Error fetching profile:', error);
        //     alert(error.message);
        //     return;
        // }

        // Validasi kecocokan password
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");
        const passwordMatchMessage = document.getElementById("passwordMatchMessage");

        function validatePasswordMatch() {
            if (confirmPasswordInput.value === "") {
                passwordMatchMessage.textContent = "";
            } else if (passwordInput.value === confirmPasswordInput.value) {
                passwordMatchMessage.textContent = "Password sesuai ✔️";
                passwordMatchMessage.classList.remove("text-danger");
                passwordMatchMessage.classList.add("text-success");
            } else {
                passwordMatchMessage.textContent = "Password tidak sesuai ❌";
                passwordMatchMessage.classList.remove("text-success");
                passwordMatchMessage.classList.add("text-danger");
            }
        }

        passwordInput.addEventListener("keyup", validatePasswordMatch);
        confirmPasswordInput.addEventListener("keyup", validatePasswordMatch);
    });

    $(document).ready(function () {
        $('#registerForm').submit(function (e) {
            e.preventDefault();

            // Kumpulkan data dari form
            let formData = {
                username: $('#username').val(),
                password: $('#password').val(),
                namaLengkap: $('#namaLengkap').val()
                // role: $('#inputRole').val(),
                // tempat_tanggal_lahir: $('#tempat_tanggal_lahir').val(),
                // alamat: $('#alamat').val(),
                // nik: $('#nik').val(),
                // nip: $('#nip').val(),
                // pangkat: $('#pangkat').val(),
                // ruang: $('#ruang').val(),
                // level_pk: $('#level_pk').val(),
                // unit_kerja: $('#unit_kerja').val(),
                // pendidikan: $('#pendidikan').val(),
                // no_str: $('#no_str').val(),
                // no_sipp: $('#no_sipp').val(),
                // kredensial: $('#kredensial').val(),
                // jenis_ketenagaan: $('#jenis_ketenagaan').val()
            };
            console.log(formData);

            // Kirim data ke endpoint register
            $.ajax({
                url: 'http://localhost:3000/api/auth/register',
                method: 'POST',
                data: JSON.stringify(formData),
                contentType: 'application/json',
                success: function (response) {
                    alert('Registrasi berhasil');
                    window.location.href = 'index.html';
                },
                error: function (xhr, status, error) {
                    let errorMsg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Registrasi gagal';
                    alert('Registrasi gagal: ' + errorMsg);
                }
            });
        });
    });
