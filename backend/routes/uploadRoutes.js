const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const upload = require('../middleware/upload');

router.post('/', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const url = '/images/uploads/' + req.file.filename;
  res.json({ success: true, url });
});

// Multer errors (bad file type, too large) land here
router.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

module.exports = router;