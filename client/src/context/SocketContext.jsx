import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
        setOnlineUsers([]);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    socket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('user-online', (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socket.on('user-offline', (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  const joinConversation = (conversationId) => {
    socketRef.current?.emit('join-conversation', conversationId);
  };

  const leaveConversation = (conversationId) => {
    socketRef.current?.emit('leave-conversation', conversationId);
  };

  const emitTyping = (conversationId) => {
    socketRef.current?.emit('typing', { conversationId });
  };

  const emitStopTyping = (conversationId) => {
    socketRef.current?.emit('stop-typing', { conversationId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        onlineUsers,
        joinConversation,
        leaveConversation,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export default SocketContext;
