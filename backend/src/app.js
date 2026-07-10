const express = require('express');
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);

  return app;
}

module.exports = { createApp };