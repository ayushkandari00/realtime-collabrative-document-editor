import { useState, useRef } from 'react';
import clsx from 'clsx';
import { Check, CheckCheck, Trash2, Edit3, Copy, Reply, MoreVertical, FileText, Download } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';
import EmojiPickerPopover from './EmojiPickerPopover';
import ReplyPreview from './ReplyPreview';
import { formatMessageTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '👏', '🔥'];

const MessageBubble = ({
  message,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  showAvatar = true,
}) => {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const inputRef = useRef(null);

  const isSent = message.sender?._id === user?._id || message.sender === user?._id;
  const isDeleted = message.isDeleted;

  const handleCopy = () => {
    if (message.content) navigator.clipboard.writeText(message.content);
  };

  const handleEditSave = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit?.(message._id, editText.trim());
    }
    setEditMode(false);
  };

  const dropdownItems = [
    { label: 'Reply', icon: <Reply className="w-4 h-4" />, onClick: () => onReply?.(message) },
    ...(!isDeleted && message.content
      ? [{ label: 'Copy', icon: <Copy className="w-4 h-4" />, onClick: handleCopy }]
      : []),
    ...(isSent && !isDeleted
      ? [
          { label: 'Edit', icon: <Edit3 className="w-4 h-4" />, onClick: () => { setEditMode(true); setEditText(message.content); } },
          { divider: true },
          { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => onDelete?.(message._id), danger: true },
        ]
      : []),
  ];

  return (
    <div
      className={clsx(
        'group flex items-end gap-2 mb-1 px-4 animate-slide-in-right',
        isSent ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Avatar */}
      {!isSent && showAvatar && (
        <Avatar
          src={message.sender?.avatar}
          name={message.sender?.name}
          size="sm"
          className="mb-1 flex-shrink-0"
        />
      )}
      {!isSent && !showAvatar && <div className="w-8 flex-shrink-0" />}

      <div className={clsx('flex flex-col gap-1 max-w-[70%]', isSent && 'items-end')}>
        {/* Sender name (for received messages) */}
        {!isSent && showAvatar && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
            {message.sender?.name}
          </span>
        )}

        {/* Reply preview */}
        {message.replyTo && !message.replyTo.isDeleted && (
          <div
            className={clsx(
              'px-3 py-1.5 rounded-xl text-xs border-l-2 border-indigo-400 bg-gray-100 dark:bg-gray-800 max-w-full',
              isSent ? 'items-end' : ''
            )}
          >
            <p className="font-semibold text-indigo-500">{message.replyTo.sender?.name}</p>
            <p className="text-gray-500 truncate">{message.replyTo.content || '📎 Attachment'}</p>
          </div>
        )}

        {/* Bubble */}
        <div className="relative">
          {editMode ? (
            <div className="flex gap-2 items-center">
              <input
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSave();
                  if (e.key === 'Escape') setEditMode(false);
                }}
                autoFocus
                className="flex-1 px-3 py-2 text-sm rounded-xl bg-gray-100 dark:bg-gray-700 border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={handleEditSave} className="text-indigo-500 hover:text-indigo-700 text-xs font-medium">Save</button>
              <button onClick={() => setEditMode(false)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
            </div>
          ) : (
            <div
              className={clsx(
                'px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words',
                isDeleted
                  ? 'italic text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700'
                  : isSent
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm rounded-bl-sm'
              )}
            >
              {/* Image */}
              {message.type === 'image' && message.fileUrl && !isDeleted && (
                <img
                  src={message.fileUrl}
                  alt="Image"
                  className="rounded-xl max-w-[280px] max-h-[280px] object-cover mb-1 cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(message.fileUrl, '_blank')}
                />
              )}

              {/* File */}
              {message.type === 'file' && message.fileUrl && !isDeleted && (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    'flex items-center gap-2 mb-1 hover:opacity-80 transition',
                    isSent ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'
                  )}
                >
                  <FileText className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm truncate max-w-[200px]">{message.fileName || 'File'}</span>
                  <Download className="w-4 h-4 ml-auto flex-shrink-0" />
                </a>
              )}

              {/* Text content */}
              {message.content && (
                <span>{isDeleted ? '🚫 This message was deleted' : message.content}</span>
              )}
            </div>
          )}

          {/* Hover actions */}
          {!isDeleted && !editMode && showReactions && (
            <div
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-xl px-1.5 py-1 border border-gray-100 dark:border-gray-700 z-10',
                isSent ? 'right-full mr-2' : 'left-full ml-2'
              )}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction?.(message._id, emoji)}
                  className="text-base hover:scale-125 transition-transform w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {emoji}
                </button>
              ))}
              <Dropdown
                trigger={
                  <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                }
                items={dropdownItems}
                align={isSent ? 'right' : 'left'}
              />
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions?.length > 0 && !isDeleted && (
          <div className="flex flex-wrap gap-1 px-1">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReaction?.(message._id, r.emoji)}
                className={clsx(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all',
                  r.users?.includes(user?._id)
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {r.emoji} <span>{r.users?.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time + status */}
        <div className={clsx('flex items-center gap-1 px-1', isSent && 'flex-row-reverse')}>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {formatMessageTime(message.createdAt)}
            {message.isEdited && !isDeleted && ' (edited)'}
          </span>
          {isSent && !isDeleted && (
            message.readBy?.length > 1
              ? <CheckCheck className="w-3.5 h-3.5 text-indigo-400" />
              : <Check className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
