const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

const { connectDb } = require('../src/config/db');

describe('connectDb', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/car-dealership-test';
  });

  test('connects mongoose using the configured MONGO_URI', async () => {
    mongoose.connect.mockResolvedValueOnce();

    await connectDb();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
  });
});