const User = require('../models/User');
const Conversation = require('../models/Conversation');

// ─── Get All Users (search) ───────────────────────────────────────────────────
// GET /api/users?search=query
const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
          ],
          _id: { $ne: req.user._id },
        }
      : { _id: { $ne: req.user._id } };

    const users = await User.find(query)
      .select('name username avatar isOnline lastSeen bio')
      .limit(20)
      .sort({ isOnline: -1, name: 1 });

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// ─── Get User Profile by ID ───────────────────────────────────────────────────
// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-blockedUsers -pinnedChats -mutedConversations');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    // If avatar was uploaded via Cloudinary
    if (req.file && req.file.path) {
      updates.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Profile updated.', user });
  } catch (error) {
    next(error);
  }
};

// ─── Block User ───────────────────────────────────────────────────────────────
// POST /api/users/block/:id
const blockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't block yourself." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { blockedUsers: targetId } },
      { new: true }
    );

    res.json({ success: true, message: 'User blocked.', blockedUsers: user.blockedUsers });
  } catch (error) {
    next(error);
  }
};

// ─── Unblock User ─────────────────────────────────────────────────────────────
// POST /api/users/unblock/:id
const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { blockedUsers: req.params.id } },
      { new: true }
    );
    res.json({ success: true, message: 'User unblocked.', blockedUsers: user.blockedUsers });
  } catch (error) {
    next(error);
  }
};

// ─── Get Online Users ─────────────────────────────────────────────────────────
// GET /api/users/online
const getOnlineUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      isOnline: true,
      _id: { $ne: req.user._id },
    }).select('name username avatar isOnline lastSeen').limit(50);
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, updateProfile, blockUser, unblockUser, getOnlineUsers };
