const express = require('express');
const router = express.Router();
const guitarController = require('../controllers/guitarController');

router.get('/', guitarController.getAll);
router.post('/', guitarController.create);
router.delete('/:id', guitarController.delete);

module.exports = router;
