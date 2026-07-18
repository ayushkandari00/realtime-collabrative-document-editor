const mongoose = require('mongoose');

const documentHistorySchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

documentHistorySchema.index({ document: 1, version: -1 });

module.exports = mongoose.model('DocumentHistory', documentHistorySchema);
