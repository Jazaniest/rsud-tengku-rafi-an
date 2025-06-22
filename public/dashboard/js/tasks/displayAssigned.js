// import { fetchWithAuth } from '../auth.js';
import { validateFileInput } from '../ui/fileValidation.js';
import { fetchTasks } from './fetchTask.js';
// import {}


let staffProfiles = [];
let karuProfiles = [];

export async function displayAssignedTasks(tasks) {
  const container = document.getElementById('tasksList');
  container.innerHTML = '';
  if (!tasks || tasks.length === 0) {
    container.innerHTML = '<p>Tidak ada tugas yang ditugaskan kepada Anda.</p>';
    return;
  }

  // Ambil data staff dan karu untuk autocomplete
  staffProfiles = await fetchWithAuth('/api/auth/staff')
    .then(res => res.ok ? res.json() : []);
  karuProfiles = await fetchWithAuth('/api/auth/karu')
    .then(res => res.ok ? res.json() : []);

  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = 'col-md-4 task-item';

    // Tombol aksi
    let buttonsHTML = '';
    if (task.next_step_if_approved === null && task.next_step_if_rejected === null) {
      buttonsHTML = `<button class="btn btn-warning btn-sm" onclick="processTask(${task.id}, 'stop', ${task.acted_by}, ${task.initiated_by})">Selesaikan</button>`;
    } else {
      buttonsHTML = `<button class="btn btn-success btn-sm" onclick="processTask(${task.id}, 'approve', ${task.acted_by}, ${task.initiated_by})">Setuju</button>`;
      if (task.next_step_if_rejected !== null) {
        buttonsHTML += `<button class="btn btn-danger btn-sm ml-1" onclick="processTask(${task.id}, 'reject', ${task.acted_by}, ${task.initiated_by})">Tolak</button>`;
      }
      if (task.no_need_next_step) {
        buttonsHTML += `<button class="btn btn-warning btn-sm ml-1" onclick="processTask(${task.id}, 'stop', ${task.acted_by}, ${task.initiated_by})">Selesaikan</button>`;
      }
    }

    // Link download
    const fileDownloadHTML = task.file_path && task.last_step_id
      ? `<a href="/api/workflow/instance-steps/${task.last_step_id}/file" target="_blank" class="btn btn-info btn-sm">Download File</a>`
      : '';

    // Cari role selanjutnya
    const nextStepOrder = task.step_order + 1;
    fetchWithAuth(`/api/workflow/steps/${task.workflow_id}/${nextStepOrder}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(nextStep => {
        const toRole = nextStep.to_role;
        let dropdownHTML = '';
        if (toRole === 'Staff') {
          dropdownHTML = `
            <p class="card-text"><small>Kirim ke</small></p>
            <div class="autocomplete-container" style="position: relative;">
              <input type="text" class="form-control staff-search" placeholder="Cari staff..." data-role="staff" data-task-id="${task.id}" autocomplete="off">
              <div class="autocomplete-results" id="results-${task.id}"></div>
            </div>`;
        } else if (toRole === 'Kepala Ruangan') {
          dropdownHTML = `
            <p class="card-text"><small>Kirim ke</small></p>
            <div class="autocomplete-container" style="position: relative;">
              <input type="text" class="form-control staff-search" placeholder="Cari kepala ruangan..." data-role="karu" data-task-id="${task.id}" autocomplete="off">
              <div class="autocomplete-results" id="results-${task.id}"></div>
            </div>`;
        }

        taskEl.innerHTML = `
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">${task.title} (${task.code})</h5>
              <p class="card-text">${task.description}</p>
              <p class="card-text"><small>Status: ${task.status}</small></p>
              <p class="card-text"><small>Langkah: ${task.current_step_order}</small></p>
              <form id="task-form-${task.id}" enctype="multipart/form-data">
                <input type="hidden" name="instanceId" value="${task.id}">
                ${dropdownHTML}
                <label for="fileInput-${task.id}">Upload file:</label>
                <input class="form-control" type="file" id="fileInput-${task.id}" accept=".pdf,.doc,.docx,.xls,.xlsx">
              </form>
              ${buttonsHTML}
              ${fileDownloadHTML}
            </div>
          </div>`;
        container.appendChild(taskEl);

        const baseHTML = `
          <div class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">${task.title} (${task.code})</h5>
              <p class="card-text">${task.description}</p>
              <p class="card-text"><small>Status: ${task.status}</small></p>
              <p class="card-text"><small>Langkah: ${task.current_step_order}</small></p>
              <form class="mb-2" id="task-form-${task.id}" enctype="multipart/form-data">
                <input type="hidden" name="instanceId" value="${task.id}">
                <label for="fileInput-${task.id}">Upload file:</label>
                <input class="form-control" type="file" id="fileInput-${task.id}" accept=".pdf,.doc,.docx,.xls,.xlsx">
              </form>
              ${buttonsHTML}
              ${fileDownloadHTML}
            </div>
          </div>
        `;

        taskEl.innerHTML = baseHTML.replace(
          '</form>',
          `${dropdownHTML}</form>`
        );

        // Validasi file
        const fileInput = taskEl.querySelector(`#fileInput-${task.id}`);
        validateFileInput(fileInput);

        // Autocomplete
        const inputEl = taskEl.querySelector('.staff-search');
        const resultsBox = taskEl.querySelector('.autocomplete-results');
        inputEl.addEventListener('input', () => {
          const query = inputEl.value.toLowerCase();
          const list = inputEl.dataset.role === 'staff' ? staffProfiles : karuProfiles;
          const filtered = list.filter(u => u.nama_lengkap.toLowerCase().includes(query)).slice(0,5);
          resultsBox.innerHTML = '';
          filtered.forEach(u => {
            const div = document.createElement('div');
            div.textContent = u.nama_lengkap;
            div.className = 'autocomplete-item';
            div.addEventListener('click', () => {
              inputEl.value = u.nama_lengkap;
              resultsBox.innerHTML = '';
            });
            resultsBox.appendChild(div);
          });
        });
        document.addEventListener('click', e => {
          if (!inputEl.contains(e.target) && !resultsBox.contains(e.target)) {
            resultsBox.innerHTML = '';
          }
        });
      })
      .catch(() => {
        // Jika step berikutnya tidak ada
        taskEl.innerHTML = baseHTML;
      });
  });

  window.processTask = async (instanceId, action, userSenderTask, userSenderInitiate) => {
    try {
      const formElement = document.getElementById(`task-form-${instanceId}`);
      const formData = new FormData(formElement);
      const form = document.getElementById(`task-form-${instanceId}`);
      if (!form) {
        console.error(`Form untuk task ${instanceId} tidak ditemukan.`);
        return;
      }


      let assignedName = null;
      const assignedNameInput = form.querySelector('input[name="assigned_user_name"]');
      if(assignedNameInput) {
        assignedName = assignedNameInput?.value?.trim();
      }
      formData.append('action', action);
      formData.append('senderTask', userSenderTask || '');
      formData.append('senderInitiate', userSenderInitiate || '');



      if (assignedNameInput) {
        const arr = (action === 'approve' && form.querySelector('.staff-search'))
          ? staffProfiles.map(u => u.nama_lengkap)
          : karuProfiles.map(u => u.nama_lengkap);

        console.log('isi assigned name : ', assignedName);

        if(!assignedName || assignedName.trim() === '') {}
        else if(!arr.includes(assignedName)) {
          return alert(`"${assignedName}" tidak terdaftar. Mohon pilih user yang tersedia dari daftar.`);
        }
      }
      console.log('usersendertask : ', userSenderTask);
      console.log('usersenderinitiate : ', userSenderInitiate);
      const res = await fetchWithAuth(`/api/workflow/instances/${instanceId}/step`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      alert(result.message);
      fetchTasks();
    } catch (error) {
      console.error('Error processing task:', error);
      alert('Terjadi kesalahan saat memproses tugas.', error);
      location.reload();
    }
  };
}
