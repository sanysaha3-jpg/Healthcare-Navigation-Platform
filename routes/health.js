const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  db.get('SELECT 1 AS ok', (err, row) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        backend: 'up',
        database: 'down',
        error: err.message
      });
    }
    res.json({
      status: 'ok',
      backend: 'up',
      database: 'up',
      timestamp: new Date().toISOString(),
      phase: 'Phase 1 — Full-stack skeleton'
    });
  });
});

module.exports = router;
