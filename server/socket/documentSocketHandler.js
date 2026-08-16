const Document = require('../models/Document');
const DocumentHistory = require('../models/DocumentHistory');
const User = require('../models/User');

// ── Per-document active users: documentId -> Map(userId -> userInfo) ──────────
const documentRooms = new Map();

// Assign a stable color to each user in a document
const USER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
];
let colorIndex = 0;
const getNextColor = () => USER_COLORS[colorIndex++ % USER_COLORS.length];

const setupDocumentSocket = (io, socket) => {
  const userId = socket.userId;

  // ── Join document room ───────────────────────────────────────────────────────
  socket.on('join-document', async ({ documentId }) => {
    if (!documentId) return;

    try {
      // Verify the user has access to this document
      const document = await Document.findById(documentId)
        .populate('owner', 'name email')
        .populate('collaborators.user', 'name email');

      if (!document) {
        return socket.emit('error', { message: 'Document not found.' });
      }

      const isOwner = document.owner._id.toString() === userId;
      const isCollaborator = document.collaborators.some(
        (c) => c.user._id.toString() === userId
      );

      if (!isOwner && !isCollaborator && !document.isPublic) {
        return socket.emit('error', { message: 'Access denied.' });
      }

      // Join the Socket.IO room
      socket.join(documentId);

      // Fetch user info
      const user = await User.findById(userId).select('name email');
      if (!user) return;

      // Register in active users map
      if (!documentRooms.has(documentId)) {
        documentRooms.set(documentId, new Map());
      }
      const room = documentRooms.get(documentId);
      const color = room.has(userId) ? room.get(userId).color : getNextColor();
      const userInfo = { userId, name: user.name, color, socketId: socket.id };
      room.set(userId, userInfo);

      // Send the current document state to the joining user
      socket.emit('load-document', {
        content: document.content,
        title: document.title,
      });

      // Send current active users list to the new user
      const activeUsers = Array.from(room.values());
      socket.emit('active-users', activeUsers);

      // Notify everyone else that this user joined
      socket.to(documentId).emit('user-joined', {
        user: userInfo,
        activeUsers,
      });

      console.log(`📄 User ${user.name} joined document: ${documentId}`);
    } catch (err) {
      console.error('join-document error:', err.message);
      socket.emit('error', { message: 'Failed to join document.' });
    }
  });

  // ── Leave document room ──────────────────────────────────────────────────────
  socket.on('leave-document', ({ documentId }) => {
    if (!documentId) return;

    socket.leave(documentId);

    const room = documentRooms.get(documentId);
    if (!room) return;

    const userInfo = room.get(userId);
    room.delete(userId);

    if (room.size === 0) {
      documentRooms.delete(documentId);
    }

    const activeUsers = Array.from((documentRooms.get(documentId) || new Map()).values());

    if (userInfo) {
      socket.to(documentId).emit('user-left', {
        userId,
        name: userInfo.name,
        activeUsers,
      });
    }

    console.log(`📄 User ${userId} left document: ${documentId}`);
  });

  // ── Broadcast content changes to collaborators ───────────────────────────────
  socket.on('send-changes', ({ documentId, content }) => {
    if (!documentId || content === undefined) return;
    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(documentId).emit('receive-changes', { content });
  });

  // ── Broadcast title changes ──────────────────────────────────────────────────
  socket.on('title-change', ({ documentId, title }) => {
    if (!documentId || title === undefined) return;
    socket.to(documentId).emit('title-updated', { title });
  });

  // ── Typing indicator ─────────────────────────────────────────────────────────
  socket.on('typing', ({ documentId, isTyping }) => {
    if (!documentId) return;
    const room = documentRooms.get(documentId);
    const userInfo = room?.get(userId);
    socket.to(documentId).emit('user-typing', {
      userId,
      name: userInfo?.name || 'Someone',
      isTyping: !!isTyping,
    });
  });

  // ── Save document (with version history) ────────────────────────────────────
  socket.on('save-document', async ({ documentId, content, title, wordCount, characterCount }) => {
    if (!documentId) return;

    try {
      const document = await Document.findById(documentId);
      if (!document) return;

      // Permission check
      const isOwner = document.owner.toString() === userId;
      const collaborator = document.collaborators.find(
        (c) => c.user.toString() === userId
      );
      if (!isOwner && collaborator?.permission !== 'editor') return;

      // Save version snapshot before overwriting
      const lastHistory = await DocumentHistory.findOne({ document: documentId })
        .sort({ version: -1 })
        .select('version');
      const nextVersion = (lastHistory?.version || 0) + 1;

      await DocumentHistory.create({
        document: documentId,
        content: document.content,  // save the PREVIOUS content as history
        title: document.title,
        savedBy: userId,
        version: nextVersion,
        wordCount: document.wordCount || 0,
      });

      // Update the document with new content
      const updateData = { lastEditedBy: userId };
      if (content !== undefined) updateData.content = content;
      if (title !== undefined) updateData.title = title;
      if (wordCount !== undefined) updateData.wordCount = wordCount;
      if (characterCount !== undefined) updateData.characterCount = characterCount;

      await Document.findByIdAndUpdate(documentId, updateData);

      // Notify all users in the room that document was saved
      io.to(documentId).emit('document-saved', {
        savedAt: new Date(),
        savedBy: userId,
      });

      console.log(`💾 Document ${documentId} saved by ${userId} (v${nextVersion})`);
    } catch (err) {
      console.error('save-document socket error:', err.message);
      socket.emit('error', { message: 'Failed to save document.' });
    }
  });

  // ── Handle disconnect — clean up document rooms ──────────────────────────────
  socket.on('disconnect', () => {
    // Clean up all document rooms this socket was in
    for (const [documentId, room] of documentRooms.entries()) {
      if (room.has(userId)) {
        const userInfo = room.get(userId);
        room.delete(userId);

        if (room.size === 0) {
          documentRooms.delete(documentId);
        }

        const activeUsers = Array.from((documentRooms.get(documentId) || new Map()).values());
        socket.to(documentId).emit('user-left', {
          userId,
          name: userInfo?.name,
          activeUsers,
        });
      }
    }
  });
};

module.exports = setupDocumentSocket;
