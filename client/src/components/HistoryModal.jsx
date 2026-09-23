import { useState, useEffect } from 'react';
import { X, History, RotateCcw, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { documentService } from '../services/documentService';
import { formatFullDate } from '../utils/helpers';
import UserAvatar from './UserAvatar';
import toast from 'react-hot-toast';

const HistoryModal = ({ documentId, onClose, onRestore }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [confirmVersion, setConfirmVersion] = useState(null);

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
      setConfirmVersion(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <History size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Version History</h2>
              <p className="text-xs text-ink-400">{loading ? '…' : `${history.length} saved version${history.length !== 1 ? 's' : ''}`}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* History list */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-primary-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 px-6">
              <History size={36} className="text-ink-300 dark:text-ink-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-ink-500 mb-1">No versions saved yet</p>
              <p className="text-xs text-ink-400">History is saved automatically every few minutes.</p>
            </div>
          ) : (
            <div className="p-5">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-ink-200 dark:bg-ink-700" />

                <div className="space-y-1">
                  {history.map((version, idx) => (
                    <div key={version._id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2 top-3.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-ink-900 ${
                        idx === 0 ? 'bg-primary-500' : 'bg-ink-300 dark:bg-ink-600'
                      }`} />

                      <div className={`group rounded-xl border p-3.5 transition-all ${
                        confirmVersion === version.version
                          ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-ink-100 dark:border-ink-800 hover:border-ink-200 dark:hover:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800/40'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                idx === 0
                                  ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400'
                                  : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400'
                              }`}>
                                v{version.version}
                              </span>
                              {idx === 0 && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Latest</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-ink-500">
                              <Clock size={10} />
                              <span>{formatFullDate(version.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <UserAvatar name={version.savedBy?.name || ''} size="xs" />
                              <span className="text-xs text-ink-600 dark:text-ink-400 font-medium">
                                {version.savedBy?.name}
                              </span>
                              {version.wordCount > 0 && (
                                <span className="text-[10px] text-ink-400">{version.wordCount} words</span>
                              )}
                            </div>
                          </div>

                          {/* Restore */}
                          {confirmVersion === version.version ? (
                            <div className="flex flex-col gap-1 items-end shrink-0">
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                <AlertTriangle size={10} /> Replace current?
                              </p>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleRestore(version.version)}
                                  disabled={restoring === version.version}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary-600 text-white text-[11px] font-semibold hover:bg-primary-700 transition-colors"
                                >
                                  {restoring === version.version
                                    ? <Loader2 size={10} className="animate-spin" />
                                    : <RotateCcw size={10} />
                                  }
                                  Restore
                                </button>
                                <button
                                  onClick={() => setConfirmVersion(null)}
                                  className="px-2 py-1 rounded-md bg-ink-100 dark:bg-ink-700 text-ink-600 dark:text-ink-300 text-[11px] font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmVersion(version.version)}
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 text-xs font-semibold hover:bg-ink-200 dark:hover:bg-ink-700 transition-all"
                            >
                              <RotateCcw size={11} />
                              Restore
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
