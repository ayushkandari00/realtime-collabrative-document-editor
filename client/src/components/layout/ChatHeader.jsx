import { Phone, Video, Search, MoreVertical, ArrowLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import { formatLastSeen } from '../../utils/helpers';
import { useSocket } from '../../context/SocketContext';

const ChatHeader = ({ conversation, onBack }) => {
  const { onlineUsers } = useSocket();

  if (!conversation) return null;

  const other = conversation.otherParticipant || conversation.participants?.[0];
  if (!other) return null;

  const isOnline = onlineUsers.includes(other._id);

  return (
    <div className="flex-shrink-0 h-16 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Back button (mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="md:hidden flex-shrink-0"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      {/* Avatar + info */}
      <Avatar
        src={other.avatar}
        name={other.name}
        size="md"
        online={isOnline}
      />
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight truncate">
          {other.name}
        </h2>
        <p className={`text-xs leading-tight ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
          {isOnline ? 'Online' : formatLastSeen(other.lastSeen)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" title="Voice call (coming soon)">
          <Phone className="w-4.5 h-4.5" />
        </Button>
        <Button variant="ghost" size="icon" title="Video call (coming soon)">
          <Video className="w-4.5 h-4.5" />
        </Button>
        <Dropdown
          trigger={
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4.5 h-4.5" />
            </Button>
          }
          items={[
            { label: 'Search messages', icon: <Search className="w-4 h-4" />, onClick: () => {} },
            { label: 'View profile', icon: <Search className="w-4 h-4" />, onClick: () => {} },
          ]}
          align="right"
        />
      </div>
    </div>
  );
};

export default ChatHeader;
