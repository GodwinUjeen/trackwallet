const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { importCsv } = require('../services/csvImportService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();
router.use(auth());

router.post('/csv', upload.single('file'), async (req, res) => {
  try {
    let text = '';
    if (req.file) {
      text = req.file.buffer.toString('utf8');
    } else if (req.body.csv) {
      text = req.body.csv;
    } else {
      return res.status(400).json({ error: 'Upload a CSV file or provide csv text' });
    }

    const result = await importCsv(req.user._id, text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'CSV import failed' });
  }
});

module.exports = router;
