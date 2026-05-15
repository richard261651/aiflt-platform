const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

// Professor Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Quick hack to allow login without prior registration for the demo
    // If user doesn't exist, create it on the fly if it matches a default pattern
    let user = await User.findOne({ email });
    
    if (!user) {
      // Auto-register for demo purposes
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({ email, password: hashedPassword, name: 'Professor Demo', role: 'professor' });
      await user.save();
    } else {
      // Validate password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid email or password.' });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Student "Login" (Just name based, no password)
router.post('/student-login', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  // Issue a token for the student
  const token = jwt.sign({ name, role: 'student' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { name, role: 'student' } });
});

module.exports = router;
