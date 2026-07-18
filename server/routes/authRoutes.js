const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
      .matches(/^[a-zA-Z0-9_.]+$/).withMessage('Username can only contain letters, numbers, dots, and underscores'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Logout (protected)
router.post('/logout', protect, logout);

// Get profile (protected)
router.get('/profile', protect, getProfile);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;
