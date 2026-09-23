import { Wifi, WifiOff, PenLine } from 'lucide-react';
import { generateUserColor } from '../utils/helpers';

const CollaboratorsList = ({ activeUsers = [], connected = false }) => {
  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 overflow-hidden bg-ink-50 dark:bg-ink-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
        <span className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
          Active Now
        </span>
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold ${connected ? 'text-emerald-500' : 'text-red-400'}`}>
          {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* User list */}
      <div className="p-3 space-y-1.5 max-h-52 overflow-y-auto">
        {activeUsers.length === 0 ? (
          <div className="flex items-center gap-2.5 py-2 px-1 text-xs text-ink-400">
            <PenLine size={13} className="text-ink-300 dark:text-ink-600 shrink-0" />
            Only you're here
          </div>
        ) : (
          activeUsers.map((u, i) => (
            <div
              key={u.socketId || i}
              className="flex items-center gap-2.5 px-1 py-1.5 rounded-lg animate-fade-in"
            >
              {/* Avatar with color ring */}
              <div className="relative shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ backgroundColor: u.color || generateUserColor(u.userId?.toString()) }}
                >
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                {/* Live pulse */}
                <span className="absolute -bottom-0 -right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-ink-900 animate-pulse-dot" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-ink-800 dark:text-ink-200 truncate">{u.name}</div>
                <div className="text-[10px] text-ink-400 truncate">editing</div>
              </div>
              {/* Color swatch */}
              <div
                className="w-2 h-2 rounded-full shrink-0 opacity-70"
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
