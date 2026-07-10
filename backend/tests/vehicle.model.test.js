const mongoose = require('mongoose');
const Vehicle = require('../src/models/vehicle.model');

describe('Vehicle Model Validation', () => {
  test('fails validation if category is missing', async () => {
    const vehicle = new Vehicle({
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 25000,
      quantity: 5,
    });

    let error;
    try {
      await vehicle.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.category.message).toBe('Path `category` is required.');
  });
});
