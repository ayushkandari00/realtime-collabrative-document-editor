const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { verifySocketToken } = require('../middleware/auth');

// Track online users: userId -> socketId
const onlineUsers = new Map();

const setupSocket = (io) => {
  // ── Authentication middleware ─────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication error: No token'));

    const decoded = verifySocketToken(token);
    if (!decoded) return next(new Error('Authentication error: Invalid token'));

    socket.userId = decoded.id;
    next();
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${socket.id} (user: ${userId})`);

    // Register user as online
    onlineUsers.set(userId, socket.id);

    // Update DB online status
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    // Broadcast to all that this user came online
    socket.broadcast.emit('user-online', { userId });

    // ── Join conversation room ──────────────────────────────────────────────
    socket.on('join-chat', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`👥 User ${userId} joined room: ${conversationId}`);
    });

    // ── Leave conversation room ─────────────────────────────────────────────
    socket.on('leave-chat', ({ conversationId }) => {
      socket.leave(conversationId);
      console.log(`👋 User ${userId} left room: ${conversationId}`);
    });

    // ── Typing indicator ────────────────────────────────────────────────────
    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user-typing', { userId, conversationId });
    });

    socket.on('stop-typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user-stop-typing', { userId, conversationId });
    });

    // ── Send message ────────────────────────────────────────────────────────
    // Note: Message saving is done via REST API; this event is for real-time delivery
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, messageId } = data;

        // Fetch the saved message from DB with populated fields
        const message = await Message.findById(messageId)
          .populate('sender', 'name username avatar')
          .populate({ path: 'replyTo', populate: { path: 'sender', select: 'name username' } });

        if (!message) return;

        // Deliver to all in the room (including sender for confirmation)
        io.to(conversationId).emit('receive-message', { message, conversationId });

        // Mark as delivered for online users in the room
        const roomSockets = await io.in(conversationId).fetchSockets();
        const deliveredUserIds = roomSockets
          .map((s) => s.userId)
          .filter((id) => id && id !== userId);

        if (deliveredUserIds.length > 0) {
          await Message.findByIdAndUpdate(messageId, {
            $addToSet: { deliveredTo: { $each: deliveredUserIds } },
          });
          io.to(conversationId).emit('message-delivered', { messageId, deliveredTo: deliveredUserIds });
        }
      } catch (err) {
        console.error('send-message socket error:', err.message);
      }
    });

    // ── Message seen ────────────────────────────────────────────────────────
    socket.on('message-seen', async ({ conversationId, messageIds }) => {
      try {
        if (!messageIds || !messageIds.length) return;

        await Message.updateMany(
          { _id: { $in: messageIds }, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );

        // Reset unread count
        await Conversation.findByIdAndUpdate(conversationId, {
          [`unreadCounts.${userId}`]: 0,
        });

        // Notify the sender(s)
        socket.to(conversationId).emit('messages-read', { readBy: userId, conversationId, messageIds });
      } catch (err) {
        console.error('message-seen socket error:', err.message);
      }
    });

    // ── Message edited (realtime broadcast) ────────────────────────────────
    socket.on('message-edited', ({ conversationId, message }) => {
      socket.to(conversationId).emit('message-edited', { message, conversationId });
    });

    // ── Message deleted (realtime broadcast) ───────────────────────────────
    socket.on('message-deleted', ({ conversationId, messageId }) => {
      socket.to(conversationId).emit('message-deleted', { messageId, conversationId });
    });

    // ── Reaction added (realtime broadcast) ────────────────────────────────
    socket.on('reaction-added', ({ conversationId, messageId, reactions }) => {
      socket.to(conversationId).emit('reaction-updated', { messageId, reactions, conversationId });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id} (user: ${userId})`);
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit('user-offline', { userId, lastSeen: new Date() });
    });
  });
};

module.exports = setupSocket;
