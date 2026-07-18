import { X } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { truncateText } from '../../utils/helpers';

const ReplyPreview = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 mx-4 rounded-r-xl">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Replying to {message.sender?.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {message.isDeleted
            ? '🚫 Message deleted'
            : message.type === 'image'
            ? '📷 Image'
            : message.type === 'file'
            ? `📎 ${message.fileName}`
            : truncateText(message.content, 60)}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ReplyPreview;
