import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { ConversationSkeleton } from '../ui/Skeleton';
import { groupMessagesByDate, formatDateDivider } from '../../utils/helpers';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

const MessageList = ({
  messages,
  typingNames,
  hasMore,
  loading,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const { sentinelRef } = useInfiniteScroll(onLoadMore, hasMore);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Preserve scroll position when prepending old messages
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const newScrollHeight = container.scrollHeight;
    if (prevScrollHeightRef.current > 0) {
      container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
    }
    prevScrollHeightRef.current = newScrollHeight;
  }, [messages.length]);

  const grouped = groupMessagesByDate(messages);

  if (loading && !messages.length) {
    return (
      <div className="flex-1 overflow-y-auto px-0 py-2 space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto py-2 scroll-smooth"
      style={{ scrollbarGutter: 'stable' }}
    >
      {/* Sentinel for infinite scroll (top) */}
      <div ref={sentinelRef} className="h-1" />

      {hasMore && (
        <div className="text-center py-2">
          <span className="text-xs text-gray-400 animate-pulse">Loading older messages…</span>
        </div>
      )}

      {/* Messages */}
      {grouped.map((item, index) => {
        if (item.type === 'date-divider') {
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <hr className="flex-1 border-gray-100 dark:border-gray-800" />
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800">
                {formatDateDivider(item.date)}
              </span>
              <hr className="flex-1 border-gray-100 dark:border-gray-800" />
            </div>
          );
        }

        const prevItem = grouped[index - 1];
        const prevMsg = prevItem?.type === 'date-divider' ? null : prevItem;
        const showAvatar = !prevMsg || prevMsg.sender?._id !== item.sender?._id;

        return (
          <MessageBubble
            key={item._id}
            message={item}
            showAvatar={showAvatar}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReaction={onReaction}
          />
        );
      })}

      {/* Typing indicator */}
      <TypingIndicator names={typingNames} />

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
