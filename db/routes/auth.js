const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = 'queueless-dev-secret-change-in-prod';

router.post('/signup', async (req, res) => {
  const { name, email, password, age, location } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO User (name, email, password_hash, age, location, scheme_eligible)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [name, email, hash, age || null, location || null],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: err.message });
        }
        const token = jwt.sign({ user_id: this.lastID, email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
          message: 'Signup successful',
          token,
          user: { user_id: this.lastID, name, email, age, location }
        });
      }
    );
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM User WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.user_id, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        age: user.age,
        location: user.location
      }
    });
  });
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    db.get('SELECT user_id, name, email, age, location FROM User WHERE user_id = ?',
      [decoded.user_id], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid token' });
        res.json({ user });
      });
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
