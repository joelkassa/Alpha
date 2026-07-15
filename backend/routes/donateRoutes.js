const express = require('express');
const router = express.Router();
const donateController = require('../controllers/donateController');

router.get('/', donateController.getDonate);
router.post('/initiate', donateController.postInitiate);
router.get('/sandbox-processing', donateController.getSandboxProcessing);
router.get('/complete', donateController.getComplete);
router.post('/callback', donateController.postCallback);

module.exports = router;