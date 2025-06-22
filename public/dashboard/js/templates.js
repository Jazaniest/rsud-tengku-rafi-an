// import { fetchWithAuth } from './auth.js';
import { fetchKaruProfiles, fetchStaffProfiles } from './profile.js';
import { fetchTasks } from './tasks/fetchTask.js';

export async function fetchAvailableTemplates() {
  try {
    const res = await fetchWithAuth('/api/workflow/templates');
    if (!res.ok) throw new Error('Gagal mengambil template workflow');
    const templates = await res.json();
    displayAvailableTemplates(templates);
  } catch (e) {
    console.error(e);
    location.reload();
  }
}

export async function displayAvailableTemplates(templates) {
  const container = document.getElementById('availableTasksList');
      container.innerHTML = '';

      const staffProfiles = await fetchStaffProfiles();
      const karuProfiles = await fetchKaruProfiles();

      if (!templates || templates.length === 0) {
        container.innerHTML = '<p>Tidak ada tugas yang dapat diinisiasi untuk peran Anda.</p>';
        return;
      }

      templates.forEach(template => {

        fetchWithAuth(`/api/workflow/steps/${template.workflow_id}/1`)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Step berikutnya tidak ditemukan');
            }
          })
          .then(nextStep => {
            const toRole = nextStep.to_role;
            // console.log('role selanjutnya dari inisiasi: ', toRole);

            let dropdownInitiate = '';
            if (toRole === 'Staff') {
              dropdownInitiate = `
                <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
                <div class="autocomplete-container" style="position: relative;">
                  <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari staff..." data-role="staff" data-workflow-id="${template.workflow_id}" autocomplete="off">
                  <div class="autocomplete-results" id="results-${template.workflow_id}" style="position: absolute; z-index: 1000; background: white; width: 100%; border: 1px solid #ccc;"></div>
                </div>
              `;
            }
            else if (toRole === 'Kepala Ruangan') {
            dropdownInitiate = `
              <p class="card-text" style="margin-bottom: 0;"><small>Kirim ke</small></p>
              <div class="autocomplete-container" style="position: relative;">
                <input type="text" name="assigned_user_name" class="form-control staff-search" placeholder="Cari kepala ruangan..." data-role="karu" data-workflow-id="${template.workflow_id}" autocomplete="off">
                <div class="autocomplete-results" id="results-${template.workflow_id}" style="position: absolute; z-index: 1000; background: white; width: 100%; border: 1px solid #ccc;"></div>
              </div>
            `;
            }


            const templateEl = document.createElement('div');
            templateEl.className = 'col-md-4 task-item';
            templateEl.innerHTML = `
              <div class="card mb-3" style="color: #767676">
                <div class="card-body">
                  <h5 class="card-title">${template.title} (${template.code})</h5>
                  <p class="card-text">${template.description}</p>
                  <p class="card-text"><small>Aksi: ${template.action_description}</small></p>
                  <form class="mb-2" id="template-form-${template.workflow_id}" enctype="multipart/form-data">
                    <input type="hidden" name="instanceId" value="${template.workflow_id}">
                    ${dropdownInitiate}
                    <input type="hidden" name="workflow_id" value="${template.workflow_id}">
                    <label for="templateFileInput-${template.workflow_id}">Upload file (jika diperlukan):</label>
                    <input type="file" name="file" class="form-control" id="templateFileInput-${template.workflow_id}" accept=".pdf,.doc,.docx,.xls,.xlsx">
                  </form>
                  <button class="btn btn-primary btn-sm" id="start-btn-${template.workflow_id}" type="button">Mulai Tugas</button>
                </div>
              </div>
            `;
            container.appendChild(templateEl);

            const fileInput = templateEl.querySelector(`#templateFileInput-${template.workflow_id}`);
            fileInput.addEventListener('change', (e) => {
              const file = e.target.files[0];
              if (!file) return;

              // daftar MIME type yang diizinkan
              const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              ];

              if (!allowedTypes.includes(file.type)) {
                alert('Tipe file tidak diizinkan. Hanya PDF, DOC, DOCX, XLS, XLSX yang diperbolehkan.');
                e.target.value = '';  // reset input
                return;
              }

              // batas maksimal 5MB
              const maxSize = 5 * 1024 * 1024; // 5MB dalam bytes
              if (file.size > maxSize) {
                alert('Ukuran file terlalu besar. Maksimum 5 MB.');
                e.target.value = '';  // reset input
                return;
              }
            });

            const input = templateEl.querySelector('.staff-search');
            const resultsBox = templateEl.querySelector('.autocomplete-results');

            input.addEventListener('input', () => {
              const query = input.value.toLowerCase();
              const role = input.dataset.role;
              const sourceList = role === 'staff' ? staffProfiles : karuProfiles;

              const filtered = sourceList
                .filter(item => item.nama_lengkap.toLowerCase().includes(query))
                .slice(0, 5); 

              resultsBox.innerHTML = '';
              if (query.length === 0 || filtered.length === 0) return;

              filtered.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('autocomplete-item');
                div.style.padding = '6px 12px';
                div.style.cursor = 'pointer';
                div.textContent = item.nama_lengkap;

                div.addEventListener('click', () => {
                  input.value = item.nama_lengkap;
                  resultsBox.innerHTML = '';
                });

                resultsBox.appendChild(div);
              });
            });

            document.addEventListener('click', (e) => {
              if (!input.contains(e.target) && !resultsBox.contains(e.target)) {
                resultsBox.innerHTML = '';
              }
            });



            // Attach click handler
            const btn = document.getElementById(`start-btn-${template.workflow_id}`);
            btn.addEventListener('click', async () => {
              try {
                const formElement = document.getElementById(`template-form-${template.workflow_id}`);
                const formData = new FormData(formElement);

                const assignedInput = formElement.querySelector('input[name="assigned_user_name"]');
                formData.set('assigned_user_name', assignedInput?.value || '');
                const res = await fetchWithAuth('/api/workflow/instances', {
                  method: 'POST',
                  body: formData
                });
                const result = await res.json();

                if (res.ok) {
                  alert(result.message);
                  // untuk refresh tasklist
                  fetchTasks();
                } else {
                  alert(result.message);
                }
              } catch (error) {
                console.error('Error initiating task:', error);
                alert('Terjadi kesalahan saat menginisiasi tugas.');
                location.reload();
              }

              
          });
        })
      });
}