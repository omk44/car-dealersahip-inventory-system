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

module.exports = { addVehicle, listVehicles };