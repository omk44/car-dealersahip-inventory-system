const Vehicle = require('../models/vehicle.model');

// Single place to shape a mongoose vehicle document into the API response
// contract. Every public function uses this so the output stays consistent.
function formatVehicle(vehicle) {
  return {
    id: vehicle._id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    category: vehicle.category,
    quantity: vehicle.quantity,
  };
}

async function addVehicle(vehicleData) {
  const createdVehicle = await Vehicle.create(vehicleData);

  return formatVehicle(createdVehicle);
}

async function listVehicles() {
  const vehicles = await Vehicle.find();

  return vehicles.map(formatVehicle);
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

  return vehicles.map(formatVehicle);
}

async function updateVehicle(id, updateData) {
  // Return the updated document by setting { new: true } so the caller
  // gets back the post-update state instead of the stale pre-update one.
  const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedVehicle) {
    throw new Error('Vehicle not found');
  }

  return formatVehicle(updatedVehicle);
}

async function deleteVehicle(id) {
  const deletedVehicle = await Vehicle.findByIdAndDelete(id);

  if (!deletedVehicle) {
    throw new Error('Vehicle not found');
  }
}

async function purchaseVehicle(id) {
  // First, find the vehicle to check stock
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  if (vehicle.quantity <= 0) {
    throw new Error('Vehicle out of stock');
  }

  // Decrement the quantity and save
  vehicle.quantity -= 1;
  await vehicle.save();

  return formatVehicle(vehicle);
}

async function restockVehicle(id, quantity = 1) {
  const vehicle = await Vehicle.findById(id);

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  vehicle.quantity += quantity;
  await vehicle.save();

  return formatVehicle(vehicle);
}

module.exports = { addVehicle, listVehicles, searchVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle };