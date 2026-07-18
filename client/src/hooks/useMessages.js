import { useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { SOCKET_EVENTS, MESSAGES_PER_PAGE } from '../utils/constants';
import toast from 'react-hot-toast';

export const useMessages = (conversationId) => {
  const { user } = useAuth();
  const { socket, joinConversation, leaveConversation } = useSocket();
  const {
    messages,
    hasMoreMessages,
    loadingMessages,
    setMessages,
    prependMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    clearUnread,
    updateLastMessage,
  } = useChat();

  const convMessages = messages[conversationId] || [];
  const hasMore = hasMoreMessages[conversationId] ?? true;

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) return;

    const load = async () => {
      try {
        const { data } = await chatService.getMessages(conversationId, {
          limit: MESSAGES_PER_PAGE,
        });
        setMessages(conversationId, data.messages || [], data.hasMore ?? false);
        clearUnread(conversationId);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    load();
    joinConversation(conversationId);

    return () => {
      leaveConversation(conversationId);
    };
  }, [conversationId]); // eslint-disable-line

  // Load older messages (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!conversationId || !hasMore || loadingMessages) return;
    const oldest = convMessages[0];
    if (!oldest) return;
    try {
      const { data } = await chatService.getMessages(conversationId, {
        limit: MESSAGES_PER_PAGE,
        beforeId: oldest._id,
      });
      prependMessages(conversationId, data.messages || [], data.hasMore ?? false);
    } catch (err) {
      console.error('Failed to load older messages:', err);
    }
  }, [conversationId, hasMore, loadingMessages, convMessages, prependMessages]);

  // Send message
  const sendMessage = useCallback(
    async ({ content, type = 'text', fileUrl, fileName, fileSize, replyTo }) => {
      try {
        const { data } = await chatService.sendMessage({
          conversationId,
          content,
          type,
          fileUrl,
          fileName,
          fileSize,
          replyTo,
        });
        addMessage(conversationId, data.message);
        updateLastMessage(conversationId, data.message);
        return data.message;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to send message');
        throw err;
      }
    },
    [conversationId, addMessage, updateLastMessage]
  );

  // Edit message
  const editMessage = useCallback(
    async (messageId, content) => {
      try {
        const { data } = await chatService.editMessage(messageId, content);
        updateMessage(conversationId, data.message);
      } catch (err) {
        toast.error('Failed to edit message');
      }
    },
    [conversationId, updateMessage]
  );

  // Delete message
  const handleDeleteMessage = useCallback(
    async (messageId) => {
      try {
        await chatService.deleteMessage(messageId);
        deleteMessage(conversationId, messageId);
      } catch (err) {
        toast.error('Failed to delete message');
      }
    },
    [conversationId, deleteMessage]
  );

  // Add/remove reaction
  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      try {
        const msg = convMessages.find((m) => m._id === messageId);
        const existingReaction = msg?.reactions?.find((r) => r.emoji === emoji);
        const userReacted = existingReaction?.users?.includes(user?._id);

        if (userReacted) {
          const { data } = await chatService.removeReaction(messageId, emoji);
          updateMessage(conversationId, data.message);
        } else {
          const { data } = await chatService.addReaction(messageId, emoji);
          updateMessage(conversationId, data.message);
        }
      } catch (err) {
        toast.error('Failed to update reaction');
      }
    },
    [conversationId, convMessages, user, updateMessage]
  );

  // Mark as read
  const markRead = useCallback(async () => {
    if (!conversationId) return;
    try {
      await chatService.markAsRead(conversationId);
      clearUnread(conversationId);
    } catch {
      // Silently fail
    }
  }, [conversationId, clearUnread]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    const onNewMessage = (message) => {
      if (message.conversationId !== conversationId) return;
      addMessage(conversationId, message);
      updateLastMessage(conversationId, message);
      if (message.sender._id !== user?._id) {
        markRead();
      }
    };

    const onMessageEdited = (message) => {
      if (message.conversationId !== conversationId) return;
      updateMessage(conversationId, message);
    };

    const onMessageDeleted = ({ messageId, conversationId: convId }) => {
      if (convId !== conversationId) return;
      deleteMessage(conversationId, messageId);
    };

    const onReactionUpdated = (message) => {
      if (message.conversationId !== conversationId) return;
      updateMessage(conversationId, message);
    };

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
    socket.on(SOCKET_EVENTS.MESSAGE_EDITED, onMessageEdited);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted);
    socket.on(SOCKET_EVENTS.REACTION_UPDATED, onReactionUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
      socket.off(SOCKET_EVENTS.MESSAGE_EDITED, onMessageEdited);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted);
      socket.off(SOCKET_EVENTS.REACTION_UPDATED, onReactionUpdated);
    };
  }, [socket, conversationId, user?._id]); // eslint-disable-line

  return {
    messages: convMessages,
    hasMore,
    loadingMessages,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage: handleDeleteMessage,
    toggleReaction,
    markRead,
  };
};
