function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.navbar nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  window.scrollTo(0, 0);
}

document.querySelectorAll('.navbar nav a[data-page]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(a.dataset.page);
  });
});

function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg show ' + type;
  setTimeout(() => el.classList.remove('show'), 4000);
}

async function checkHealth() {
  const box = document.getElementById('health-status');
  box.innerHTML = '<p>⏳ Pinging backend...</p>';
  try {
    const r = await fetch('/api/health');
    const data = await r.json();
    box.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
  } catch (e) {
    box.innerHTML = '<p style="color:#dc2626">❌ Backend unreachable</p>';
  }
}

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  try {
    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) return showMsg('signup-msg', data.error || 'Signup failed');
    localStorage.setItem('ql_token', data.token);
    localStorage.setItem('ql_user', JSON.stringify(data.user));
    showMsg('signup-msg', '✅ Account created! Redirecting...', 'success');
    setTimeout(() => { loadDashboard(); navigate('dashboard'); }, 800);
  } catch (err) {
    showMsg('signup-msg', 'Network error: ' + err.message);
  }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) return showMsg('login-msg', data.error || 'Login failed');
    localStorage.setItem('ql_token', data.token);
    localStorage.setItem('ql_user', JSON.stringify(data.user));
    showMsg('login-msg', '✅ Logged in!', 'success');
    setTimeout(() => { loadDashboard(); navigate('dashboard'); }, 600);
  } catch (err) {
    showMsg('login-msg', 'Network error: ' + err.message);
  }
});

function loadDashboard() {
  const user = JSON.parse(localStorage.getItem('ql_user') || '{}');
  document.getElementById('dash-name').textContent = user.name || 'User';
  document.getElementById('dash-email').textContent = user.email || '—';
  document.getElementById('dash-age').textContent = user.age || '—';
  document.getElementById('dash-location').textContent = user.location || '—';
  document.getElementById('dash-scheme').textContent = user.scheme_eligible ? 'Yes' : 'No';
}

function logout() {
  localStorage.removeItem('ql_token');
  localStorage.removeItem('ql_user');
  navigate('home');
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ql_token')) {
    loadDashboard();
    navigate('dashboard');
  }
});
