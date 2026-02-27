const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Reviews route works!' });
});

module.exports = router;
