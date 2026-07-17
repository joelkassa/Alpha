const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const createListController = require('../controllers/adminListController');
const createReorderHandler = require('../controllers/adminReorderController');

const statsController = createListController({
  table: 'stats',
  columns: ['label_en', 'label_am', 'value', 'sort_order'],
});
const programsController = createListController({
  table: 'programs',
  columns: ['title_en', 'title_am', 'description_en', 'description_am', 'image_url', 'sort_order'],
});
const staffController = createListController({
  table: 'staff',
  columns: ['name', 'role_en', 'role_am', 'bio_en', 'bio_am', 'photo_url', 'sort_order'],
});
const donorController = createListController({
  table: 'donor_logos',
  columns: ['name', 'logo_url', 'link_url', 'sort_order'],
});
const galleryController = createListController({
  table: 'gallery_images',
  columns: ['program_id', 'image_url', 'caption_en', 'caption_am', 'sort_order'],
});

router.use(requireAuth);

router.post('/stats', statsController.create);
router.patch('/stats/:id', statsController.update);
router.post('/stats/reorder', createReorderHandler('stats'));
router.post('/programs/reorder', createReorderHandler('programs'));
router.post('/staff/reorder', createReorderHandler('staff'));
router.post('/donor-logos/reorder', createReorderHandler('donor_logos'));
router.post('/gallery/reorder', createReorderHandler('gallery_images'));
router.delete('/stats/:id', statsController.remove);

router.post('/programs', programsController.create);
router.patch('/programs/:id', programsController.update);
router.delete('/programs/:id', programsController.remove);

router.post('/staff', staffController.create);
router.patch('/staff/:id', staffController.update);
router.delete('/staff/:id', staffController.remove);

router.post('/donor-logos', donorController.create);
router.patch('/donor-logos/:id', donorController.update);
router.delete('/donor-logos/:id', donorController.remove);

router.post('/gallery', galleryController.create);
router.patch('/gallery/:id', galleryController.update);
router.delete('/gallery/:id', galleryController.remove);

module.exports = router;