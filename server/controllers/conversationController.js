const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// ─── Get User's Conversations ─────────────────────────────────────────────────
// GET /api/conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      archivedBy: { $ne: req.user._id },
    })
      .populate('participants', 'name username avatar isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' },
      })
      .sort({ lastActivity: -1 })
      .limit(100);

    // Attach unread count for current user
    const result = conversations.map((conv) => {
      const plain = conv.toObject();
      plain.unreadCount = conv.unreadCounts?.get(req.user._id.toString()) || 0;
      // Identify the other participant for display
      plain.otherParticipant = plain.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      return plain;
    });

    res.json({ success: true, conversations: result });
  } catch (error) {
    next(error);
  }
};

// ─── Get or Create Conversation ───────────────────────────────────────────────
// POST /api/conversations
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ success: false, message: 'participantId is required.' });
    }
    if (participantId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't chat with yourself." });
    }

    // Find existing 1-on-1 conversation
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, participantId], $size: 2 },
    })
      .populate('participants', 'name username avatar isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' },
      });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        unreadCounts: {},
      });
      conversation = await conversation.populate('participants', 'name username avatar isOnline lastSeen');
    }

    const plain = conversation.toObject();
    plain.unreadCount = conversation.unreadCounts?.get(req.user._id.toString()) || 0;
    plain.otherParticipant = plain.participants.find(
      (p) => p._id.toString() !== req.user._id.toString()
    );

    res.json({ success: true, conversation: plain });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Conversation ──────────────────────────────────────────────────
// GET /api/conversations/:id
const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    })
      .populate('participants', 'name username avatar isOnline lastSeen bio')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name username' },
      });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const plain = conversation.toObject();
    plain.unreadCount = conversation.unreadCounts?.get(req.user._id.toString()) || 0;
    plain.otherParticipant = plain.participants.find(
      (p) => p._id.toString() !== req.user._id.toString()
    );

    res.json({ success: true, conversation: plain });
  } catch (error) {
    next(error);
  }
};

// ─── Pin Conversation ─────────────────────────────────────────────────────────
// PUT /api/conversations/:id/pin
const pinConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    const isPinned = conversation.pinnedBy.includes(req.user._id);
    if (isPinned) {
      conversation.pinnedBy.pull(req.user._id);
    } else {
      conversation.pinnedBy.push(req.user._id);
    }
    await conversation.save();

    res.json({ success: true, isPinned: !isPinned });
  } catch (error) {
    next(error);
  }
};

// ─── Archive Conversation ─────────────────────────────────────────────────────
// PUT /api/conversations/:id/archive
const archiveConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found.' });

    const isArchived = conversation.archivedBy.includes(req.user._id);
    if (isArchived) {
      conversation.archivedBy.pull(req.user._id);
    } else {
      conversation.archivedBy.push(req.user._id);
    }
    await conversation.save();

    res.json({ success: true, isArchived: !isArchived });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getConversationById,
  pinConversation,
  archiveConversation,
};
