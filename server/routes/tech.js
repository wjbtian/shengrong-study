const express = require('express');
const router = express.Router();
const techController = require('../controllers/techController');

router.get('/', techController.getAll);
router.post('/', techController.create);
router.delete('/:id', techController.delete);
router.put('/:id/fav', techController.toggleFav);
router.get('/daily', techController.getDaily);
router.post('/seed', techController.seed);

module.exports = router;
