const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const MESSAGE_PAGE_LIMIT = 30;

// ─── Send Message ─────────────────────────────────────────────────────────────
// POST /api/messages
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content, type = 'text', replyTo } = req.body;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'conversationId is required.' });
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Not a participant of this conversation.' });
    }

    // Build message data
    const messageData = {
      conversation: conversationId,
      sender: req.user._id,
      type,
      content: content || '',
      replyTo: replyTo || null,
    };

    // Attach file info if uploaded
    if (req.file) {
      messageData.fileUrl = req.file.path || req.file.secure_url;
      messageData.fileName = req.file.originalname || req.file.filename;
      messageData.fileSize = req.file.size || 0;
      messageData.fileMimeType = req.file.mimetype || '';
      if (!type || type === 'text') {
        messageData.type = req.file.mimetype?.startsWith('image/') ? 'image' : 'file';
      }
    }

    const message = await Message.create(messageData);
    await message.populate([
      { path: 'sender', select: 'name username avatar' },
      { path: 'replyTo', populate: { path: 'sender', select: 'name username' } },
    ]);

    // Update conversation last message and activity
    const otherParticipants = conversation.participants.filter(
      (p) => p.toString() !== req.user._id.toString()
    );

    // Increment unread count for all other participants
    const unreadUpdates = {};
    otherParticipants.forEach((participantId) => {
      const key = participantId.toString();
      unreadUpdates[`unreadCounts.${key}`] = (conversation.unreadCounts.get(key) || 0) + 1;
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastActivity: new Date(),
      ...unreadUpdates,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// ─── Get Messages (with infinite scroll) ─────────────────────────────────────
// GET /api/messages/:conversationId?before=messageId&limit=30
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { before, limit = MESSAGE_PAGE_LIMIT } = req.query;

    // Verify participation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Not a participant of this conversation.' });
    }

    const query = { conversation: conversationId };
    if (before) {
      const beforeMsg = await Message.findById(before);
      if (beforeMsg) query.createdAt = { $lt: beforeMsg.createdAt };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name username avatar')
      .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name username' } })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Return in ascending order for display
    const ordered = messages.reverse();
    const hasMore = messages.length === Number(limit);

    res.json({ success: true, messages: ordered, hasMore });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Message ───────────────────────────────────────────────────────────
// DELETE /api/messages/:id
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot delete another user\'s message.' });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = '';
    message.fileUrl = '';
    await message.save();

    res.json({ success: true, message: 'Message deleted.', messageId: message._id });
  } catch (error) {
    next(error);
  }
};

// ─── Edit Message ─────────────────────────────────────────────────────────────
// PUT /api/messages/:id
const editMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required.' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Cannot edit another user\'s message.' });
    }
    if (message.isDeleted) {
      return res.status(400).json({ success: false, message: 'Cannot edit a deleted message.' });
    }
    if (message.type !== 'text') {
      return res.status(400).json({ success: false, message: 'Only text messages can be edited.' });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();
    await message.populate('sender', 'name username avatar');

    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// ─── Add / Toggle Reaction ────────────────────────────────────────────────────
// POST /api/messages/:id/react
const addReaction = async (req, res, next) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ success: false, message: 'Emoji is required.' });

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });

    const userId = req.user._id;
    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      const userIndex = existingReaction.users.findIndex((u) => u.toString() === userId.toString());
      if (userIndex > -1) {
        // Remove reaction
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(userId);
      }
    } else {
      message.reactions.push({ emoji, users: [userId] });
    }

    await message.save();
    res.json({ success: true, reactions: message.reactions });
  } catch (error) {
    next(error);
  }
};

// ─── Mark Messages as Read ────────────────────────────────────────────────────
// PUT /api/messages/read/:conversationId
const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Add user to readBy for all unread messages in conversation
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
        isDeleted: false,
      },
      { $addToSet: { readBy: req.user._id } }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCounts.${req.user._id}`]: 0,
    });

    res.json({ success: true, message: 'Messages marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getMessages, deleteMessage, editMessage, addReaction, markAsRead };
