// auth.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = '../dashboard/index.html';
    } else {
      alert('Login gagal, periksa username/password Anda.');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Terjadi kesalahan saat login.');
  }
});
