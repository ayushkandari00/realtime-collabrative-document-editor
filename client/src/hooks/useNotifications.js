import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { SOCKET_EVENTS } from '../utils/constants';

const notificationSound = new Audio('/sounds/notification.mp3');

export const useNotifications = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeConversation } = useChat();

  // Request browser notification permission on mount
  useEffect(() => {
    if (
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback(
    (message) => {
      // Don't notify if message is from self or user is in that conversation
      if (message.sender._id === user?._id) return;
      if (activeConversation?._id === message.conversationId) return;

      // Play sound
      notificationSound.play().catch(() => {});

      // Browser notification
      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted' &&
        document.hidden
      ) {
        new Notification(`${message.sender.name}`, {
          body: message.content || 'Sent you a message',
          icon: message.sender.avatar || '/favicon.svg',
          tag: message.conversationId,
        });
      }
    },
    [user?._id, activeConversation?._id]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, showNotification);
    return () => socket.off(SOCKET_EVENTS.NEW_MESSAGE, showNotification);
  }, [socket, showNotification]);
};
