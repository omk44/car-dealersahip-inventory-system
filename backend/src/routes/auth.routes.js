const express = require('express');
const { registerUser, loginUser } = require('../services/auth.service');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => res.json({ user: req.user }));

module.exports = router;