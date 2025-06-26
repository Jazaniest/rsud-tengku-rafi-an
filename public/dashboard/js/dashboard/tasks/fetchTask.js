// import { fetchWithAuth } from '../auth.js';
import { displayInitiatedTasks } from './displayInitiated.js';
import { displayAssignedTasks } from './displayAssigned.js';
import { displayRecentTasks } from './displayRecent.js';
import { displayVerificationUser } from './displayVerification.js';

export async function fetchTasks() {
  try {
    const res = await fetchWithAuth('/api/workflow/instances');
    if (!res.ok) throw new Error('Gagal mengambil tugas');
    const data = await res.json();
    displayInitiatedTasks(data.initiatedTasks);
    displayAssignedTasks(data.assignedTasks);
    displayRecentTasks(data.recentTasks);
  } catch (e) {
    console.error(e);
  }
}

export async function verifUser() {
  try {
    const res = await fetchWithAuth('/api/workflow/verification');
    if (!res.ok) throw new Error('Gagal memuat data verifikasi');
    const data = await res.json();
    displayVerificationUser(data.assignedRows);
  } catch (e) {
    console.error(e);
  }
}