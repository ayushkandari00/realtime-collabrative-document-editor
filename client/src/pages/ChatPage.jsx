import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/layout/ChatArea';
import EmptyChat from '../components/layout/EmptyChat';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';
import { SOCKET_EVENTS } from '../utils/constants';
import clsx from 'clsx';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeConversation, setActiveConversation, setTyping, clearTyping } = useChat();
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [searchParams] = useSearchParams();

  // Enable notifications
  useNotifications();

  // Socket: typing events
  useEffect(() => {
    if (!socket) return;

    const onTyping = ({ conversationId, userId }) => {
      setTyping(conversationId, userId);
    };

    const onStopTyping = ({ conversationId, userId }) => {
      clearTyping(conversationId, userId);
    };

    socket.on(SOCKET_EVENTS.USER_TYPING, onTyping);
    socket.on(SOCKET_EVENTS.USER_STOP_TYPING, onStopTyping);

    return () => {
      socket.off(SOCKET_EVENTS.USER_TYPING, onTyping);
      socket.off(SOCKET_EVENTS.USER_STOP_TYPING, onStopTyping);
    };
  }, [socket, setTyping, clearTyping]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setMobileShowChat(true);
  };

  const handleBack = () => {
    setMobileShowChat(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={clsx(
          'flex-shrink-0 h-full border-r border-gray-100 dark:border-gray-800',
          'md:block',
          mobileShowChat ? 'hidden' : 'block w-full md:w-auto'
        )}
        style={{ width: '320px', minWidth: '320px' }}
      >
        <Sidebar
          activeConversationId={activeConversation?._id}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Main chat area */}
      <div
        className={clsx(
          'flex-1 h-full overflow-hidden',
          'md:block',
          mobileShowChat ? 'block' : 'hidden md:block'
        )}
      >
        {activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            onBack={handleBack}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
