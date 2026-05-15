const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

exports.verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded; // { id, role, name }
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

exports.verifyProfessor = (req, res, next) => {
  if (req.user && req.user.role === 'professor') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Professor role required.' });
  }
};
