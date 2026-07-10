const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { addVehicle } = require('../services/vehicle.service');

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

module.exports = router;