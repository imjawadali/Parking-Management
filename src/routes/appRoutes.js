const express = require('express');
const SlotsController = require('../controllers/SlotsController');

const router = express.Router();

router.get('/getAllSlots', SlotsController.getAllSlots)
router.post('/parkCar', SlotsController.parkCar)
router.post('/unparkCar', SlotsController.unparkCar)
router.put('/changeMaintenanceMode', SlotsController.changeMaintenanceMode)
router.get('/getTotalParkingsByDate', SlotsController.getTotalParkingsByDate)

module.exports = router;