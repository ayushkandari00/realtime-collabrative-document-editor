import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Plus, Home, Users, LogOut, ChevronLeft, ChevronRight,
  PenLine, Moon, Sun, Settings, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';
import { documentService } from '../services/documentService';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleCreateDocument = async () => {
    setCreating(true);
    try {
      const { data } = await documentService.create({ title: 'Untitled Document' });
      toast.success('Document created!');
      navigate(`/document/${data.document._id}`);
    } catch {
      toast.error('Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const navItems = [
    { path: '/dashboard',             icon: Home,     label: 'All Documents' },
    { path: '/dashboard?type=owned',  icon: FileText, label: 'My Documents'  },
    { path: '/dashboard?type=shared', icon: Users,    label: 'Shared with Me'},
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && !location.search) return location.pathname === '/dashboard';
    return location.pathname + location.search === path;
  };

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-60'} h-screen bg-white dark:bg-ink-950 border-r border-ink-200 dark:border-ink-800 flex flex-col transition-all duration-250 relative shrink-0`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 w-6 h-6 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-card transition-all z-10 text-ink-400 hover:text-primary-600 dark:hover:text-primary-400"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>

      {/* Wordmark */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-ink-100 dark:border-ink-800 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
          <PenLine size={15} className="text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="leading-none">
            <span className="text-base font-bold tracking-tight text-ink-900 dark:text-ink-100">Cowrite</span>
            <div className="text-[10px] text-ink-400 font-medium mt-0.5">Collaborative editor</div>
          </div>
        )}
      </div>

      {/* New document button */}
      <div className={`p-3 ${collapsed ? 'px-2' : ''}`}>
        <button
          onClick={handleCreateDocument}
          disabled={creating}
          className={`btn-primary w-full ${collapsed ? 'px-0 py-2 justify-center' : 'py-2'}`}
          title="Create New Document"
        >
          <Plus size={16} strokeWidth={2.5} />
          {!collapsed && <span>{creating ? 'Creating…' : 'New Document'}</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-3 pt-1 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2' : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <item.icon size={16} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Divider */}
        <div className="my-2 border-t border-ink-100 dark:border-ink-800" />

        {/* Chat (de-emphasized) */}
        <Link
          to="/chat"
          className={`nav-item ${location.pathname === '/chat' ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Chat' : ''}
        >
          <MessageSquare size={16} className="shrink-0" />
          {!collapsed && <span>Chat</span>}
        </Link>
      </nav>

      {/* Bottom section */}
      <div className={`border-t border-ink-100 dark:border-ink-800 p-3 space-y-0.5 ${collapsed ? 'px-2' : ''}`}>
        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`nav-item w-full ${collapsed ? 'justify-center px-2' : ''}`}
          title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Settings */}
        <Link
          to="/settings"
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Settings' : ''}
        >
          <Settings size={16} />
          {!collapsed && <span>Settings</span>}
        </Link>

        {/* Logout */}
        <button
          onClick={logout}
          className={`nav-item w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center px-2' : ''}`}
          title="Logout"
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User info */}
        {user && (
          <Link
            to="/profile"
            className={`flex items-center gap-2.5 p-2 mt-2 rounded-lg bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? user.name : ''}
          >
            <UserAvatar name={user.name} size="sm" showOnline isOnline />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink-800 dark:text-ink-200 truncate">{user.name}</div>
                <div className="text-[10px] text-ink-500 truncate">{user.email}</div>
              </div>
            )}
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
