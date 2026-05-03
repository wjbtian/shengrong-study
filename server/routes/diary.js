const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');

router.get('/', diaryController.getAll);
router.post('/', diaryController.create);
router.put('/:id', diaryController.update);
router.delete('/:id', diaryController.delete);

module.exports = router;
