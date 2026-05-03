const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.get('/', progressController.getAll);
router.post('/:subject/:unit', progressController.markDone);
router.delete('/:subject/:unit', progressController.markUndo);

module.exports = router;
