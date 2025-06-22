// import { fetchWithAuth } from '../auth.js';

export async function displayRecentTasks(tasks) {
  try {
    const res = await fetchWithAuth('/api/auth/profile');
    if (!res.ok) throw new Error('Gagal mengambil data profil');
    const { role: currentRole } = await res.json();

    const thead = document.querySelector('#recentTasksTable thead');
    if (['Staff','Kepala Ruangan'].includes(currentRole)) {
      thead.innerHTML = `
        <tr>
          <th>No</th><th>Kode</th><th>Judul</th><th>Deskripsi</th>
          <th>Action</th><th>Waktu</th><th>File</th>
        </tr>`;
    } else {
      thead.innerHTML = `
        <tr>
          <th>No</th><th>Kode</th><th>Judul</th><th>Deskripsi</th>
          <th>Action</th><th>User</th><th>Waktu</th><th>File</th>
        </tr>`;
    }

    const tbody = document.querySelector('#recentTasksTable tbody');
    tbody.innerHTML = '';

    tasks.forEach((task, i) => {
      const fileCell = task.file_path
        ? `<a href="/api/workflow/instance-steps/${task.step_id}/file" target="_blank">Download</a>`
        : 'No File';

      const row = document.createElement('tr');
      if (['Staff','Kepala Ruangan'].includes(currentRole)) {
        row.innerHTML = `
          <td>${i+1}</td><td>${task.code}</td><td>${task.title}</td>
          <td>${task.description}</td><td>${task.action_taken}</td>
          <td>${new Date(task.acted_at).toLocaleString()}</td>
          <td>${fileCell}</td>`;
      } else {
        row.innerHTML = `
          <td>${i+1}</td><td>${task.code}</td><td>${task.title}</td>
          <td>${task.description}</td><td>${task.action_taken}</td>
          <td>${task.nama_lengkap}</td>
          <td>${new Date(task.acted_at).toLocaleString()}</td>
          <td>${fileCell}</td>`;
      }
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error(error);
    location.reload();
  }
}
