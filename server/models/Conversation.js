const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Unread counts per user: { userId: count }
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    // Users who have pinned this conversation
    pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Users who have archived this conversation
    archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Future: group chat support
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, default: '' },
    groupAvatar: { type: String, default: '' },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
  }
);

// Index for fetching user's conversations sorted by activity
conversationSchema.index({ participants: 1, lastActivity: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
