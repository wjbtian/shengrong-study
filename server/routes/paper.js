const express = require('express');
const router = express.Router();
const c = require('../controllers/paperController');
router.get('/errors/paper', c.getPaper);
router.get('/errors/download', c.downloadDocx);
module.exports = router;
