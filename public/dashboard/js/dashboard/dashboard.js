import {
  requireAuth,
  logout
} from '../auth.js';
import {
  fetchProfile,
  renderProfileHeader,
  initSwitchButton,
  initRoleBasedUI,
  initTelegram
} from './profile.js';
import './ui/dropdown.js';
import './ui/modals.js';
import {
  fetchTasks,
  verifUser
} from './tasks/fetchTask.js';
import './tasks/displayInitiated.js';
import './tasks/displayAssigned.js';
import './tasks/displayRecent.js';
import './tasks/displayVerification.js';
import './templates.js';
import {
  fetchAvailableTemplates
} from './templates.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('accessToken');
  // console.log('berikut token yang tersimpan di dashboard.js : ', token);
  if (!token) {
    alert('anda belum login, silahkan login terlebih dahulu !');
    window.location.href = '../../login-form/index.html';
    return;
  }
  requireAuth();
  const profile = await fetchProfile();
  renderProfileHeader(profile);
  initTelegram();
  initSwitchButton();
  initRoleBasedUI();

  // Init global listeners
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', logout);
  }

  // Panggil task & template workflows
  fetchTasks();
  verifUser();
  fetchAvailableTemplates();
});
