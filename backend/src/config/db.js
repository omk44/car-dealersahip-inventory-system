const mongoose = require('mongoose');

async function connectDb() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is required to connect to the database');
  }

  return mongoose.connect(mongoUri);
}

module.exports = { connectDb };