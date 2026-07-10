require('dotenv').config();

const { createApp } = require('./app');
const { startServer } = require('./server');

const app = createApp();

startServer(app);