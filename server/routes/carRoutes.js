const express = require('express');
const router = express.Router();
const { getAllCars, getCarById } = require('../controllers/carController');

router.get('/', getAllCars);
router.get('/:id', getCarById);

module.exports = router;