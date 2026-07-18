import { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from '../chat/MessageList';
import MessageInput from './MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import { SOCKET_EVENTS } from '../../utils/constants';

const ChatArea = ({ conversation, onBack }) => {
  const [replyTo, setReplyTo] = useState(null);
  const { typingUsers } = useChat();
  const { onlineUsers } = useSocket();

  const conversationId = conversation?._id;

  const {
    messages,
    hasMore,
    loadingMessages,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    markRead,
  } = useMessages(conversationId);

  // Get typing user names
  const typingUserIds = typingUsers[conversationId] || [];
  const typingNames = (conversation?.participants || [])
    .filter((p) => typingUserIds.includes(p._id))
    .map((p) => p.name);

  const handleSend = async (payload) => {
    await sendMessage(payload);
    markRead();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">
      <ChatHeader conversation={conversation} onBack={onBack} />

      <MessageList
        messages={messages}
        typingNames={typingNames}
        hasMore={hasMore}
        loading={loadingMessages}
        onLoadMore={loadMore}
        onReply={setReplyTo}
        onEdit={editMessage}
        onDelete={deleteMessage}
        onReaction={toggleReaction}
      />

      <MessageInput
        conversationId={conversationId}
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};

export default ChatArea;
