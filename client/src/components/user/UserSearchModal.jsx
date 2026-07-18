import { useState, useCallback } from 'react';
import { Search, X, MessageCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { userService } from '../../services/userService';
import { useSocket } from '../../context/SocketContext';
import { useEffect } from 'react';

// Simple inline debounce hook
function useDebounceValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const UserSearchModal = ({ isOpen, onClose, onSelect }) => {
  const { onlineUsers } = useSocket();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounceValue(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setUsers([]);
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const { data } = await userService.searchUsers(debouncedQuery);
        setUsers(data.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debouncedQuery]);

  const handleClose = () => {
    setQuery('');
    setUsers([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Message" size="sm">
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          autoFocus
          type="text"
          placeholder="Search by name or username…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="max-h-80 overflow-y-auto -mx-6 px-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length > 0 ? (
          users.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            return (
              <button
                key={u._id}
                onClick={() => onSelect(u._id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Avatar src={u.avatar} name={u.name} size="md" online={isOnline} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                </div>
                <MessageCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              </button>
            );
          })
        ) : debouncedQuery ? (
          <div className="text-center py-8 text-gray-400 text-sm">No users found</div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-sm">
            Start typing to search for users
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UserSearchModal;
