import clsx from 'clsx';

const Skeleton = ({ className = '', lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse',
              i === lines - 1 ? 'w-3/4' : 'w-full',
              'h-4',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse',
        className
      )}
    />
  );
};

export const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <Skeleton className="h-4 w-32 mb-2 rounded" />
      <Skeleton className="h-3 w-48 rounded" />
    </div>
  </div>
);

export const MessageSkeleton = ({ sent = false }) => (
  <div className={clsx('flex items-end gap-2 mb-3', sent && 'flex-row-reverse')}>
    {!sent && <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />}
    <Skeleton
      className={clsx('h-10 rounded-2xl', sent ? 'w-40' : 'w-56')}
    />
  </div>
);

export default Skeleton;
