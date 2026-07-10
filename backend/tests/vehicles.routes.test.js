const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/vehicle.service', () => ({
  addVehicle: jest.fn(),
}));

const { addVehicle } = require('../src/services/vehicle.service');
const { createApp } = require('../src/app');

describe('vehicle routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('POST /api/vehicles creates a vehicle when authenticated', async () => {
    addVehicle.mockResolvedValueOnce({
      id: 'vehicle-id',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 25000,
    });

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        price: 25000,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 'vehicle-id',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 25000,
    });
  });

  test('POST /api/vehicles rejects requests without a bearer token', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/vehicles')
      .send({
        make: 'Toyota',
        model: 'Camry',
        year: 2024,
        price: 25000,
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });
});