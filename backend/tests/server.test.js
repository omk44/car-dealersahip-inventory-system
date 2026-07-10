jest.mock('../src/config/db', () => ({
  connectDb: jest.fn(),
}));

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const dotenv = require('dotenv');
const { connectDb } = require('../src/config/db');

describe('startServer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PORT = '5050';
    process.env.JWT_SECRET = 'test-secret';
  });

  test('loads environment variables, connects to the database, then starts listening', async () => {
    const app = {
      listen: jest.fn((port, callback) => callback()),
    };

    connectDb.mockResolvedValueOnce();

    const { startServer } = require('../src/server');

    await startServer(app);

    expect(dotenv.config).toHaveBeenCalled();
    expect(connectDb).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledWith('5050', expect.any(Function));
  });

  test('throws a clear error when JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;

    const app = {
      listen: jest.fn(),
    };

    await expect(require('../src/server').startServer(app)).rejects.toThrow(
      'JWT_SECRET is required to start the server',
    );

    expect(connectDb).not.toHaveBeenCalled();
    expect(app.listen).not.toHaveBeenCalled();
  });
});