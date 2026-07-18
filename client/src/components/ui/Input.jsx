import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-gray-50 dark:bg-gray-800 border rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-200 dark:border-gray-700',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            inputClassName
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
