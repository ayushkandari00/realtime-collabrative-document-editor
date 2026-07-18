const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (without password)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    next(error);
  }
};

/**
 * Verify socket JWT token
 */
const verifySocketToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

module.exports = { protect, verifySocketToken };
