export function getToken() {
  return localStorage.getItem('accessToken');
}

export function requireAuth() {
  const token = getToken();
  if (!token) {
    alert('anda tidak dapat melakukan aksi ini !');
    window.location.href = '../../login-form/index.html';
    throw new Error('No token');
  }
}

// export async function fetchWithAuth(url, options = {}) {
//   const token = getToken();
//   const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
//   const res = await fetch(url, { ...options, headers, credentials: 'include' });
//   return res;
// }

export function logout() {
  fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    .finally(() => {
      localStorage.removeItem('accessToken');
      window.location.href = '../index.html';
    });
}