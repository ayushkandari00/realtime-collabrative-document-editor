const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken, generateResetToken } = require('../utils/generateToken');
const { sendEmail, passwordResetEmailTemplate } = require('../utils/sendEmail');

// ─── Register ────────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, username, email, password } = req.body;

    // Check for duplicate email or username
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({ success: false, message: `${field} already registered.` });
    }

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Mark as online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────
// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Get Profile ─────────────────────────────────────────────────────────────
// GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const resetToken = generateResetToken(user._id);
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your ChatApp password',
      html: passwordResetEmailTemplate(resetUrl, user.name),
    });

    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
  } catch (error) {
    // Don't expose email errors
    res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
  }
};

// ─── Reset Password ──────────────────────────────────────────────────────────
// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    user.password = password;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. Please login.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, forgotPassword, resetPassword };
