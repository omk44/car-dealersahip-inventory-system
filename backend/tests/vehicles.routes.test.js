const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/vehicle.service', () => ({
  addVehicle: jest.fn(),
  listVehicles: jest.fn(),
  searchVehicles: jest.fn(),
}));

const { addVehicle, listVehicles, searchVehicles } = require('../src/services/vehicle.service');
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

  test('GET /api/vehicles returns a list of available vehicles when authenticated', async () => {
    listVehicles.mockResolvedValueOnce([
      {
        id: 'vehicle-1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
        price: 22000,
      },
      {
        id: 'vehicle-2',
        make: 'Honda',
        model: 'Civic',
        year: 2024,
        price: 24000,
      },
    ]);

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);

    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'vehicle-1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
        price: 22000,
      },
      {
        id: 'vehicle-2',
        make: 'Honda',
        model: 'Civic',
        year: 2024,
        price: 24000,
      },
    ]);
  });

  test('GET /api/vehicles/search filters vehicles by make', async () => {
    searchVehicles.mockResolvedValueOnce([
      {
        id: 'vehicle-1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
        price: 22000,
        category: 'Sedan',
      },
    ]);

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);

    const response = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'vehicle-1',
        make: 'Toyota',
        model: 'Corolla',
        year: 2023,
        price: 22000,
        category: 'Sedan',
      },
    ]);
    // Verify the service received the parsed query filters.
    expect(searchVehicles).toHaveBeenCalledWith({ make: 'Toyota' });
  });

  test('GET /api/vehicles/search filters vehicles by price range', async () => {
    searchVehicles.mockResolvedValueOnce([
      {
        id: 'vehicle-2',
        make: 'Honda',
        model: 'Civic',
        year: 2024,
        price: 24000,
        category: 'Sedan',
      },
    ]);

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);

    const response = await request(app)
      .get('/api/vehicles/search?minPrice=20000&maxPrice=25000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    // Prices arrive as strings from query params; the route should parse them to numbers.
    expect(searchVehicles).toHaveBeenCalledWith({ minPrice: 20000, maxPrice: 25000 });
  });

  test('GET /api/vehicles/search supports combined filters', async () => {
    searchVehicles.mockResolvedValueOnce([
      {
        id: 'vehicle-3',
        make: 'Toyota',
        model: 'RAV4',
        year: 2024,
        price: 32000,
        category: 'SUV',
      },
    ]);

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);

    const response = await request(app)
      .get('/api/vehicles/search?make=Toyota&category=SUV&minPrice=30000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'vehicle-3',
        make: 'Toyota',
        model: 'RAV4',
        year: 2024,
        price: 32000,
        category: 'SUV',
      },
    ]);
    expect(searchVehicles).toHaveBeenCalledWith({
      make: 'Toyota',
      category: 'SUV',
      minPrice: 30000,
    });
  });

  test('GET /api/vehicles/search rejects unauthenticated requests', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/vehicles/search?make=Toyota');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });
});