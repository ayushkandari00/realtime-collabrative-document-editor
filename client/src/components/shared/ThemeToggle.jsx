import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Tooltip from '../ui/Tooltip';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Tooltip content={isDark ? 'Switch to Light' : 'Switch to Dark'} side="bottom">
      <button
        onClick={toggleTheme}
        className={`p-2.5 rounded-xl transition-all duration-300 ${
          isDark
            ? 'bg-gray-800 text-amber-400 hover:bg-gray-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${className}`}
      >
        {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
