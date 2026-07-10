const { connectDb } = require('./config/db');

async function startServer(app) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required to start the server');
  }

  await connectDb();

  const port = process.env.PORT || 3000;

  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Backend listening on port ${port}`);
      resolve();
    });
  });
}

module.exports = { startServer };