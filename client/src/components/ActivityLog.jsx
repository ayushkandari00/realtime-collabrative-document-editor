import { Activity, UserPlus, UserMinus, Edit3, Save, RotateCcw } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ActivityLog = ({ events = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'joined': return <UserPlus size={12} className="text-emerald-500" />;
      case 'left': return <UserMinus size={12} className="text-red-400" />;
      case 'saved': return <Save size={12} className="text-blue-500" />;
      case 'restored': return <RotateCcw size={12} className="text-violet-500" />;
      default: return <Edit3 size={12} className="text-slate-400" />;
    }
  };

  const getMessage = (event) => {
    switch (event.type) {
      case 'joined': return `${event.name} joined`;
      case 'left': return `${event.name} left`;
      case 'saved': return 'Document saved';
      case 'restored': return 'Version restored';
      default: return event.message || 'Unknown event';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={15} className="text-primary-600 dark:text-primary-400" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Activity</h3>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-6">
            <Activity size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No activity yet</p>
          </div>
        ) : (
          [...events].reverse().map((event, i) => (
            <div key={i} className="flex items-start gap-2 py-1.5 animate-slide-up">
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600 dark:text-slate-300">{getMessage(event)}</p>
                <p className="text-[10px] text-slate-400">{formatDate(event.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
