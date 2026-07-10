const Vehicle = require('../models/vehicle.model');

async function addVehicle(vehicleData) {
  const createdVehicle = await Vehicle.create(vehicleData);

  // Return a stable response shape instead of exposing the raw mongoose document.
  return {
    id: createdVehicle._id,
    make: createdVehicle.make,
    model: createdVehicle.model,
    year: createdVehicle.year,
    price: createdVehicle.price,
  };
}

async function listVehicles() {
  const vehicles = await Vehicle.find();

  // Return a stable list shape so the API contract stays predictable.
  return vehicles.map((vehicle) => ({
    id: vehicle._id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
  }));
}

async function searchVehicles(filters) {
  const query = {};

  // Build case-insensitive regex filters for text fields so partial
  // matches like "Toy" still find "Toyota".
  if (filters.make) {
    query.make = { $regex: filters.make, $options: 'i' };
  }

  if (filters.model) {
    query.model = { $regex: filters.model, $options: 'i' };
  }

  if (filters.category) {
    query.category = { $regex: filters.category, $options: 'i' };
  }

  // Build a numeric range filter for price when either bound is provided.
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      query.price.$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      query.price.$lte = filters.maxPrice;
    }
  }

  const vehicles = await Vehicle.find(query);

  return vehicles.map((vehicle) => ({
    id: vehicle._id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    category: vehicle.category,
  }));
}

module.exports = { addVehicle, listVehicles, searchVehicles };