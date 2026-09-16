const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    backend: 'up',
    database: 'demo',
    timestamp: new Date().toISOString(),
    phase: 'QueueLess prototype (dummy data only)'
  });
});

module.exports = router;
