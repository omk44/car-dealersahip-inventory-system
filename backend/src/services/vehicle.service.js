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

module.exports = { addVehicle };