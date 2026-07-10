const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/auth.service', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
}));

const authService = require('../src/services/auth.service');
const { createApp } = require('../src/app');

describe('auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('POST /api/auth/register returns a token and user payload', async () => {
    authService.registerUser.mockResolvedValueOnce({
      user: {
        id: 'user-id',
        name: 'Alex Morgan',
        email: 'alex@example.com',
      },
      token: 'signed-token',
    });

    const app = createApp();

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Morgan',
        email: 'alex@example.com',
        password: 'plain-password',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      user: {
        id: 'user-id',
        name: 'Alex Morgan',
        email: 'alex@example.com',
      },
      token: 'signed-token',
    });
  });

  test('GET /api/auth/me rejects requests without a bearer token', async () => {
    const app = createApp();

    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Unauthorized' });
  });

  test('POST /api/auth/login returns a token for valid credentials', async () => {
    authService.loginUser.mockResolvedValueOnce({
      user: {
        id: 'user-id',
        name: 'Alex Morgan',
        email: 'alex@example.com',
      },
      token: 'signed-token',
    });

    const app = createApp();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@example.com',
        password: 'plain-password',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: 'user-id',
        name: 'Alex Morgan',
        email: 'alex@example.com',
      },
      token: 'signed-token',
    });
  });

  test('GET /api/auth/me returns the decoded user when the bearer token is valid', async () => {
    const token = jwt.sign({ id: 'user-id', email: 'alex@example.com' }, process.env.JWT_SECRET);
    const app = createApp();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: {
        id: 'user-id',
        email: 'alex@example.com',
      },
    });
  });
});