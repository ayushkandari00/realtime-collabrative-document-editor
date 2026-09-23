import { UserPlus, UserMinus, Save, RotateCcw } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const EVENT_CONFIG = {
  joined:   { icon: UserPlus,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  left:     { icon: UserMinus,  color: 'text-red-400',     bg: 'bg-red-50 dark:bg-red-900/20'         },
  saved:    { icon: Save,       color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
  restored: { icon: RotateCcw,  color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20'   },
};

const getMessage = (event) => {
  switch (event.type) {
    case 'joined':   return `${event.name} joined`;
    case 'left':     return `${event.name} left`;
    case 'saved':    return 'Document saved';
    case 'restored': return 'Version restored';
    default:         return event.message || 'Activity';
  }
};

const ActivityLog = ({ events = [] }) => {
  const recent = [...events].reverse().slice(0, 8);

  if (recent.length === 0) return null;

  return (
    <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
        <span className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">Activity</span>
      </div>
      <div className="p-3 space-y-1">
        {recent.map((event, i) => {
          const cfg = EVENT_CONFIG[event.type] || { icon: Save, color: 'text-ink-400', bg: 'bg-ink-100 dark:bg-ink-800' };
          const Icon = cfg.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 py-1 animate-fade-in">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <Icon size={10} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink-600 dark:text-ink-300 truncate">{getMessage(event)}</p>
              </div>
              <span className="text-[10px] text-ink-400 shrink-0">{formatDate(event.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityLog;
