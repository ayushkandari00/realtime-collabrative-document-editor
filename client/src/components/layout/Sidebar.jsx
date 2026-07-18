import { useState } from 'react';
import { Search, Plus, Settings, LogOut, MessageSquare, Moon, Sun, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { ConversationSkeleton } from '../ui/Skeleton';
import Tooltip from '../ui/Tooltip';
import UserSearchModal from '../user/UserSearchModal';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import { useConversations } from '../../hooks/useConversations';
import { useTheme } from '../../context/ThemeContext';
import { formatConversationTime, getMessagePreview, truncateText } from '../../utils/helpers';
import clsx from 'clsx';

const Sidebar = ({ activeConversationId, onSelectConversation }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const { unreadCounts } = useChat();
  const { conversations, loadingConversations, startConversation } = useConversations();
  const { isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);

  const filtered = conversations.filter((c) => {
    const other = c.otherParticipant || c.participants?.[0];
    return other?.name?.toLowerCase().includes(search.toLowerCase()) ||
      other?.username?.toLowerCase().includes(search.toLowerCase());
  });

  const handleStartConversation = async (userId) => {
    try {
      const conv = await startConversation(userId);
      onSelectConversation(conv);
      setShowUserSearch(false);
    } catch {
      // handled inside hook
    }
  };

  return (
    <>
      <div className="sidebar flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-lg tracking-tight">ChatApp</span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip content={isDark ? 'Light mode' : 'Dark mode'} side="bottom">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </Tooltip>
            <Tooltip content="New chat" side="bottom">
              <button
                onClick={() => setShowUserSearch(true)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          <p className="px-5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Messages
          </p>

          {loadingConversations ? (
            Array.from({ length: 6 }).map((_, i) => <ConversationSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
              <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-400">
                {search ? 'No results found' : 'No conversations yet'}
              </p>
              {!search && (
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Start a new chat
                </button>
              )}
            </div>
          ) : (
            filtered.map((conv) => {
              const other = conv.otherParticipant || conv.participants?.find(p => p._id !== user?._id);
              const isOnline = onlineUsers.includes(other?._id);
              const unread = unreadCounts[conv._id] || conv.unreadCount || 0;
              const isActive = conv._id === activeConversationId;

              return (
                <button
                  key={conv._id}
                  onClick={() => onSelectConversation(conv)}
                  className={clsx(
                    'chat-item w-full text-left',
                    isActive && 'active'
                  )}
                >
                  <Avatar
                    src={other?.avatar}
                    name={other?.name}
                    size="md"
                    online={isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={clsx('text-sm font-medium truncate', unread > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300')}>
                        {other?.name}
                      </span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {formatConversationTime(conv.lastActivity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={clsx('text-xs truncate', unread > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-500')}>
                        {getMessagePreview(conv.lastMessage)}
                      </p>
                      {unread > 0 && (
                        <Badge variant="primary" dot className="ml-1 flex-shrink-0">
                          {unread > 99 ? '99+' : unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer - User profile */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/profile')} className="flex-shrink-0">
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="sm"
                online
              />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip content="Settings" side="top">
                <button
                  onClick={() => navigate('/settings')}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Logout" side="top">
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* User search modal */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelect={handleStartConversation}
      />
    </>
  );
};

export default Sidebar;
