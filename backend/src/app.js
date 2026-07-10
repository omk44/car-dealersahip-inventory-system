const express = require('express');
const authRoutes = require('./routes/auth.routes');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api/auth', authRoutes);

  return app;
}

module.exports = { createApp };