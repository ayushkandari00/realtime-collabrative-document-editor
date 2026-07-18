const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-z0-9_.]+$/, 'Username can only contain letters, numbers, dots, and underscores'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    // Password reset
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    // User preferences
    pinnedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mutedConversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }],
  },
  {
    timestamps: true,
  }
);

// Index for search
userSchema.index({ name: 'text', username: 'text' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
