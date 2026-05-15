const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

// Professor Login (Hardcoded Demo)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === 'richard@demo.com' && password === 'richard123') {
      const token = jwt.sign({ id: 'demo-prof-1', role: 'professor', name: 'Richard Guzman' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({ token, user: { id: 'demo-prof-1', name: 'Richard Guzman', role: 'professor' } });
    }
    
    return res.status(401).json({ error: 'Invalid credentials. Use richard@demo.com and richard123' });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Student Login (Hardcoded Demo)
router.post('/student-login', (req, res) => {
  const { name, password } = req.body;
  
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required' });
  }
  
  if (name.toLowerCase().includes('pepito perez') && password === 'pepito123') {
    const token = jwt.sign({ name: 'Pepito Perez', role: 'student' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { name: 'Pepito Perez', role: 'student' } });
  }

  return res.status(401).json({ error: 'Invalid credentials. Use name: Pepito Perez and password: pepito123' });
});

module.exports = router;
