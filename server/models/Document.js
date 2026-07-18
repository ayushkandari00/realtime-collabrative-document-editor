const mongoose = require('mongoose');

const collaboratorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    permission: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Untitled Document',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [collaboratorSchema],
    isPublic: {
      type: Boolean,
      default: false,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
documentSchema.index({ title: 'text', content: 'text' });
documentSchema.index({ owner: 1, createdAt: -1 });
documentSchema.index({ 'collaborators.user': 1 });

module.exports = mongoose.model('Document', documentSchema);
