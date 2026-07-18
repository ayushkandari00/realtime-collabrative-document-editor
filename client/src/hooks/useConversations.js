import { useEffect, useCallback } from 'react';
import { chatService } from '../services/chatService';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { SOCKET_EVENTS } from '../utils/constants';

export const useConversations = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const {
    conversations,
    loadingConversations,
    setConversations,
    addOrUpdateConversation,
    updateLastMessage,
    incrementUnread,
    unreadCounts,
  } = useChat();

  // Fetch conversations on mount
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await chatService.getConversations();
        setConversations(data.conversations || []);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };
    if (user) load();
  }, [user]); // eslint-disable-line

  // Start a new conversation (or open existing)
  const startConversation = useCallback(async (participantId) => {
    try {
      const { data } = await chatService.getOrCreateConversation(participantId);
      addOrUpdateConversation(data.conversation);
      return data.conversation;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      throw err;
    }
  }, [addOrUpdateConversation]);

  // Socket: new message updates conversation list
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message) => {
      updateLastMessage(message.conversationId, message);
      if (message.sender._id !== user?._id) {
        incrementUnread(message.conversationId);
      }
    };

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
    return () => socket.off(SOCKET_EVENTS.NEW_MESSAGE, onNewMessage);
  }, [socket, user?._id]); // eslint-disable-line

  return {
    conversations,
    loadingConversations,
    unreadCounts,
    startConversation,
  };
};
