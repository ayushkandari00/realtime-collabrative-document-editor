import { useState } from 'react';
import { ArrowLeft, Bell, Moon, Shield, Info, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';

const SettingRow = ({ icon, title, description, action }) => (
  <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl">
    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    {action}
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span
      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Appearance</p>
          <SettingRow
            icon={<Moon className="w-4 h-4" />}
            title="Dark mode"
            description="Switch between light and dark theme"
            action={<Toggle checked={isDark} onChange={toggleTheme} />}
          />
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Notifications</p>
          <SettingRow
            icon={<Bell className="w-4 h-4" />}
            title="Push notifications"
            description="Get notified about new messages"
            action={<Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />}
          />
          <SettingRow
            icon={<Bell className="w-4 h-4" />}
            title="Sound alerts"
            description="Play a sound for incoming messages"
            action={<Toggle checked={sounds} onChange={() => setSounds(!sounds)} />}
          />
        </div>

        {/* Privacy */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Privacy</p>
          <SettingRow
            icon={<Shield className="w-4 h-4" />}
            title="Read receipts"
            description="Let others know when you've read their messages"
            action={<Toggle checked={readReceipts} onChange={() => setReadReceipts(!readReceipts)} />}
          />
        </div>

        {/* About */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">About</p>
          <SettingRow
            icon={<Info className="w-4 h-4" />}
            title="ChatApp v1.0.0"
            description="Real-time messaging with modern UI"
            action={<ChevronRight className="w-4 h-4 text-gray-300" />}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
