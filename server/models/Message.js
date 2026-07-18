const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Message type: text, image, file, audio
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio'],
      default: 'text',
    },
    content: {
      type: String,
      default: '',
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    // For file/image messages
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    fileMimeType: { type: String, default: '' },
    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Edit tracking
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    // Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    // Reactions array [{emoji, users[]}]
    reactions: [reactionSchema],
    // Read receipts
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

// Index for fetching conversation messages efficiently
messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
