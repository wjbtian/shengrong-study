const express = require('express');
const router = express.Router();
const shinesController = require('../controllers/shinesController');

router.get('/', shinesController.getAll);
router.post('/', shinesController.create);
router.delete('/:id', shinesController.delete);
router.post('/:id/like', shinesController.like);
router.post('/:id/fav', shinesController.fav);

module.exports = router;
