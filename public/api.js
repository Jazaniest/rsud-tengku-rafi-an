window.fetchWithAuth = async (url, options = {}) => {
  const makeRequest = async () => {
    const token = localStorage.getItem('accessToken');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
    options.credentials = 'include';
    return await fetch(url, options);
  };

  // 1) Coba request pertama
  let response = await makeRequest();

  // 2) Jika 401, baca body untuk lihat apakah memang expired
  if (response.status === 401) {
    let payload;
    try {
      payload = await response.json();
    } catch (_) { /* gagal parse */ }

    // 3) Hanya kalau expired === true kita refresh
    if (payload && payload.expired) {
      // Panggil endpoint refresh token
      const refreshRes = await fetch('/api/auth/token', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const { accessToken: newToken } = await refreshRes.json();
        // simpan token baru
        localStorage.setItem('accessToken', newToken);
        // ulangi request
        response = await makeRequest();
      } else {
        // refresh gagal → redirect ke login
        alert('sesi telah berakhir, silahkan login ulang!');
        window.location.href = '/index.html';
        return;
      }
    } else {
      // Kalau bukan expired (misal invalid token), redirect langsung
      alert('sesi telah berakhir, silahkan login ulang!');
      window.location.href = '/index.html';
      return;
    }
  }

  return response;
};
