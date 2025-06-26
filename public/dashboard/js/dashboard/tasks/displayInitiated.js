export function displayInitiatedTasks(tasks) {
  const tbody = document.querySelector('#initiatedTasksTable tbody');
  tbody.innerHTML = '';
  tasks.forEach((task, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i+1}</td>
      <td>${task.code}</td>
      <td>${task.title}</td>
      <td>${task.description}</td>
      <td>${task.status}</td>
    `;
    tbody.appendChild(row);
  });
}