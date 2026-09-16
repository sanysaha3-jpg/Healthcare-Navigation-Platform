const DEMO_USERS = [
  { identifier: 'demo', password: 'demo123', name: 'Demo User' },
  { identifier: 'demo@queueless.com', password: 'demo123', name: 'Demo User' }
];

const HOSPITALS = [
  { hospital: 'CityCare Hospital', specialist: 'Cardiologist', when: 'Mon-Fri, 9:00 AM - 2:00 PM', where: 'Pune', cost: '₹800' },
  { hospital: 'Sunrise Medical Center', specialist: 'Dermatologist', when: 'Tue-Sat, 11:00 AM - 5:00 PM', where: 'Mumbai', cost: '₹700' },
  { hospital: 'Green Valley Clinic', specialist: 'Pediatrician', when: 'Mon-Sat, 10:00 AM - 1:00 PM', where: 'Delhi', cost: '₹600' },
  { hospital: 'Hope Multispecialty', specialist: 'Orthopedic', when: 'Mon-Fri, 4:00 PM - 8:00 PM', where: 'Bengaluru', cost: '₹900' },
  { hospital: 'Riverfront Health Hub', specialist: 'ENT Specialist', when: 'Mon-Sun, 8:00 AM - 12:00 PM', where: 'Kolkata', cost: '₹650' }
];

function isAuthenticated() {
  return Boolean(localStorage.getItem('ql_demo_auth'));
}

function navigate(page) {
  const targetPage = isAuthenticated() ? page : 'login';
  document.querySelectorAll('.page').forEach((section) => section.classList.remove('active'));
  document.getElementById(`page-${targetPage}`).classList.add('active');
  document.querySelectorAll('.navbar nav a[data-page]').forEach((link) => {
    link.classList.toggle('active', link.dataset.page === targetPage);
  });
  const logoutButton = document.getElementById('logout-nav-btn');
  logoutButton.classList.toggle('hidden', !isAuthenticated());
  window.scrollTo(0, 0);
}

function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `msg show ${type}`;
}

function clearMsg(id) {
  const el = document.getElementById(id);
  el.textContent = '';
  el.className = 'msg';
}

function validateLogin(identifier, password) {
  if (!identifier || !password) {
    return 'Please enter both email/username and password.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return '';
}

function loadDashboardUser() {
  const user = JSON.parse(localStorage.getItem('ql_demo_user') || '{}');
  document.getElementById('dash-name').textContent = user.name || 'User';
}

function createHospitalCard(item) {
  return `
    <article class="hospital-card">
      <h3>${item.hospital}</h3>
      <p><strong>Doctor Specialist:</strong> ${item.specialist}</p>
      <p><strong>Availability (When):</strong> ${item.when}</p>
      <p><strong>Location (Where):</strong> ${item.where}</p>
      <p><strong>Consultation Cost:</strong> ${item.cost}</p>
    </article>
  `;
}

function renderHospitals(filterText = '') {
  const list = document.getElementById('hospital-list');
  const empty = document.getElementById('empty-state');
  const query = filterText.trim().toLowerCase();
  const filtered = HOSPITALS.filter((item) => {
    const joined = `${item.hospital} ${item.specialist} ${item.where}`.toLowerCase();
    return joined.includes(query);
  });

  list.innerHTML = filtered.map(createHospitalCard).join('');
  empty.classList.toggle('hidden', filtered.length > 0);
}

function logout() {
  localStorage.removeItem('ql_demo_auth');
  localStorage.removeItem('ql_demo_user');
  clearMsg('login-msg');
  navigate('login');
}

document.querySelectorAll('.navbar nav a[data-page]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(a.dataset.page);
  });
});

document.getElementById('logout-nav-btn').addEventListener('click', logout);

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  clearMsg('login-msg');
  const fd = new FormData(e.target);
  const identifier = String(fd.get('identifier') || '').trim();
  const password = String(fd.get('password') || '');

  const validationError = validateLogin(identifier, password);
  if (validationError) {
    showMsg('login-msg', validationError);
    return;
  }

  const user = DEMO_USERS.find((item) => item.identifier.toLowerCase() === identifier.toLowerCase() && item.password === password);
  if (!user) {
    showMsg('login-msg', 'Invalid credentials. Use demo / demo123.');
    return;
  }

  localStorage.setItem('ql_demo_auth', 'true');
  localStorage.setItem('ql_demo_user', JSON.stringify({ name: user.name, identifier: user.identifier }));
  showMsg('login-msg', 'Login successful. Redirecting...', 'success');
  loadDashboardUser();
  renderHospitals();
  navigate('dashboard');
});

document.getElementById('hospital-search').addEventListener('input', (e) => {
  renderHospitals(e.target.value);
});

window.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    loadDashboardUser();
    renderHospitals();
    navigate('dashboard');
    return;
  }
  navigate('login');
});
