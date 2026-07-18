const Document = require('../models/Document');
const DocumentHistory = require('../models/DocumentHistory');
const User = require('../models/User');

// @desc    Get all documents for user
// @route   GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const { search, type = 'all', page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    if (type === 'owned') {
      query = { owner: userId };
    } else if (type === 'shared') {
      query = { 'collaborators.user': userId };
    } else {
      query = {
        $or: [{ owner: userId }, { 'collaborators.user': userId }],
      };
    }

    if (search) {
      query.$text = { $search: search };
    }

    const [documents, total] = await Promise.all([
      Document.find(query)
        .populate('owner', 'name email')
        .populate('collaborators.user', 'name email')
        .populate('lastEditedBy', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Document.countDocuments(query),
    ]);

    res.json({
      success: true,
      documents,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create document
// @route   POST /api/documents
const createDocument = async (req, res, next) => {
  try {
    const { title = 'Untitled Document', content = '' } = req.body;

    const document = await Document.create({
      title,
      content,
      owner: req.user._id,
      lastEditedBy: req.user._id,
    });

    await document.populate('owner', 'name email');

    res.status(201).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document
// @route   GET /api/documents/:id
const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email')
      .populate('lastEditedBy', 'name email');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const userId = req.user._id.toString();
    const isOwner = document.owner._id.toString() === userId;
    const collaborator = document.collaborators.find(
      (c) => c.user._id.toString() === userId
    );

    if (!isOwner && !collaborator && !document.isPublic) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const permission = isOwner ? 'owner' : collaborator?.permission || 'viewer';

    res.json({ success: true, document, permission });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
const updateDocument = async (req, res, next) => {
  try {
    const { title, content, wordCount, characterCount } = req.body;
    const userId = req.user._id;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const isOwner = document.owner.toString() === userId.toString();
    const collaborator = document.collaborators.find(
      (c) => c.user.toString() === userId.toString()
    );

    if (!isOwner && collaborator?.permission !== 'editor') {
      return res.status(403).json({ success: false, message: 'You do not have edit permission.' });
    }

    const updateData = { lastEditedBy: userId };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (wordCount !== undefined) updateData.wordCount = wordCount;
    if (characterCount !== undefined) updateData.characterCount = characterCount;

    const updated = await Document.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email')
      .populate('lastEditedBy', 'name email');

    res.json({ success: true, document: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this document.' });
    }

    await Promise.all([
      Document.findByIdAndDelete(req.params.id),
      DocumentHistory.deleteMany({ document: req.params.id }),
    ]);

    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Share document
// @route   POST /api/documents/share
const shareDocument = async (req, res, next) => {
  try {
    const { documentId, email, permission = 'viewer' } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can share this document.' });
    }

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User with this email not found.' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot share with yourself.' });
    }

    const existingCollab = document.collaborators.find(
      (c) => c.user.toString() === targetUser._id.toString()
    );

    if (existingCollab) {
      existingCollab.permission = permission;
    } else {
      document.collaborators.push({ user: targetUser._id, permission });
    }

    await document.save();
    await document.populate('collaborators.user', 'name email');

    res.json({ success: true, message: `Document shared with ${targetUser.name}.`, document });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator
// @route   DELETE /api/documents/:id/collaborators/:userId
const removeCollaborator = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (document.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can remove collaborators.' });
    }

    document.collaborators = document.collaborators.filter(
      (c) => c.user.toString() !== req.params.userId
    );
    await document.save();

    res.json({ success: true, message: 'Collaborator removed.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document history
// @route   GET /api/documents/:id/history
const getHistory = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const userId = req.user._id.toString();
    const isOwner = document.owner.toString() === userId;
    const isCollaborator = document.collaborators.some((c) => c.user.toString() === userId);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const history = await DocumentHistory.find({ document: req.params.id })
      .populate('savedBy', 'name email')
      .sort({ version: -1 })
      .limit(50);

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore document version
// @route   POST /api/documents/:id/restore/:version
const restoreVersion = async (req, res, next) => {
  try {
    const version = await DocumentHistory.findOne({
      document: req.params.id,
      version: req.params.version,
    });

    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found.' });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { content: version.content, title: version.title, lastEditedBy: req.user._id },
      { new: true }
    ).populate('owner', 'name email');

    res.json({ success: true, document, message: 'Version restored successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  shareDocument,
  removeCollaborator,
  getHistory,
  restoreVersion,
};
