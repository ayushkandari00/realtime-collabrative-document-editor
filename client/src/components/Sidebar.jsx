import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FileText, Plus, Home, Users, LogOut, ChevronLeft, ChevronRight,
  Sparkles, Moon, Sun, Settings
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
    { path: '/dashboard', icon: Home, label: 'All Documents' },
    { path: '/dashboard?type=owned', icon: FileText, label: 'My Documents' },
    { path: '/dashboard?type=shared', icon: Users, label: 'Shared with Me' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && !location.search) return location.pathname === '/dashboard';
    return location.pathname + location.search === path;
  };

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-64'} h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 relative shrink-0`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10 text-slate-500 hover:text-primary-600"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="text-base font-bold text-gradient">CollabDocs</span>
            <div className="text-[10px] text-slate-400 font-medium">Real-time editing</div>
          </div>
        )}
      </div>

      {/* Create button */}
      <div className={`px-3 py-4 ${collapsed ? 'px-2' : ''}`}>
        <button
          onClick={handleCreateDocument}
          disabled={creating}
          className={`btn-primary w-full ${collapsed ? 'px-0 py-2.5 justify-center' : ''}`}
          title="Create New Document"
        >
          <Plus size={18} />
          {!collapsed && <span>{creating ? 'Creating...' : 'New Document'}</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-3 space-y-1 overflow-y-auto ${collapsed ? 'px-2' : ''}`}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? item.label : ''}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`border-t border-slate-100 dark:border-slate-800 p-3 space-y-1 ${collapsed ? 'px-2' : ''}`}>
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`nav-item w-full ${collapsed ? 'justify-center px-0' : ''}`}
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className={`nav-item w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center px-0' : ''}`}
          title="Logout"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User info */}
        {user && (
          <div className={`flex items-center gap-3 p-2 mt-2 rounded-xl bg-slate-50 dark:bg-slate-900 ${collapsed ? 'justify-center' : ''}`}>
            <UserAvatar name={user.name} size="sm" showOnline isOnline />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
