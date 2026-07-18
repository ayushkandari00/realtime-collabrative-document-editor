import clsx from 'clsx';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:bg-indigo-400',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20',
  outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
};

const sizes = {
  xs: 'px-2 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-2xl',
  icon: 'p-2 rounded-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
