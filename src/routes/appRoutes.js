const express = require('express');
const SlotsController = require('../controllers/SlotsController');

const router = express.Router();

router.get('/test', SlotsController.test)

module.exports = router;