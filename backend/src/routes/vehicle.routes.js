const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const {
  addVehicle,
  listVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
} = require('../services/vehicle.service');

const router = express.Router();

// Centralised error handler that maps known service-layer error messages
// to the correct HTTP status code. Keeps individual route handlers clean
// and ensures consistent error responses as new routes are added.
function handleRouteError(res, error) {
  if (error.message === 'Vehicle not found') {
    return res.status(404).json({ message: error.message });
  }
  return res.status(400).json({ message: error.message });
}

router.post('/', authenticateToken, async (req, res) => {
  try {
    // Keep this route protected so only authenticated users can add vehicles.
    const vehicle = await addVehicle(req.body);
    return res.status(201).json(vehicle);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

// Define /search before the generic GET / so Express does not treat
// "search" as a wildcard or param match on the root path.
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const filters = {};

    // Only include filters that the caller actually provided.
    if (make) filters.make = make;
    if (model) filters.model = model;
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);

    const vehicles = await searchVehicles(filters);
    return res.status(200).json(vehicles);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    // Keep this route protected so only authenticated users can view available vehicles.
    const vehicles = await listVehicles();
    return res.status(200).json(vehicles);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedVehicle = await updateVehicle(req.params.id, req.body);
    return res.status(200).json(updatedVehicle);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await deleteVehicle(req.params.id);
    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    return handleRouteError(res, error);
  }
});

router.post('/:id/purchase', authenticateToken, async (req, res) => {
  try {
    const purchasedVehicle = await purchaseVehicle(req.params.id);
    return res.status(200).json(purchasedVehicle);
  } catch (error) {
    return handleRouteError(res, error);
  }
});

module.exports = router;