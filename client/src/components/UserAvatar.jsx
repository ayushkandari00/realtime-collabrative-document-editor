import { getInitials, getAvatarColor } from '../utils/helpers';

const UserAvatar = ({ name = '', size = 'md', showOnline = false, isOnline = false, className = '' }) => {
  const initials = getInitials(name);
  const gradient = getAvatarColor(name);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5 -bottom-0 -right-0',
    sm: 'w-2 h-2 bottom-0 right-0',
    md: 'w-2.5 h-2.5 bottom-0 right-0',
    lg: 'w-3 h-3 bottom-0.5 right-0.5',
    xl: 'w-4 h-4 bottom-1 right-1',
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white dark:ring-slate-900`}
        title={name}
      >
        {initials}
      </div>
      {showOnline && (
        <span
          className={`absolute ${dotSizes[size]} rounded-full ring-2 ring-white dark:ring-slate-900 ${
            isOnline ? 'bg-emerald-400 animate-pulse-dot' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
};

export default UserAvatar;
