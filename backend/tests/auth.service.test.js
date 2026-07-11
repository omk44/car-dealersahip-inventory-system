jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../src/models/user.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user.model');
const { registerUser, loginUser } = require('../src/services/auth.service');

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('creates a user with a hashed password and returns a jwt token', async () => {
    bcrypt.hash.mockResolvedValueOnce('hashed-password');
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce({
      _id: 'user-id',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      role: 'user',
    });
    jwt.sign.mockReturnValueOnce('signed-token');

    const result = await registerUser({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'plain-password',
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'alex@example.com' });
    expect(bcrypt.hash).toHaveBeenCalledWith('plain-password', 10);
    expect(User.create).toHaveBeenCalledWith({
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'hashed-password',
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-id', role: 'user', name: 'Alex Morgan', email: 'alex@example.com' },
      'test-secret',
      { expiresIn: '7d' },
    );
    expect(result).toEqual({
      user: {
        id: 'user-id',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        role: 'user',
      },
      token: 'signed-token',
    });
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  test('returns a jwt token for valid credentials', async () => {
    bcrypt.compare.mockResolvedValueOnce(true);
    User.findOne.mockResolvedValueOnce({
      _id: 'user-id',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      password: 'hashed-password',
      role: 'user',
    });
    jwt.sign.mockReturnValueOnce('signed-token');

    const result = await loginUser({
      email: 'alex@example.com',
      password: 'plain-password',
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'alex@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('plain-password', 'hashed-password');
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-id', role: 'user', name: 'Alex Morgan', email: 'alex@example.com' },
      'test-secret',
      { expiresIn: '7d' },
    );
    expect(result).toEqual({
      user: {
        id: 'user-id',
        name: 'Alex Morgan',
        email: 'alex@example.com',
        role: 'user',
      },
      token: 'signed-token',
    });
  });
});