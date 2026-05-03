const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const commonController = require('../controllers/commonController');

router.post('/upload', upload.single('file'), commonController.upload);
router.post('/migrate', commonController.migrate);
router.get('/photo-wall', commonController.getPhotoWall);
router.post('/photo-wall', commonController.savePhotoWall);

module.exports = router;
