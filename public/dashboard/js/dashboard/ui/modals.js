// import * as bootstrap from 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.esm.min.js';

export function setupModals() {
  const modalUserEl = document.getElementById('modalResetUser');
  const userModal = new bootstrap.Modal(modalUserEl);
  document.getElementById('btnOpenResetUserModal').addEventListener('click', () => userModal.show());
  document.getElementById('cancelResetUserBtn').addEventListener('click', () => userModal.hide());
  modalUserEl.addEventListener('hidden.bs.modal', () => {
    document.getElementById('oldPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
  });

  const modalAdminEl = document.getElementById('modalResetAdmin');
  if (modalAdminEl) {
    const adminModal = new bootstrap.Modal(modalAdminEl);
    document.getElementById('btnOpenResetAdminModal').addEventListener('click', () => adminModal.show());
    document.getElementById('cancelResetAdminBtn').addEventListener('click', () => adminModal.hide());
    modalAdminEl.addEventListener('hidden.bs.modal', () => {
      document.getElementById('targetUsernameInput').value = '';
      document.getElementById('adminNewPasswordInput').value = '';
    });
  }
}