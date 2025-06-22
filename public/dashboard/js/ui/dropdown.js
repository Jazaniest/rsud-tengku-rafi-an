export function setupProfileDropdown() {
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  if (profileBtn) {
    profileBtn.addEventListener('click', e => {
      e.preventDefault();
      profileDropdown.style.display = profileDropdown.style.display === 'block' ? 'none' : 'block';
    });
  }
  document.addEventListener('click', e => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.style.display = 'none';
    }
  });
}

export function addNavListener(id, url) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => window.location.href = url);
}