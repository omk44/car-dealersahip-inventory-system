const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

function requireJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.startsWith('JWT_SECRET=')) {
    throw new Error('JWT_SECRET is required to sign tokens');
  }

  return jwtSecret;
}

async function registerUser({ name, email, password }) {
  const jwtSecret = requireJwtSecret();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { id: createdUser._id },
    jwtSecret,
    { expiresIn: '7d' },
  );

  return {
    user: {
      id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
    },
    token,
  };
}

async function loginUser({ email, password }) {
  const jwtSecret = requireJwtSecret();
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user._id },
    jwtSecret,
    { expiresIn: '7d' },
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
}

module.exports = { registerUser, loginUser };