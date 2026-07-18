import { Users, Wifi, WifiOff } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { generateUserColor } from '../utils/helpers';

const CollaboratorsList = ({ activeUsers = [], connected = false }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-primary-600 dark:text-primary-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Active Now
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <Wifi size={13} className="text-emerald-500" />
          ) : (
            <WifiOff size={13} className="text-red-400" />
          )}
          <span className={`text-[10px] font-semibold ${connected ? 'text-emerald-500' : 'text-red-400'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* User count badge */}
      {activeUsers.length > 0 && (
        <div className="flex items-center gap-1 mb-3">
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 5).map((u, i) => (
              <div
                key={u.socketId || i}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900"
                style={{ backgroundColor: u.color || generateUserColor(u.userId?.toString()) }}
                title={u.name}
              >
                {u.name?.charAt(0)?.toUpperCase()}
              </div>
            ))}
          </div>
          {activeUsers.length > 5 && (
            <span className="text-xs text-slate-500 ml-1">+{activeUsers.length - 5}</span>
          )}
          <span className="text-xs text-slate-500 ml-1">
            {activeUsers.length} editing
          </span>
        </div>
      )}

      {/* User list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {activeUsers.length === 0 ? (
          <div className="text-center py-6">
            <Users size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Only you're here</p>
          </div>
        ) : (
          activeUsers.map((u, i) => (
            <div
              key={u.socketId || i}
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-slide-in"
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900"
                  style={{ backgroundColor: u.color || generateUserColor(u.userId?.toString()) }}
                >
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="absolute -bottom-0 -right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse-dot" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
              </div>
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: u.color || generateUserColor(u.userId?.toString()) }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CollaboratorsList;
