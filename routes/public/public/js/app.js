const DEMO_CREDENTIALS = {
  email: 'demo@queueless.com',
  password: 'demo123'
};

const DUMMY_PROVIDERS = [
  { doctor: 'Dr. Sarah Wilson', specialty: 'Cardiology', hospital: 'City Care Hospital', availability: 'Available', appointmentTime: 'Today 3:30 PM', location: 'Central City', cost: '$90' },
  { doctor: 'Dr. Arjun Mehta', specialty: 'Cardiology', hospital: 'Heartline Medical Center', availability: 'Limited Slots', appointmentTime: 'Tomorrow 10:00 AM', location: 'North Avenue', cost: '$110' },
  { doctor: 'Dr. Neha Iyer', specialty: 'Dermatology', hospital: 'Skin & Wellness Clinic', availability: 'Available', appointmentTime: 'Today 5:00 PM', location: 'West End', cost: '$70' },
  { doctor: 'Dr. Rohan Das', specialty: 'Orthopedics', hospital: 'OrthoPlus Hospital', availability: 'Available', appointmentTime: 'Tomorrow 2:00 PM', location: 'East Town', cost: '$85' },
  { doctor: 'Dr. Priya Anand', specialty: 'General Physician', hospital: 'Sunrise MultiCare', availability: 'Available', appointmentTime: 'Today 6:15 PM', location: 'Central City', cost: '$50' },
  { doctor: 'Dr. Vivek Sharma', specialty: 'General Physician', hospital: 'Green Valley Hospital', availability: 'Busy', appointmentTime: 'Tomorrow 11:45 AM', location: 'South Park', cost: '$55' }
];

const SYMPTOM_RULES = [
  { specialty: 'Cardiology', keywords: ['chest pain', 'chest tightness', 'palpitation', 'heart pain'] },
  { specialty: 'Dermatology', keywords: ['skin rash', 'rash', 'itching', 'eczema', 'acne'] },
  { specialty: 'Orthopedics', keywords: ['bone pain', 'joint pain', 'knee pain', 'back pain', 'sprain'] },
  { specialty: 'General Physician', keywords: ['fever', 'cold', 'cough', 'headache', 'weakness'] }
];

function isAuthenticated() {
  return !!localStorage.getItem('ql_token');
}

function navigate(page) {
  const protectedPages = ['dashboard', 'intake', 'results'];
  if (protectedPages.includes(page) && !isAuthenticated()) {
    page = 'login';
    showMsg('login-msg', 'Please login with demo credentials to continue.');
  }

  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');

  document.querySelectorAll('.navbar nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  window.scrollTo(0, 0);
}

document.querySelectorAll('.navbar nav a[data-page]').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    navigate(a.dataset.page);
  });
});

function showMsg(id, text, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `msg show ${type}`;
}

function clearMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.className = 'msg';
}

async function checkHealth() {
  const box = document.getElementById('health-status');
  box.innerHTML = '<p>⏳ Pinging backend...</p>';
  try {
    const r = await fetch('/api/health');
    const data = await r.json();
    box.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } catch (e) {
    box.innerHTML = '<p style="color:#dc2626">❌ Backend unreachable</p>';
  }
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  clearMsg('login-msg');

  const fd = new FormData(e.target);
  const email = (fd.get('email') || '').trim().toLowerCase();
  const password = (fd.get('password') || '').trim();

  if (!email || !password) {
    return showMsg('login-msg', 'Please enter both email and password.');
  }

  if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
    return showMsg('login-msg', 'Invalid demo credentials. Use demo@queueless.com / demo123.');
  }

  const demoUser = {
    name: 'Demo Patient',
    email: DEMO_CREDENTIALS.email,
    location: 'Central City'
  };

  localStorage.setItem('ql_token', 'demo-token');
  localStorage.setItem('ql_user', JSON.stringify(demoUser));
  loadDashboard();
  showMsg('login-msg', '✅ Login successful. Opening patient intake form...', 'success');
  setTimeout(() => {
    startIntake();
  }, 500);
});

function loadDashboard() {
  const user = JSON.parse(localStorage.getItem('ql_user') || '{}');
  document.getElementById('dash-name').textContent = user.name || 'Patient';
  document.getElementById('dash-email').textContent = user.email || '—';
  document.getElementById('dash-location').textContent = user.location || '—';
}

function logout() {
  localStorage.removeItem('ql_token');
  localStorage.removeItem('ql_user');
  clearIntakeForm();
  document.getElementById('results-list').innerHTML = '';
  document.getElementById('results-summary').textContent = '';
  navigate('home');
}

function startIntake() {
  if (!isAuthenticated()) {
    return navigate('login');
  }
  const user = JSON.parse(localStorage.getItem('ql_user') || '{}');
  if (user.name) document.getElementById('patient-name').value = user.name;
  if (user.location) document.getElementById('patient-location').value = user.location;
  clearMsg('intake-msg');
  navigate('intake');
}

function clearIntakeForm() {
  const form = document.getElementById('patient-form');
  form.reset();
  clearMsg('intake-msg');
}

function startNewSearch() {
  clearIntakeForm();
  navigate('intake');
}

function getMatchedSpecialty(symptoms) {
  const text = symptoms.toLowerCase();

  for (const rule of SYMPTOM_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.specialty;
    }
  }

  return 'General Physician';
}

function getTravelTime(patientLocation, hospitalLocation) {
  const patient = patientLocation.trim().toLowerCase();
  const hospital = hospitalLocation.trim().toLowerCase();

  if (!patient) return '30 mins (dummy)';
  if (patient === hospital) return '12 mins';

  const firstLetterGap = Math.abs(patient.charCodeAt(0) - hospital.charCodeAt(0));
  const estimate = 18 + (firstLetterGap % 25);
  return `${estimate} mins`;
}

function renderResults(patientData, specialty, providers) {
  const summary = document.getElementById('results-summary');
  summary.textContent = `${patientData.patientName}, based on your entered symptoms, QueueLess matched a dummy specialty: ${specialty}.`;

  const list = document.getElementById('results-list');
  list.innerHTML = '';

  providers.forEach((provider) => {
    const card = document.createElement('article');
    card.className = 'result-card';
    card.innerHTML = `
      <h3>${provider.doctor}</h3>
      <p><strong>Specialty:</strong> ${provider.specialty}</p>
      <p><strong>Hospital:</strong> ${provider.hospital}</p>
      <p><strong>Availability:</strong> ${provider.availability}</p>
      <p><strong>Appointment Time:</strong> ${patientData.preferredDateTime || provider.appointmentTime}</p>
      <p><strong>Hospital Location:</strong> ${provider.location}</p>
      <p><strong>Consultation Cost:</strong> ${provider.cost}</p>
      <p><strong>Estimated Travel Time:</strong> ${getTravelTime(patientData.location, provider.location)}</p>
    `;
    list.appendChild(card);
  });
}

document.getElementById('patient-form').addEventListener('submit', (e) => {
  e.preventDefault();
  clearMsg('intake-msg');

  const fd = new FormData(e.target);
  const patientData = {
    patientName: (fd.get('patientName') || '').trim(),
    age: Number(fd.get('age')),
    location: (fd.get('location') || '').trim(),
    medicalHistory: (fd.get('medicalHistory') || '').trim(),
    symptoms: (fd.get('symptoms') || '').trim(),
    preferredDateTime: fd.get('preferredDateTime') || ''
  };

  if (!patientData.patientName || !patientData.location || !patientData.medicalHistory || !patientData.symptoms) {
    return showMsg('intake-msg', 'Please complete all required fields before continuing.');
  }

  if (!Number.isFinite(patientData.age) || patientData.age < 1 || patientData.age > 120) {
    return showMsg('intake-msg', 'Please enter a valid age between 1 and 120.');
  }

  const specialty = getMatchedSpecialty(patientData.symptoms);
  let providers = DUMMY_PROVIDERS.filter((provider) => provider.specialty === specialty);

  if (!providers.length) {
    providers = DUMMY_PROVIDERS.filter((provider) => provider.specialty === 'General Physician');
  }

  renderResults(patientData, specialty, providers);
  navigate('results');
});

window.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    loadDashboard();
    navigate('dashboard');
  }
});
