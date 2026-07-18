import clsx from 'clsx';

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  online: 'bg-green-500 text-white',
  offline: 'bg-gray-400 text-white',
};

const Badge = ({ children, variant = 'default', className = '', dot = false }) => {
  if (dot) {
    return (
      <span className={clsx('inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold', variants[variant], className)}>
        {children}
      </span>
    );
  }

  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;
