export function validateFileInput(inputEl) {
  inputEl.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowed.includes(file.type)) {
      alert('Tipe file tidak diizinkan. Hanya PDF, DOC, DOCX, XLS, XLSX yang diperbolehkan.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimum 5 MB.');
      e.target.value = '';
    }
  });
}