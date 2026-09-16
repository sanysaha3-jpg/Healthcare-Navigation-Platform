const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║   QueueLess — Phase 1 Skeleton Running       ║');
  console.log('  ╠══════════════════════════════════════════════╣');
  console.log(`  ║   🌐  http://localhost:${PORT}                  ║`);
  console.log('  ║   📡  API: /api/health, /api/auth            ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
