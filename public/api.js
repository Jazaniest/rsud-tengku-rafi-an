window.fetchWithAuth = async (url, options = {}) => {
  const makeRequest = async () => {
    const token = localStorage.getItem('accessToken');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
    options.credentials = 'include';
    return await fetch(url, options);
  };

  let response = await makeRequest();

  if (response.status === 401) {
    let payload;
    try {
      payload = await response.json();
    } catch (_) { /* gagal parse */ }

    if (payload && payload.expired) {
      const refreshRes = await fetch('/api/auth/token', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const { accessToken: newToken } = await refreshRes.json();
        localStorage.setItem('accessToken', newToken);
        response = await makeRequest();
        location.reload();
        console.log('berhasil retoken dan reload')
      } else {
        alert('sesi telah berakhir, silahkan login ulang!');
        window.location.href = '/index.html';
        return;
      }
    } else {
      alert('sesi telah berakhir, silahkan login ulang!');
      window.location.href = '/index.html';
      return;
    }
  }

  return response;
};
