const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { addVehicle, listVehicles } = require('../services/vehicle.service');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    // Keep this route protected so only authenticated users can add vehicles.
    const vehicle = await addVehicle(req.body);
    return res.status(201).json(vehicle);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Keep this route protected so only authenticated users can view available vehicles.
    const vehicles = await listVehicles();
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;