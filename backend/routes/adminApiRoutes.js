const express = require('express');
const router = express.Router();
const adminApiController = require('../controllers/adminApiController');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth); // every route below requires admin login

router.patch('/content-blocks/:key', adminApiController.patchContentBlock);
router.post('/undo', adminApiController.postUndo);
router.post('/reset', adminApiController.postReset);

module.exports = router;