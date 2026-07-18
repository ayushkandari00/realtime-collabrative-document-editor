import { useState, useEffect } from 'react';
import { X, History, RotateCcw, Loader2, Clock, User } from 'lucide-react';
import { documentService } from '../services/documentService';
import { formatFullDate } from '../utils/helpers';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';

const HistoryModal = ({ documentId, onClose, onRestore }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await documentService.getHistory(documentId);
        setHistory(data.history);
      } catch {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [documentId]);

  const handleRestore = async (version) => {
    if (!window.confirm(`Restore to version ${version}?`)) return;
    setRestoring(version);
    try {
      const { data } = await documentService.restoreVersion(documentId, version);
      toast.success('Version restored!');
      onRestore?.(data.document);
      onClose();
    } catch {
      toast.error('Failed to restore version');
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg p-6 animate-scale-in max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <History size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Version History</h2>
              <p className="text-xs text-slate-500">{history.length} saved versions</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={18} />
          </button>
        </div>

        {/* History list */}
        <div className="overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-primary-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <History size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No version history yet</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                History is saved automatically
              </p>
            </div>
          ) : (
            history.map((version) => (
              <div
                key={version._id}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    v{version.version}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={11} className="text-slate-400" />
                    <span className="text-xs text-slate-500">{formatFullDate(version.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserAvatar name={version.savedBy?.name || ''} size="xs" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {version.savedBy?.name}
                    </span>
                  </div>
                  {version.wordCount > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1">{version.wordCount} words</div>
                  )}
                </div>
                <button
                  onClick={() => handleRestore(version.version)}
                  disabled={restoring === version.version}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-semibold hover:bg-primary-100 transition-all"
                >
                  {restoring === version.version ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <RotateCcw size={12} />
                  )}
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
