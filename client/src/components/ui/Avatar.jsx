import clsx from 'clsx';
import { getInitials, generateAvatarColor } from '../../utils/helpers';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const Avatar = ({ src, name, size = 'md', className = '', online }) => {
  const initials = getInitials(name);
  const bgColor = generateAvatarColor(name);

  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div
        className={clsx(
          'rounded-full flex items-center justify-center font-semibold overflow-hidden select-none',
          sizes[size]
        )}
        style={!src ? { backgroundColor: bgColor, color: '#fff' } : undefined}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.backgroundColor = bgColor;
              e.target.parentElement.textContent = initials;
            }}
          />
        ) : (
          initials
        )}
      </div>

      {/* Online indicator */}
      {online !== undefined && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900',
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
            online ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
