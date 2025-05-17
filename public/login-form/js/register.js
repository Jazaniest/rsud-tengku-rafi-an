// FUNGSI DI NONAKTIFKAN 
//     document.addEventListener('DOMContentLoaded', async () => {
//         // Periksa token; jika tidak ada, arahkan ke halaman login.
//         const roleFieldWrapper = document.getElementById('roleFieldWrapper');
//         const registerForm = document.getElementById('registerForm');

//         // Tambahkan input hidden role=STAFF secara default
//         const hiddenRoleInput = document.createElement('input');
//         hiddenRoleInput.type = 'hidden';
//         hiddenRoleInput.name = 'role';
//         hiddenRoleInput.value = 'STAFF';
//         hiddenRoleInput.id = 'hiddenRoleInput';
//         registerForm.appendChild(hiddenRoleInput);

//         try {
//             const token = localStorage.getItem('token');
//             if (!token) throw new Error('Tidak ada token');

//             const profileRes = await fetch('/api/auth/profile', {
//                 headers: { 'Authorization': 'Bearer ' + token }
//             });

//             if (!profileRes.ok) throw new Error('Fetch profil gagal');

//             const profile = await profileRes.json();

//             if (profile.role === 'super admin') {
//                 // Tampilkan dropdown role
//                 roleFieldWrapper.style.display = 'block';
//                 // Hapus input hidden role=STAFF
//                 hiddenRoleInput.remove();
//             }
//         } catch (error) {
//             // Tidak lakukan apa-apa, biarkan role tetap diset sebagai STAFF
//             console.log('Mode publik atau non-superadmin:', error.message);
//         }


//         // Validasi kecocokan password
//         const passwordInput = document.getElementById("password");
//         const confirmPasswordInput = document.getElementById("confirmPassword");
//         const passwordMatchMessage = document.getElementById("passwordMatchMessage");

//         function validatePasswordMatch() {
//             if (confirmPasswordInput.value === "") {
//                 passwordMatchMessage.textContent = "";
//             } else if (passwordInput.value === confirmPasswordInput.value) {
//                 passwordMatchMessage.textContent = "Password sesuai ✔️";
//                 passwordMatchMessage.classList.remove("text-danger");
//                 passwordMatchMessage.classList.add("text-success");
//             } else {
//                 passwordMatchMessage.textContent = "Password tidak sesuai ❌";
//                 passwordMatchMessage.classList.remove("text-success");
//                 passwordMatchMessage.classList.add("text-danger");
//             }
//         }

//         passwordInput.addEventListener("keyup", validatePasswordMatch);
//         confirmPasswordInput.addEventListener("keyup", validatePasswordMatch);
//     });

//     $(document).ready(function () {
//     $('#registerForm').submit(function (e) {
//         console.log("form submit intercepted");
//         e.preventDefault();

//         // Tentukan nilai role tergantung elemen mana yang tersedia
//         let roleValue = $('#inputRole').length ? $('#inputRole').val() : $('#hiddenRoleInput').val();

//         // Validasi jika dropdown tampil dan user belum pilih apa-apa
//         if ($('#inputRole').length && !roleValue) {
//             alert('Silakan pilih role terlebih dahulu.');
//             return;
//         }

//         // Kumpulkan data dari form
//         let formData = {
//             username: $('#username').val(),
//             password: $('#password').val(),
//             namaLengkap: $('#namaLengkap').val(),
//             role: roleValue
//         };

//         console.log('Data dikirim:', formData);

//         // Kirim data ke endpoint register
//         $.ajax({
//             url: '/api/auth/register',
//             method: 'POST',
//             data: JSON.stringify(formData),
//             contentType: 'application/json',
//             success: function (response) {
//                 alert('Registrasi berhasil');
//                 window.location.href = 'index.html';
//             },
//             error: function (xhr, status, error) {
//                 let errorMsg = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : 'Registrasi gagal';
//                 alert('Registrasi gagal: ' + errorMsg);
//             }
//         });
//     });
// });