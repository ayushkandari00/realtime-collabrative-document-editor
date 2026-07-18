const jwt = require('jsonwebtoken');

/**
 * Generate a JWT access token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate a short-lived reset token
 * @param {string} id - User ID
 * @returns {string} JWT reset token
 */
const generateResetToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_RESET_SECRET, {
    expiresIn: '15m',
  });
};

module.exports = { generateToken, generateResetToken };
