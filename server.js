const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const requestLog = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 120;

function demoRateLimit(req, res, next) {
  const key = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requestLog.get(key) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  requestLog.set(key, entry);

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  next();
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(demoRateLimit);
app.use(express.static(path.join(__dirname, 'routes', 'public')));

app.use('/api/health', require('./routes/health'));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   QueueLess — Phase 1 Skeleton Running       ║');
  console.log('  ╠══════════════════════════════════════════════╣');
  console.log(`  ║   🌐  http://localhost:${PORT}                  ║`);
  console.log('  ║   📡  API: /api/health                       ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
