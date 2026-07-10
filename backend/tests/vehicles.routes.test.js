const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/vehicle.service', () => ({
  addVehicle: jest.fn(),
  listVehicles: jest.fn(),
  searchVehicles: jest.fn(),
  updateVehicle: jest.fn(),
  deleteVehicle: jest.fn(),
  purchaseVehicle: jest.fn(),
  restockVehicle: jest.fn(),
}));

const { addVehicle, listVehicles, searchVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle } = require('../src/services/vehicle.service');
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

  test('PUT /api/vehicles/:id updates a vehicle when authenticated', async () => {
    updateVehicle.mockResolvedValueOnce({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2025,
      price: 27000,
      category: 'Sedan',
    });

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);

    const response = await request(app)
      .put('/api/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ year: 2025, price: 27000 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2025,
      price: 27000,
      category: 'Sedan',
    });
    // Verify service receives the id and the update payload separately.
    expect(updateVehicle).toHaveBeenCalledWith('vehicle-1', { year: 2025, price: 27000 });
  });

  test('PUT /api/vehicles/:id returns 404 when the vehicle does not exist', async () => {
    updateVehicle.mockRejectedValueOnce(new Error('Vehicle not found'));

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);

    const response = await request(app)
      .put('/api/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 30000 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Vehicle not found' });
  });

  test('PUT /api/vehicles/:id rejects unauthenticated requests', async () => {
    const app = createApp();

    const response = await request(app)
      .put('/api/vehicles/vehicle-1')
      .send({ price: 30000 });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  test('DELETE /api/vehicles/:id deletes a vehicle when authenticated as admin', async () => {
    deleteVehicle.mockResolvedValueOnce();

    const app = createApp();
    // Token includes role: 'admin'
    const token = jwt.sign({ id: 'admin-id', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET);

    const response = await request(app)
      .delete('/api/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Vehicle deleted successfully' });
    expect(deleteVehicle).toHaveBeenCalledWith('vehicle-1');
  });

  test('DELETE /api/vehicles/:id returns 403 Forbidden when authenticated as normal user', async () => {
    const app = createApp();
    // Default or user role
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com', role: 'user' }, process.env.JWT_SECRET);

    const response = await request(app)
      .delete('/api/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Forbidden: Admin access required' });
  });

  test('DELETE /api/vehicles/:id returns 404 when the vehicle does not exist', async () => {
    deleteVehicle.mockRejectedValueOnce(new Error('Vehicle not found'));

    const app = createApp();
    const token = jwt.sign({ id: 'admin-id', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET);

    const response = await request(app)
      .delete('/api/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Vehicle not found' });
  });

  test('DELETE /api/vehicles/:id rejects unauthenticated requests', async () => {
    const app = createApp();

    const response = await request(app)
      .delete('/api/vehicles/vehicle-1');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  test('POST /api/vehicles/:id/purchase successfully purchases a vehicle', async () => {
    purchaseVehicle.mockResolvedValueOnce({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 25000,
      category: 'Sedan',
      quantity: 0,
    });

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com', role: 'user' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 25000,
      category: 'Sedan',
      quantity: 0,
    });
    expect(purchaseVehicle).toHaveBeenCalledWith('vehicle-1');
  });

  test('POST /api/vehicles/:id/purchase returns 400 when out of stock', async () => {
    purchaseVehicle.mockRejectedValueOnce(new Error('Vehicle out of stock'));

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com', role: 'user' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Vehicle out of stock' });
  });

  test('POST /api/vehicles/:id/purchase returns 404 when vehicle does not exist', async () => {
    purchaseVehicle.mockRejectedValueOnce(new Error('Vehicle not found'));

    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com', role: 'user' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/vehicles/nonexistent-id/purchase')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Vehicle not found' });
  });

  test('POST /api/vehicles/:id/purchase rejects unauthenticated requests', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/purchase');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  test('POST /api/vehicles/:id/restock successfully restocks a vehicle when authenticated as admin', async () => {
    restockVehicle.mockResolvedValueOnce({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 25000,
      category: 'Sedan',
      quantity: 6,
    });

    const app = createApp();
    const token = jwt.sign({ id: 'admin-id', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'vehicle-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      price: 25000,
      category: 'Sedan',
      quantity: 6,
    });
    // Verifies the service received the ID and the restock quantity.
    expect(restockVehicle).toHaveBeenCalledWith('vehicle-1', 5);
  });

  test('POST /api/vehicles/:id/restock returns 403 Forbidden when authenticated as normal user', async () => {
    const app = createApp();
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com', role: 'user' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Forbidden: Admin access required' });
  });

  test('POST /api/vehicles/:id/restock returns 404 when vehicle does not exist', async () => {
    restockVehicle.mockRejectedValueOnce(new Error('Vehicle not found'));

    const app = createApp();
    const token = jwt.sign({ id: 'admin-id', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET);

    const response = await request(app)
      .post('/api/vehicles/nonexistent-id/restock')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Vehicle not found' });
  });

  test('POST /api/vehicles/:id/restock rejects unauthenticated requests', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/vehicles/vehicle-1/restock')
      .send({ quantity: 5 });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });
});