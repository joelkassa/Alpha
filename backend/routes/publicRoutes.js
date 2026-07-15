const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.getHome);
router.get('/about', publicController.getAbout);
router.get('/programs', publicController.getPrograms);

module.exports = router;